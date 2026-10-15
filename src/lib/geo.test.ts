import { describe, expect, it } from 'vitest'
import { PROJECT_LNG_LAT, formatLatLng, haversineKm, kmToMiles } from './geo'

describe('geo helpers', () => {
  it('formats the project position like the reference readout', () => {
    expect(formatLatLng(...PROJECT_LNG_LAT)).toBe(`25°07'21.8" N · 55°25'54.0" E`)
  })

  it('carries rounded seconds into minutes instead of printing 60.0', () => {
    expect(formatLatLng(55 + 17 / 60 + 59.97 / 3600, 25)).toContain("55°18'00.0\" E")
  })

  it('formats southern and western hemispheres', () => {
    expect(formatLatLng(-0.5, -1.25)).toContain('S')
    expect(formatLatLng(-0.5, -1.25)).toContain('W')
  })

  it('computes a plausible haversine distance', () => {
    // Dubai Marina to Burj Khalifa is roughly 20 km.
    const km = haversineKm([55.14, 25.08], [55.27, 25.2])
    expect(km).toBeGreaterThan(15)
    expect(km).toBeLessThan(25)
  })

  it('converts km to miles', () => {
    expect(kmToMiles(10)).toBeCloseTo(6.21, 2)
  })
})
