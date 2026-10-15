import { describe, expect, it } from 'vitest'
import { HOME_VIEW, clampView, coverSize, dragBy, easeInOutCubic, lerpView, offsetFor, zoomAt } from './zoom'

const viewport: [number, number] = [1000, 500]
const base = coverSize([2000, 1000], viewport) // 1000 x 500 at zoom 1

describe('zoom model', () => {
  it('covers the viewport at zoom 1 and has no room to pan sideways', () => {
    expect(base).toEqual({ w: 1000, h: 500 })
    expect(clampView({ z: 1, cx: 0.1, cy: 0.9 }, base, viewport)).toEqual({ z: 1, cx: 0.5, cy: 0.5 })
  })

  it('limits the zoom range and keeps the image covering the screen', () => {
    const v = clampView({ z: 9, cx: 0, cy: 1 }, base, viewport)
    expect(v.z).toBe(4)
    const off = offsetFor(v, base, viewport)
    expect(off.x).toBeLessThanOrEqual(0)
    expect(off.x).toBeGreaterThanOrEqual(viewport[0] - base.w * v.z - 1e-6)
    expect(off.y).toBeLessThanOrEqual(0)
  })

  it('zooms about the cursor so the point under it stays put', () => {
    const point = { x: 750, y: 125 }
    const before = offsetFor(HOME_VIEW, base, viewport)
    const imgFrac = { x: (point.x - before.x) / base.w, y: (point.y - before.y) / base.h }
    const next = zoomAt(HOME_VIEW, 2, point, base, viewport)
    const after = offsetFor(next, base, viewport)
    expect((point.x - after.x) / (base.w * next.z)).toBeCloseTo(imgFrac.x, 5)
    expect((point.y - after.y) / (base.h * next.z)).toBeCloseTo(imgFrac.y, 5)
  })

  it('drags the image with the pointer within its limits', () => {
    const zoomed = { z: 2, cx: 0.5, cy: 0.5 }
    const moved = dragBy(zoomed, 100, -50, base, viewport)
    expect(moved.cx).toBeCloseTo(0.5 - 100 / 2000, 5)
    expect(moved.cy).toBeCloseTo(0.5 + 50 / 1000, 5)
    expect(dragBy(zoomed, 99999, 99999, base, viewport).cx).toBeGreaterThan(0)
  })

  it('eases and interpolates between views', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    const mid = lerpView({ z: 1, cx: 0.5, cy: 0.5 }, { z: 4, cx: 0.7, cy: 0.3 }, 0.5)
    expect(mid.z).toBeCloseTo(2, 5)
    expect(mid.cx).toBeCloseTo(0.6, 5)
  })
})
