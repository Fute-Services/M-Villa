# Reference Analysis — Greenz by Danube (Phase 0)

Reference: https://danube.discoverin360.com/Greenz_3/
Inspected: 2026-10-15, Chrome at 1920x1000 window (viewport 1540x732), plus 2 user-supplied screenshots (Home, Location map).

Legend: **[O]** observed directly · **[I]** inferred · **[U]** unknown / not yet inspected

## 0. Global findings

| # | Finding | Tag |
|---|---|---|
| G1 | The site is a single URL, not a multi-page site. All "pages" are scenes inside one viewer. URL never changes. | [O] |
| G2 | Built with **3DVista Virtual Tour** (`lib/tdvplayer.js`, `script.js`, `script_general.js`, `remote.3dvista.com/lib/tdvremote.js`). | [O] |
| G3 | No `<a>` links in the DOM. Navigation is entirely script-driven. | [O] |
| G4 | Page title: "Greenz By DANUBE". Loader text: "Loading your experience…". | [O] |
| G5 | Fonts: **PresicavRg-Bold** (menu labels, 14px), **Poppins** Regular/Medium/SemiBold (hub buttons 14px, some labels 16px), **Montserrat** Medium/SemiBold, **Exo** Medium. The `font-weight` computed value is 400 because weight is baked into the font-family name. | [O] |
| G6 | Brand: logo "Greenz by DANUBE" with a gold ginkgo-leaf mark, gold/cream gradient lettering. | [O] |
| G7 | Palette: translucent dark sage-green glass panels over imagery, white text, gold accents (logo, EXPLORE button), pill/rounded buttons. Exact hex values are not extracted. | [O] visual / [U] hex |
| G8 | Panels use a frosted-glass look (blur plus tinted translucent fill). | [I] (backdrop-filter not confirmed) |
| G9 | Third-party: Mapbox GL (map, satellite toggle, OSM attribution, Maxar), OpenWeather-style widget. | [O] |
| G10 | Assets (renders, video, logo, map icons) belong to the client. Per user: owned/licensed assets will be supplied. | [O] user statement |

## 1. Loader / intro screen

- Full-viewport blurred green background (blurred scene) while loading. [O]
- Centred portrait video card (about 490x700 at 1540x732), rounded corners, with a circular dark play button (~100px, white ring) at its centre. [O]
- Video content: a presenter, Hindi/English promo, with text overlays ("METRO STATION"). Contents are the client's media. [O]
- Below the video: cream/gold pill button with a pointer icon, labelled **EXPLORE** (appears when the video starts; before play it is blurred and unreadable). [O]
- Clicking the backdrop starts playback. Escape does not dismiss it. [O]
- A "Join Live Guided Session: Silent Mode Session (Webcam and Mic not allowed) – Connect" element exists in the DOM text. It was **not clicked** because it starts a live session. Its visible styling and trigger are unknown. [O] text / [U] UI
- EXPLORE leads to the Home scene. [O]
- Skip behaviour, video end behaviour, and mobile layout of the intro: [U]

## 2. Home scene (master-plan aerial)

- Full-bleed aerial render of the master plan (day). [O]
- **Right menu panel** (top-right, about 240px wide, inset about 12px from the edges, tall, rounded about 20px): [O]
  - Header: logo plus a circular chevron-up collapse button.
  - Six stacked rounded-rectangle buttons, each with an outline icon and an uppercase label in PresicavRg-Bold 14px: HOME, LOCATION, AMENITIES, STREET VIEW, INVENTORY, E-BROCHURE.
  - Contact card: phone icon with +971 800 57 57, danubeproperties.com, info@danubeproperties.ae.
  - Address card: pin icon with "Dubai | Abu Dhabi | Muscat | Riyadh | Bahrain | London | China | Mumbai | New Delhi | Gurugram | Kochi | Hyderabad".
  - Social icons: Facebook, Instagram, LinkedIn (targets [U]).
  - Bottom icon row of 4 circular controls (a day/sun toggle, people/guide, mute, chat/fullscreen — exact functions [U]).
  - The panel scrolls internally (thin scrollbar). [O]
  - Collapsing: after choosing a section the panel collapses to a small logo chip with a chevron-down; clicking the chip reopens it. [O]
- **Weather widget** (top-left, about 200x150): Thursday date, 08:35 time, "Dubai", sun icon, 32°, range 32~32°, "Clear Sky". Appears live (data source [U]). [O]
- **Bottom-centre toggle**: pill with two segments, "Day View" (active, lighter fill) and "Night View". [O] The Night View result was not captured. [U]
- Camera: the scene appears to be a still panorama image. Drag/zoom behaviour [U].
- Hover and transition effects: [U]

## 3. Location scene

From user screenshot 100355. Note the menu is open beside a large modal. [O]

- Large rounded modal, dark sage-green frame, with a white circular **close (X)** at its top-right. [O]
- Title in gold, letter-spaced caps: "GREENZ BY DANUBE — DISTANCES". [O]
- Mapbox map with a **MAP / SATELLITE** segmented toggle (Satellite active). Lat/long readout, zoom +/- and a compass/north button. [O]
- **Map legend** panel (bottom-left, dark glass): Major Road (4), Airport (1), Landmark (2), Shopping Mall (11), Restaurant (4), University (4), Entertainment (2), Park & Nature (1), Metro — Blue Line (1). Each has a circular icon and a count badge. [O]
- Round POI markers on the map; the project marker is a large green circle with the ginkgo logo. [O]
- Bottom-centre pill toggle: **Location** (active) / **Plot View**. [O]
- Marker click, popups, route lines, filter toggling by legend item: [U]
- Plot View contents: [U]

## 4. Amenities scene

- Full-bleed aerial render of the central amenities area, with the collapsed logo chip at top-right. [O]
- Left-bottom stack of pill buttons with outline icons: Wellness Hub, Greenz Sanctuary, Beach Hub, Sport Hub, Family Hub, and a "Hubs" expander with a chevron-down. [O]
- Each hub's destination (a panorama, image or video?): [U]. The "Hubs" expander behaviour: [U].

## 5. Street View scene

- Aerial master plan with green circular walker-icon hotspots at multiple points and red location pins in the centre. [O]
- Bottom-left mini-map card titled "Street View" with a back chevron and a small master-plan thumbnail with red dots. [O]
- Clicking a hotspot (likely enters a 360° street panorama): [U]. The menu stays open on this scene. [O]

## 6. Inventory scene

- Full-bleed exterior render of a townhouse with a menu open. [O]
- Left stack of pill buttons: 3 BHK TOWNHOUSE, 4 BHK TOWNHOUSE, 4 BHK TOWNHOUSE PREMIUM, 5 BHK SEMI DETACHED VILLA, 5 BHK TWIN VILLA, plus a "Types" expander. [O]
- Unit detail views (floor plans, areas, pricing, enquiry form): [U]

## 7. E-Brochure

- The menu button exists. My click did not produce an observable result (the menu simply scrolled), so the action is [U]. It is probably a PDF opening or downloading. [I] Downloading needs your permission, so it was not pursued.

## 8. Night View — [U]
Toggle is observed. The visual result was not captured. Please send a screenshot.

## 9. Responsive behaviour — [U]
Only the 1540x732 viewport was inspected. Tablet and mobile layouts are unknown. Please send phone screenshots (or confirm I may resize the window to 768 and 390 widths).

## 10. States
- Loading: blurred background and "Loading your experience…" [O].
- Empty/error states: [U].

## 11. Implementation implications (proposal only)
- React + Vite SPA with a `scene` state replacing 3DVista; images and video from your supplied assets.
- Components: Loader/IntroVideo, SideMenu (collapsible), WeatherWidget, DayNightToggle, LocationModal (Mapbox GL JS; needs your own Mapbox token), AmenityHubs, StreetViewMap, InventoryTypes.
- Tokens file for colours, fonts, radii. Fonts: Poppins and Montserrat from Google Fonts. PresicavRg-Bold is a licensed font, so a substitute is needed unless you supply it.

## 12. Open items I need from you
1. Screenshots: Night View, E-Brochure, any hub/unit detail, a street panorama, mobile layouts.
2. The asset files (images, logo, video, icons) and the PDF brochure.
3. A Mapbox token of your own, or approval to use MapLibre with open tiles instead.
4. The PresicavRg-Bold font file, or approval for a substitute.
