"""Build the tour's navigation graph from script_general.js -> src/data/tour-graph.json."""
import json
import re

t = open("ref/script_general.js", encoding="utf-8", errors="ignore").read()
ID = r"[0-9A-F]{8}_[0-9A-F]{4}_[0-9A-F]{4}_[0-9A-F]{4}_[0-9A-F]{12}"

# overlay id -> (yaw, pitch) of its first image item
overlay_pos = {}
for m in re.finditer(r'"items":\[\{"yaw":(-?[\d.]+),(.{0,400}?)"pitch":(-?[\d.]+)(.{0,300}?)\}\],"maps":\[\],"id":"(overlay_%s)"' % ID, t):
    overlay_pos[m.group(5)] = (float(m.group(1)), float(m.group(3)))

camera = {}
for m in re.finditer(r'"initialPosition":\{"hfov":([\d.]+),"class":"PanoramaCameraPosition","pitch":(-?[\d.]+),"yaw":(-?[\d.]+)\},"class":"PanoramaCamera","id":"panorama_(%s)_camera"' % ID, t):
    camera[m.group(4)] = dict(hfov=float(m.group(1)), pitch=float(m.group(2)), yaw=float(m.group(3)))


def enclosing_object(text, pos):
    """Return (start, end) of the innermost {...} object containing pos, ignoring braces inside strings."""
    depth = 0
    i = pos
    in_str = False
    # scan backwards for the opening brace (approximate string handling: count quotes backwards)
    while i > 0:
        i -= 1
        c = text[i]
        if c == '"' and text[i - 1] != "\\":
            in_str = not in_str
        if in_str:
            continue
        if c == "}":
            depth += 1
        elif c == "{":
            if depth == 0:
                break
            depth -= 1
    start = i
    depth = 0
    in_str = False
    j = start
    while j < len(text):
        c = text[j]
        if c == '"' and text[j - 1] != "\\":
            in_str = not in_str
        elif not in_str:
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return start, j + 1
        j += 1
    return start, len(text)


graph = {}
for m in re.finditer(r"trans\('panorama_(%s)\.label'\)" % ID, t):
    pid = m.group(1)
    if pid in graph:
        continue
    s, e = enclosing_object(t, m.start())
    obj = t[s:e]
    if '"class":"Panorama"' not in obj[:200000]:
        continue
    links = []
    a = obj.find('"adjacentPanoramas":[')
    if a >= 0:
        i = obj.find("[", a)
        depth = 0
        for j in range(i, len(obj)):
            if obj[j] == "[":
                depth += 1
            elif obj[j] == "]":
                depth -= 1
                if depth == 0:
                    break
        try:
            arr = json.loads(obj[i : j + 1])
        except Exception:
            arr = []
        seen = {}
        for adj in arr:
            target = re.search(r"panorama_(%s)" % ID, adj.get("panorama", ""))
            ov = adj.get("data", {}).get("overlayID")
            if not target:
                continue
            yaw, pitch = overlay_pos.get(ov, (adj.get("yaw", 0.0), 0.0))
            seen.setdefault(target.group(1), []).append((yaw, pitch))
        for tid, pts in seen.items():
            links.append({"target": tid, "yaw": round(sum(p[0] for p in pts) / len(pts), 2), "pitch": round(sum(p[1] for p in pts) / len(pts), 2)})
    graph[pid] = {"camera": camera.get(pid), "links": links}

json.dump(graph, open(r"C:\Users\FS175\Documents\M-Villa\src\data\tour-graph.json", "w"), indent=1)
print("panoramas", len(graph), "with links", sum(1 for g in graph.values() if g["links"]), "cameras", len(camera), "overlay positions", len(overlay_pos))
aerial = graph.get("85057B3E_98FF_9E1E_41DB_33935AA7F3BE", {"links": []})
print("aerial links", len(aerial["links"]))
