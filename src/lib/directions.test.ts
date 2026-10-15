import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearRouteCache, fetchRoute } from './directions'

const from: [number, number] = [55.43, 25.12]
const to: [number, number] = [55.41, 25.14]

const okResponse = {
  ok: true,
  json: async () => ({
    routes: [{ geometry: { coordinates: [[55.43, 25.12], [55.41, 25.14]] }, distance: 4321, duration: 480 }],
  }),
}

describe('fetchRoute', () => {
  beforeEach(() => clearRouteCache())
  afterEach(() => vi.unstubAllGlobals())

  it('returns distance in km and time in minutes, and calls the API only once per destination', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse)
    vi.stubGlobal('fetch', fetchMock)
    const first = await fetchRoute(from, to)
    const second = await fetchRoute(from, to)
    expect(first).toEqual({ coords: [[55.43, 25.12], [55.41, 25.14]], distanceKm: 4.3, durationMin: 8 })
    expect(second).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('resolves to null when the API fails or has no route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await fetchRoute(from, to)).toBeNull()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ routes: [] }) }))
    expect(await fetchRoute(from, [55.5, 25.2])).toBeNull()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await fetchRoute(from, [55.6, 25.3])).toBeNull()
  })
})
