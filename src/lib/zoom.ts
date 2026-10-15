/**
 * Zoom/pan model for an image shown with `object-fit: cover` that can be zoomed in and dragged.
 * The view is the zoom (1 = cover fit) and the image point (as fractions) at the centre of the screen.
 */
export interface View {
  z: number
  cx: number
  cy: number
}

export const MIN_ZOOM = 1
export const MAX_ZOOM = 4
export const HOME_VIEW: View = { z: 1, cx: 0.5, cy: 0.5 }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Size of the image at zoom 1 (cover fit) for a given image and viewport. */
export function coverSize(image: [number, number], viewport: [number, number]) {
  const s = Math.max(viewport[0] / image[0], viewport[1] / image[1])
  return { w: image[0] * s, h: image[1] * s }
}

/** Keeps the image covering the whole viewport: limits zoom and the centre point. */
export function clampView(view: View, base: { w: number; h: number }, viewport: [number, number]): View {
  const z = clamp(view.z, MIN_ZOOM, MAX_ZOOM)
  const halfX = viewport[0] / 2 / (base.w * z)
  const halfY = viewport[1] / 2 / (base.h * z)
  return { z, cx: clamp(view.cx, halfX, 1 - halfX), cy: clamp(view.cy, halfY, 1 - halfY) }
}

/** Top-left offset (px) of the zoomed image inside the viewport. */
export function offsetFor(view: View, base: { w: number; h: number }, viewport: [number, number]) {
  return { x: viewport[0] / 2 - view.cx * base.w * view.z, y: viewport[1] / 2 - view.cy * base.h * view.z }
}

/** Zooms by `factor` while keeping the image point under the screen position (px, py) fixed. */
export function zoomAt(
  view: View,
  factor: number,
  point: { x: number; y: number },
  base: { w: number; h: number },
  viewport: [number, number],
): View {
  const z = clamp(view.z * factor, MIN_ZOOM, MAX_ZOOM)
  const off = offsetFor(view, base, viewport)
  const imgX = (point.x - off.x) / (base.w * view.z)
  const imgY = (point.y - off.y) / (base.h * view.z)
  const next: View = {
    z,
    cx: imgX - (point.x - viewport[0] / 2) / (base.w * z),
    cy: imgY - (point.y - viewport[1] / 2) / (base.h * z),
  }
  return clampView(next, base, viewport)
}

/** Moves the view by a pointer drag (px). */
export function dragBy(view: View, dx: number, dy: number, base: { w: number; h: number }, viewport: [number, number]): View {
  return clampView({ ...view, cx: view.cx - dx / (base.w * view.z), cy: view.cy - dy / (base.h * view.z) }, base, viewport)
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export function lerpView(a: View, b: View, t: number): View {
  // Interpolate zoom geometrically so the zoom feels even.
  const z = a.z * (b.z / a.z) ** t
  return { z, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t }
}

function insidePolygon(x: number, y: number, polygon: [number, number][]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Which area (polygons in image fractions) lies under a screen point for the current view, if any. */
export function hubAt(
  spots: { id: string; region: [number, number][] }[],
  point: { x: number; y: number },
  view: View,
  base: { w: number; h: number },
  viewport: [number, number],
) {
  const off = offsetFor(view, base, viewport)
  const fx = (point.x - off.x) / (base.w * view.z)
  const fy = (point.y - off.y) / (base.h * view.z)
  return spots.find((s) => insidePolygon(fx, fy, s.region))?.id ?? null
}
