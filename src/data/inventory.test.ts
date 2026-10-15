import { describe, expect, it } from 'vitest'
import { UNIT_TYPES } from './inventory'

describe('inventory data', () => {
  it('has a room spot entry for every room tab, inside the plan image', () => {
    for (const t of UNIT_TYPES) {
      expect(t.roomSpots, t.id).toHaveLength(t.rooms.length)
      for (const spot of t.roomSpots) {
        if (!spot) continue
        expect(spot.x).toBeGreaterThan(0)
        expect(spot.x).toBeLessThan(1)
        expect(spot.y).toBeGreaterThan(0)
        expect(spot.y).toBeLessThan(1)
      }
    }
  })

  it('places the 3 BHK living room in the lower-left of the ground floor, like the reference', () => {
    const living = UNIT_TYPES.find((t) => t.id === '3bhk')!.roomSpots[0]!
    expect(living.x).toBeLessThan(0.25)
    expect(living.y).toBeGreaterThan(0.6)
  })

  it('lists Terrace as the last room of the semi-detached villa', () => {
    const semi = UNIT_TYPES.find((t) => t.id === '5bhk-semi')!
    expect(semi.rooms.at(-1)).toBe('Terrace')
  })
})
