import { createContext, useContext } from 'react'

/**
 * How far the scene background is dragged, as fractions of the hidden overflow (0 = top/left edge aligned,
 * 1 = bottom/right edge aligned). The reference lets the master plan be dragged vertically within its overflow.
 */
export interface Pan {
  x: number
  y: number
}

export const INITIAL_PAN: Pan = { x: 0.5, y: 0 }

export const PanContext = createContext<Pan>(INITIAL_PAN)
export const usePan = () => useContext(PanContext)

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** How many pixels of an image shown with `object-fit: cover` hide outside the viewport, per axis. */
export function coverOverflow(image: [number, number], viewport: [number, number]) {
  const scale = Math.max(viewport[0] / image[0], viewport[1] / image[1])
  return {
    scale,
    x: Math.max(0, image[0] * scale - viewport[0]),
    y: Math.max(0, image[1] * scale - viewport[1]),
  }
}

/** Moves the pan by a pointer delta (px). Dragging down reveals more of the top, so the pan decreases. */
export function panBy(pan: Pan, dx: number, dy: number, overflow: { x: number; y: number }): Pan {
  return {
    x: overflow.x > 0 ? clamp01(pan.x - dx / overflow.x) : pan.x,
    y: overflow.y > 0 ? clamp01(pan.y - dy / overflow.y) : pan.y,
  }
}
