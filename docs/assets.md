# Assets taken from the reference tour

Per the project owner's instruction, media was downloaded from https://danube.discoverin360.com/Greenz_3/ (the owner stated they hold the rights). They are local copies for this learning project; do not redistribute.

| Project file | Source in the reference | Notes |
|---|---|---|
| `public/scenes/home-day.jpg` | `panorama_06000260_…` (flat panorama, level 0 tiles) | Stitched and cropped from 512px tiles, 3890x2190 |
| `public/scenes/home-night.jpg` | `panorama_00ED6507_…` | Night view |
| `public/scenes/amenities-day.jpg` | `panorama_9A71A562_…` | 5763x3220 |
| `public/scenes/inventory-day.jpg` | `panorama_AFC8F454_…` | 5627x3149 |
| `public/media/intro.mp4`, `intro-poster.jpg` | `media/video_19557A4A_…_fr.mp4` and poster | 43 MB |
| `public/brochure/slide-00…35.webp` | `media/album_6AAECD2A_…_0…35.webp` | E-Brochure slides, 1600x900 |
| `public/brand/logo.png` | `skin/Image_5A1D37D0_…` | Greenz by Danube logo |
| `public/icons/*.png` | `skin/*` | Menu, hub, social and control icons |
| `public/fonts/*.woff2` | `fonts/*` | PresicavRg-Bold, Poppins, Montserrat |

## Not included yet
- **Street View panoramas.** The reference has about a dozen six-face 360° cube panoramas. The Street View scene here still opens a placeholder card per hotspot. Showing them needs a cube-map viewer plus stitching each face.
- **Night variants** of Amenities and Inventory (none were found in the tour).
- **Hub-to-slide mapping** (Wellness to slide 14, and so on) is matched by slide title, not taken from the live site.
- **Weather**: the reference calls a weather API; this project shows a static demo value.
- **Location map**: the reference uses Mapbox; this project uses a static stand-in.
