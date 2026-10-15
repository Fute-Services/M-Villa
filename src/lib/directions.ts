import { MAPBOX_TOKEN } from './mapbox'

export interface RouteResult {
  coords: [number, number][]
  distanceKm: number
  durationMin: number
}

const STORAGE_KEY = 'greenz.routes.v1'
const memory = new Map<string, RouteResult>()

function readStored(): Record<string, RouteResult> {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, RouteResult>
  } catch {
    return {}
  }
}

function writeStored(key: string, value: RouteResult) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStored(), [key]: value }))
  } catch {
    /* storage unavailable: the in-memory cache still works for this session */
  }
}

/**
 * Driving route from the property to a place, using the Mapbox Directions API with the project's own token.
 * Each distinct destination is requested at most once; results are cached in memory and localStorage so
 * repeat clicks (and later visits) make no further API calls. Resolves to null if the route is unavailable.
 */
export async function fetchRoute(
  from: [number, number],
  to: [number, number],
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  const key = `${to[0].toFixed(5)},${to[1].toFixed(5)}`
  const cached = memory.get(key) ?? readStored()[key]
  if (cached) {
    memory.set(key, cached)
    return cached
  }
  try {
    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}` +
      `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`
    const res = await fetch(url, { signal })
    if (!res.ok) return null
    const data = (await res.json()) as {
      routes?: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }[]
    }
    const route = data.routes?.[0]
    if (!route) return null
    const result: RouteResult = {
      coords: route.geometry.coordinates,
      distanceKm: Math.round(route.distance / 100) / 10,
      durationMin: Math.round(route.duration / 60),
    }
    memory.set(key, result)
    writeStored(key, result)
    return result
  } catch {
    return null
  }
}

/** Test helper: forget cached routes. */
export function clearRouteCache() {
  memory.clear()
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
