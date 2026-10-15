"""Download the whole reference tour at original (level 0) quality into the project's public/ folder.

usage: fetch_all.py <phase> [phase...]   phases: static | flat | cube | manifest
Resumable: existing output files are skipped.
"""
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

SCRATCH = os.path.dirname(os.path.abspath(__file__))
PUBLIC = r"C:\Users\FS175\Documents\M-Villa\public"
MANIFEST = r"C:\Users\FS175\Documents\M-Villa\src\data\panoramas.json"
BASE = "https://danube.discoverin360.com/Greenz_3"
TILE = 512
WORKERS = 6

script = open(os.path.join(SCRATCH, "ref", "script_general.js"), encoding="utf-8", errors="ignore").read()
locale = open(os.path.join(SCRATCH, "ref", "fr.txt"), encoding="utf-8", errors="ignore").read()
LABELS = dict(re.findall(r"^panorama_([0-9A-F_]{36})\.label = (.*)$", locale, re.M))
LABELS = {k: v.strip() for k, v in LABELS.items()}


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def slug_for(pid):
    return f"{slugify(LABELS.get(pid, 'pano'))}-{pid[:4].lower()}"


def http_get(url, tries=5):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code in (403, 404):
                return None
            time.sleep(0.6 * (attempt + 1))
        except Exception:
            time.sleep(0.6 * (attempt + 1))
    return None


def tile_image(url):
    data = http_get(url)
    return Image.open(io.BytesIO(data)).convert("RGB") if data else None


def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


# ----------------------------------------------------------------------------- static files
def phase_static():
    paths = [p for p in open(os.path.join(SCRATCH, "static_list.txt")).read().split("\n") if p]
    # Already stored under semantic names in public/brochure|fonts|media; skip the full-size album slides.
    paths = [p for p in paths if not re.match(r"media/album_.*_\d+\.webp$", p)]
    paths = [p for p in paths if "/f/5/0_0.webp" not in p]
    # Also mirror every skin image captured during the live session.
    skin_dir = os.path.join(SCRATCH, "assets", "skin")
    local_skin = [f"skin/{f}" for f in os.listdir(skin_dir)]
    for p in local_skin:
        if p not in paths:
            paths.append(p)

    def one(p):
        out = os.path.join(PUBLIC, "tour", p.replace("/", os.sep))
        if os.path.exists(out) and os.path.getsize(out) > 0:
            return 0
        local = os.path.join(SCRATCH, "assets", p.replace("/", os.sep))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        if os.path.exists(local):
            with open(local, "rb") as src, open(out, "wb") as dst:
                dst.write(src.read())
            return 1
        data = http_get(f"{BASE}/{p.replace(' ', '%20')}")
        if data is None:
            log(f"static MISSING {p}")
            return 0
        with open(out, "wb") as f:
            f.write(data)
        return 1

    with ThreadPoolExecutor(WORKERS) as ex:
        n = sum(ex.map(one, paths))
    log(f"static done: {n} new files of {len(paths)}")


# ----------------------------------------------------------------------------- flat panoramas
def parse_flat_levels():
    pat = re.compile(
        r'"url":"media/panorama_([0-9A-F_]{36})_0/f/(\d+)/\{row\}_\{column\}\.webp","width":(\d+),"class":"TiledImageResourceLevel","rowCount":(\d+),"height":(\d+),"colCount":(\d+)'
    )
    levels = {}
    for pid, lvl, w, rows, h, cols in pat.findall(script):
        levels.setdefault(pid, {})[int(lvl)] = dict(w=int(w), h=int(h), rows=int(rows), cols=int(cols))
    return levels


def stitch_range(pid, lvl, info, r0, r1, c0, c1):
    jobs = [(r, c) for r in range(r0, r1 + 1) for c in range(c0, c1 + 1)]
    canvas = Image.new("RGB", ((c1 - c0 + 1) * TILE, (r1 - r0 + 1) * TILE))
    with ThreadPoolExecutor(WORKERS) as ex:
        tiles = list(ex.map(lambda rc: tile_image(f"{BASE}/media/panorama_{pid}_0/f/{lvl}/{rc[0]}_{rc[1]}.webp"), jobs))
    for (r, c), im in zip(jobs, tiles):
        if im is not None:
            canvas.paste(im, ((c - c0) * TILE, (r - r0) * TILE))
    return canvas


def phase_flat():
    levels = parse_flat_levels()
    out_dir = os.path.join(PUBLIC, "panoramas", "flat")
    os.makedirs(out_dir, exist_ok=True)
    meta_path = os.path.join(SCRATCH, "flat_meta.json")
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
    for pid, lv in sorted(levels.items()):
        slug = slug_for(pid)
        out = os.path.join(out_dir, f"{slug}.jpg")
        if os.path.exists(out) and pid in meta:
            continue
        top = max(lv)
        # Coarsest level with a manageable grid to find the content box.
        # Missing tiles (HTTP 403) are all-black areas, and some levels are not populated: walk from the
        # coarsest level with at least a 4x4 grid upward until content is found.
        box = None
        candidates = sorted((l for l in lv if lv[l]["rows"] >= 4), key=lambda l: lv[l]["rows"])
        for coarse in candidates:
            ci = lv[coarse]
            if ci["rows"] > 14:
                break
            comp = stitch_range(pid, coarse, ci, 0, ci["rows"] - 1, 0, ci["cols"] - 1)
            box = comp.convert("L").point(lambda v: 255 if v > 14 else 0).getbbox()
            if box:
                break
        if not box:
            log(f"flat {slug}: no content found at coarse levels, skipping")
            continue
        fx0, fy0, fx1, fy1 = box[0] / comp.width, box[1] / comp.height, box[2] / comp.width, box[3] / comp.height
        l0 = lv[0]
        m = 2
        c0 = max(int(fx0 * l0["cols"]) - m, 0)
        c1 = min(int(fx1 * l0["cols"]) + m, l0["cols"] - 1)
        r0 = max(int(fy0 * l0["rows"]) - m, 0)
        r1 = min(int(fy1 * l0["rows"]) + m, l0["rows"] - 1)
        log(f"flat {slug}: L0 {l0['w']}px, fetching {(c1 - c0 + 1) * (r1 - r0 + 1)} tiles")
        region = stitch_range(pid, 0, l0, r0, r1, c0, c1)
        ex0, ey0, ex1, ey1 = region.convert("L").point(lambda v: 255 if v > 14 else 0).getbbox()
        ix, iy = int((ex1 - ex0) * 0.012), int((ey1 - ey0) * 0.02)
        ex0, ey0, ex1, ey1 = ex0 + ix, ey0 + iy, ex1 - ix, ey1 - iy
        crop = region.crop((ex0, ey0, ex1, ey1))
        crop.save(out, "JPEG", quality=92, subsampling=0, optimize=True)
        face_w, face_h = l0["cols"] * TILE, l0["rows"] * TILE
        ax0, ay0 = c0 * TILE + ex0, r0 * TILE + ey0
        meta[pid] = {
            "id": pid,
            "slug": slug,
            "label": LABELS.get(pid, ""),
            "file": f"/panoramas/flat/{slug}.jpg",
            "size": [crop.width, crop.height],
            "faceSize": [face_w, face_h],
            "cropFrac": [ax0 / face_w, ay0 / face_h, (ax0 + crop.width) / face_w, (ay0 + crop.height) / face_h],
        }
        json.dump(meta, open(meta_path, "w"), indent=1)
        log(f"flat saved {slug} {crop.size}")
    log("flat done")


# ----------------------------------------------------------------------------- cube panoramas
def parse_cube_levels():
    pat = re.compile(
        r'"url":"media/panorama_([0-9A-F_]{36})_0/\{face\}/(\d+)/\{row\}_\{column\}\.webp","width":(\d+),"class":"TiledImageResourceLevel","rowCount":(\d+),"height":(\d+),"colCount":(\d+)'
    )
    levels = {}
    for pid, lvl, w, rows, h, cols in pat.findall(script):
        levels.setdefault(pid, {})[int(lvl)] = dict(w=int(w), h=int(h), rows=int(rows), cols=int(cols))
    return levels


FACES = "frblud"


def phase_cube():
    levels = parse_cube_levels()
    out_root = os.path.join(PUBLIC, "panoramas", "cube")
    done = 0
    for pid, lv in sorted(levels.items(), key=lambda kv: LABELS.get(kv[0], "")):
        slug = slug_for(pid)
        d = os.path.join(out_root, slug)
        if all(os.path.exists(os.path.join(d, f"{f}.webp")) for f in FACES):
            done += 1
            continue
        os.makedirs(d, exist_ok=True)
        l0 = lv[0]
        face_px = l0["h"]
        cols = l0["cols"] // 6
        rows = l0["rows"]
        jobs = [(f, r, c) for f in FACES for r in range(rows) for c in range(cols)]
        with ThreadPoolExecutor(WORKERS) as ex:
            tiles = list(ex.map(lambda j: tile_image(f"{BASE}/media/panorama_{pid}_0/{j[0]}/0/{j[1]}_{j[2]}.webp"), jobs))
        canvases = {f: Image.new("RGB", (cols * TILE, rows * TILE)) for f in FACES}
        missing = 0
        for (f, r, c), im in zip(jobs, tiles):
            if im is None:
                missing += 1
            else:
                canvases[f].paste(im, (c * TILE, r * TILE))
        for f, cv in canvases.items():
            cv.crop((0, 0, face_px, face_px)).save(os.path.join(d, f"{f}.webp"), "WEBP", quality=90, method=4)
        done += 1
        log(f"cube {done}/{len(levels)} {slug} face {face_px}px missing {missing}")
    log("cube done")


# ----------------------------------------------------------------------------- manifest
def phase_manifest():
    meta = json.load(open(os.path.join(SCRATCH, "flat_meta.json")))
    cubes = parse_cube_levels()
    cube_list = []
    for pid, lv in cubes.items():
        slug = slug_for(pid)
        cube_list.append(
            {
                "id": pid,
                "slug": slug,
                "label": LABELS.get(pid, ""),
                "faceSize": lv[0]["h"],
                "path": f"/panoramas/cube/{slug}",
                "available": all(os.path.exists(os.path.join(PUBLIC, "panoramas", "cube", slug, f"{f}.webp")) for f in FACES),
            }
        )
    cube_list.sort(key=lambda c: c["label"])
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    json.dump({"flat": sorted(meta.values(), key=lambda m: m["label"]), "cube": cube_list}, open(MANIFEST, "w"), indent=1)
    log(f"manifest written: {len(meta)} flat, {len(cube_list)} cube")


if __name__ == "__main__":
    for ph in sys.argv[1:]:
        globals()[f"phase_{ph}"]()

