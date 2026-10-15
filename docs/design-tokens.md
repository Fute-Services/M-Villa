# Design-Token Specification — Greenz by Danube

Status: **DRAFT, awaiting approval. Nothing is implemented.**
Legend: **[M]** measured from the live DOM · **[O]** observed visually in screenshots · **[E]** estimate, to be confirmed against assets/video · **[U]** unknown

Viewport used: 1540x732 (desktop). Tablet/mobile values are [U] until you supply screenshots.

## 1. Colour

No hex values could be read from the DOM (fills live on child elements/images set by 3DVista), so all colours are visual estimates and must be eyedropped from your assets.

| Token | Value | Tag | Usage |
|---|---|---|---|
| `--color-text` | `#FFFFFF` | [M] (rgb 255,255,255 on menu/hub labels) | All UI text |
| `--color-panel` | approx `rgba(70,95,80,0.65)` | [E] | Menu panel, hub buttons, legend (sage-green glass) |
| `--color-panel-solid` | approx `#3F5A4B` | [E] | Location modal frame |
| `--color-btn-fill` | approx `rgba(255,255,255,0.12)` | [E] | Menu buttons on the panel |
| `--color-btn-active` | approx `rgba(255,255,255,0.25)` | [E] | Active Day View / Location segment |
| `--color-gold` | approx `#C9A24B` | [E] | Logo, map title "GREENZ BY DANUBE — DISTANCES" |
| `--color-gold-cta` | approx `#E8D9A8` to `#C9B070` gradient | [E] | EXPLORE button |
| `--color-dark-glass` | approx `rgba(15,25,20,0.88)` | [E] | Map legend, map toggle |
| `--color-marker-green` | approx `#1F5A2E` | [E] | Street View hotspots, project marker |
| `--color-pin-red` | approx `#D93A2E` | [E] | Street View pins, plot outline on renders |
| `--color-close-bg` | `#FFFFFF` on dark | [O] | Map close button |

## 2. Typography

| Token | Value | Tag |
|---|---|---|
| `--font-menu` | `PresicavRg-Bold` (licensed; substitute needed) | [M] |
| `--font-ui` | `Poppins` (Medium 14px hub labels; SemiBold 16px labels) | [M] |
| `--font-alt` | `Montserrat` (Medium, SemiBold), `Exo` Medium | [M] loaded; usage [U] |
| Menu label | 14px, uppercase, 400 (weight baked into font), letter-spacing normal | [M] |
| Hub / type button label | 14px Poppins Medium | [M] |
| Section label | 16px Poppins SemiBold | [M] |
| Map title | approx 24px, caps, wide letter-spacing (about 0.15em), gold | [E] |
| Weather temperature | approx 36px; time approx 24px | [E] |
| Line heights | not measured; menu label box 17px high for 14px type | [M] (approx 1.2) |

## 3. Spacing and layout

| Token | Value | Tag |
|---|---|---|
| Edge inset (panel from viewport) | 12px top, 12px right | [M] |
| Menu panel size | 257 x 705 (in a 1540 x 732 viewport; effectively full height minus 24px) | [M] |
| Menu button | approx 223 x 60, gap approx 10px | [E] |
| Hub button | 210 x 39 | [M] |
| Hub button gap | approx 10px (stack of 6) | [E] |
| Hub stack inset | 10px from left, bottom aligned about 60px from the bottom | [M]/[E] |
| Weather widget | approx 200 x 150 at top-left, 10px inset | [E] |
| Day/Night pill | approx 290 x 50, bottom-centre, 15px above the bottom | [E] |
| Content width | none; full-bleed scenes; overlays are absolutely positioned | [O] |

Spacing scale proposal (base 4px): 4, 8, 10, 12, 16, 24, 32. [E]

## 4. Borders, radii, shadows, glass

| Token | Value | Tag |
|---|---|---|
| `--radius-panel` | 16px (menu panel) | [M] |
| `--radius-btn` | 16px (hub buttons); menu buttons approx 12px | [M] / [E] |
| `--radius-pill` | 999px (toggle pill, EXPLORE, hub pills appear fully round) | [O] |
| `--radius-modal` | approx 20px (Location modal) | [E] |
| `--blur-panel` | `blur(20px)` | [M] |
| `--blur-btn` | `blur(10px)` | [M] |
| Border | 1px translucent white (approx `rgba(255,255,255,0.25)`) | [E] |
| Shadow | soft drop shadow under panels | [E] |
| Dividers | none observed | [O] |

## 5. Components

| Component | Observed spec | Tag |
|---|---|---|
| Menu button | icon (outline, 22px) + uppercase label, translucent rounded fill, hover/active states unknown | [O]; states [U] |
| Hub / type pill | icon + label, glass, left stack; chevron expander "Hubs"/"Types" | [O] |
| Segmented toggle | two segments, active segment lighter fill (Day/Night, Map/Satellite, Location/Plot View) | [O] |
| CTA (EXPLORE) | cream/gold pill, pointer icon, dark text | [O] |
| Play button | approx 100px circle, dark fill, white ring and triangle | [O] |
| Close button | white circle, dark X, approx 60px | [O] |
| Legend row | circular icon, label, count badge | [O] |
| Map marker | approx 44px dark circle with a coloured icon | [O] |
| Hotspot | green circle with a walker icon, approx 24–50px | [O] |
| Input fields, tables, charts, cards | none observed in inspected scenes | [O] absent; enquiry form [U] |

## 6. Responsive breakpoints
All [U]. I will propose 1280 / 1024 / 768 / 480 and adjust after you share mobile screenshots. The panel collapse behaviour at small widths is unknown.

## 7. Motion
- Panel collapses to a logo chip after selecting a scene [O]. Duration and easing [U].
- Scene change: cross-fade or camera transition [U].
- Hover effects [U].

## 8. Items needing confirmation before implementation
1. Eyedropped hex values from your logo, assets and a menu screenshot at 100% zoom.
2. PresicavRg-Bold file, or approval of a substitute.
3. Mobile screenshots for breakpoints.
4. Hover/active state captures from your walkthrough video.
