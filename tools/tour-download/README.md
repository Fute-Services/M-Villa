# Tour download tools

Scripts used to pull the reference tour's panoramas into `public/` at original (level 0) quality.

- `fetch_all.py <phase>`: phases `static`, `flat`, `cube`, `manifest`. Resumable; existing files are skipped.
  Needs Python 3 with Pillow (`pip install pillow`). Paths at the top of the file point at this project.
- `parse_graph.py`: rebuilds `src/data/tour-graph.json` (street-point links, start cameras) from `ref/script_general.js`.
- `ref/`: the tour's own data files the scripts read.

## Status

- Done: static files, 9 of 10 flat panoramas (`public/panoramas/flat`), navigation graph, manifest.
- Not done: the 89 cube (360°) panoramas and the large "family" flat panorama. The reference server stopped
  answering requests from this machine mid-download (connection timeouts, including the home page), so the cube
  download could not finish. Run `python fetch_all.py cube manifest` later; keep `WORKERS` low (4 to 6) to be polite.
- 403 responses from the server mean "file not served" (blank tiles, thumbnails) and are skipped on purpose.
