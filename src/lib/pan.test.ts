import { describe, expect, it } from 'vitest'
import { INITIAL_PAN, coverOverflow, panBy } from './pan'

describe('pan helpers', () => {
  it('computes the overflow of a cover-fitted image', () => {
    // A 16:9 image in a wider viewport fills the width and overflows vertically.
    const o = coverOverflow([1776, 1000], [1000, 400])
    expect(o.x).toBeCloseTo(0, 5)
    expect(o.y).toBeCloseTo(1000 * (1000 / 1776) - 400, 3)
  })

  it('pans only along the axis that has overflow, and clamps to the edges', () => {
    const overflow = { x: 0, y: 160 }
    expect(panBy(INITIAL_PAN, 50, -80, overflow)).toEqual({ x: 0.5, y: 0.5 })
    expect(panBy(INITIAL_PAN, 0, -500, overflow).y).toBe(1)
    expect(panBy({ x: 0.5, y: 0.2 }, 0, 500, overflow).y).toBe(0)
  })
})
