# Implementation Checklist and Phased Build Plan

Status: **DRAFT for approval. Nothing is built.**
Classification: **R** required · **O** optional · **D** dependent on unavailable information

Reference has a single URL (`/Greenz_3/`); each "page" below is a scene in one React SPA. In the new project, scenes are state-driven (hash routes such as `#/location` are optional, see P0.2).

## Shared components (used by every scene)

| Component | Class | Notes |
|---|---|---|
| SceneViewport (full-bleed image/video background, preload, cross-fade) | R | |
| SideMenu: logo, 6 buttons, contact card, address card, social icons, control row, collapse to logo chip, internal scroll | R | Social link targets and control-row functions D |
| WeatherWidget (Dubai, time, temp, condition) | R | Data source D: needs a weather API key or a static mock |
| DayNightToggle | R | Night assets D |
| PillButton / SegmentedToggle / CloseButton primitives | R | |
| Design tokens file | R | See `design-tokens.md`, awaiting approval |
| Responsive shell (menu becomes a drawer on mobile) | R | Behaviour D until mobile screenshots |
| Accessibility (focus rings, aria labels, keyboard nav, reduced motion) | R | |
| Audio mute toggle | O | Audio file D |

## Scene checklist

### 1. Loader and intro (`/`, entry)
- **Purpose:** preload, play a promo video, then EXPLORE enters Home.
- **Unique:** blurred background, portrait video card, play button, EXPLORE CTA, "Join Live Guided Session / Connect" block (R for layout; **D** for behaviour: live-session backend not to be copied, so build a disabled or mock button).
- **Assets:** intro video (D: yours), poster frame (D), background blur image.
- **Interactions:** click backdrop/play to start video, EXPLORE appears, enters Home. Skip at video end [D].
- **Responsive:** D.
- **Backend:** none for R scope.
- **Tests:** video plays, EXPLORE navigates, no autoplay-with-sound violations.

### 2. Home (master-plan aerial)
- **Unique:** aerial render, weather widget, Day/Night pill, full menu.
- **Assets:** day aerial (D), night aerial (D), logo, icons (O: can use open icon set matching style).
- **Interactions:** Day/Night swap, menu navigation, panel collapse/expand. Camera pan/zoom [D].
- **Backend:** weather [D].
- **Tests:** toggle switches image, menu state persists across scenes.

### 3. Location
- **Unique:** modal with Mapbox/MapLibre map, Map/Satellite toggle, lat/long readout, zoom/compass, legend with counts, POI markers, Location/Plot View toggle, close button.
- **Assets:** POI category icons (D), POI data list (D: names, coordinates, distances), project marker.
- **Interactions:** legend filtering [D], marker popups [D], Plot View contents [D], close returns Home.
- **Backend:** map tiles (needs your Mapbox token or MapLibre); no private API.
- **Responsive:** legend collapses on mobile [D].
- **Tests:** map renders, toggles work, close works, markers filtered.

### 4. Amenities
- **Unique:** amenities aerial, bottom-left stack: Wellness Hub, Greenz Sanctuary, Beach Hub, Sport Hub, Family Hub, "Hubs" expander.
- **Assets:** amenities render (D), a render or panorama per hub (D).
- **Interactions:** hub click opens its view [D: unseen], expander toggles list.
- **Tests:** each hub opens, expander works.

### 5. Street View
- **Unique:** master plan with walker hotspots and red pins, mini-map card with back chevron.
- **Assets:** street panoramas per hotspot (D), hotspot coordinates (D).
- **Interactions:** hotspot opens a 360° panorama [D: unseen]; mini-map navigates. A 360° viewer (e.g. Pannellum, open source) [R if panoramas supplied].
- **Tests:** hotspot to panorama and back.

### 6. Inventory
- **Unique:** townhouse render, type list: 3 BHK Townhouse, 4 BHK Townhouse, 4 BHK Townhouse Premium, 5 BHK Semi Detached Villa, 5 BHK Twin Villa, "Types" expander.
- **Assets:** render per type (D), floor plans (D), specs (D).
- **Interactions:** select type to detail view [D: unseen], possible enquiry form [D].
- **Backend:** enquiry submission [D]; if included, use a mock endpoint, never the client's.
- **Tests:** each type opens, expander works.

### 7. E-Brochure
- **Purpose:** probably opens/downloads a PDF [D, unconfirmed].
- **Assets:** PDF (D).
- **Tests:** link opens the file.

### 8. Night View (state of Home, possibly of every scene)
- Assets (D), behaviour on non-Home scenes (D).

## Phased build plan

| Phase | Scope | Depends on | Exit criteria |
|---|---|---|---|
| P0 | Analysis (done), tokens, checklist; get approval; gather missing assets and screenshots | none | You approve docs |
| P1 | Vite + React + TS scaffold, token CSS, fonts, SceneViewport, scene state/router, lint/test setup | P0 approval | Dev server runs, blank scene switching works |
| P2 | SideMenu and primitives (all states, collapse chip, scroll) | P1, tokens approved | Matches reference at 1540x732 |
| P3 | Loader/intro and Home (Day/Night, weather) | P2, intro video + aerials | Side-by-side visual match |
| P4 | Location (map, legend, markers) | P2, POI data, map token | Map interactions match video |
| P5 | Amenities and hub views | P3, hub assets | All 5 hubs open |
| P6 | Street View (hotspots, mini-map, 360 viewer) | P3, panoramas | Hotspot flow works |
| P7 | Inventory and unit details, E-Brochure | P3, unit assets/PDF | All types open |
| P8 | Responsive pass (tablet, mobile), accessibility, reduced motion | P3–P7, mobile screenshots | Passes at 1280/1024/768/390 |
| P9 | QA: Playwright visual and interaction tests, Lighthouse, cross-browser, README | all | All tests green |

Phases P4–P7 can run in parallel once P2 and P3 are done.

## Open questions blocking phases
1. Walkthrough video or screenshots (P3–P8).
2. Asset files, POI data, hub and unit content (P3–P7).
3. Map provider and token (P4).
4. Font: PresicavRg-Bold file or substitute (P2).
5. Is the live-guided-session block in scope? If so, mock only (P3).
6. Hash routes per scene, or a single URL like the original (P1).
