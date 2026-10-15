/** Greenz by Danube, as shown in the reference's coordinate readout (25°07'21.8" N, 55°25'54.0" E). */
export const PROJECT_LNG_LAT: [number, number] = [55 + 25 / 60 + 54 / 3600, 25 + 7 / 60 + 21.8 / 3600]

/** Initial map view used by the reference: the whole of central Dubai with the project near the lower right. */
export const INITIAL_VIEW = { center: [55.3, 25.16] as [number, number], zoom: 10.8 }

function dms(value: number, pos: string, neg: string) {
  const hemi = value >= 0 ? pos : neg
  // Work in tenths of a second so rounding carries into minutes and degrees (never "60.0").
  const total = Math.round(Math.abs(value) * 3600 * 10)
  const deg = Math.floor(total / 36000)
  const min = Math.floor((total % 36000) / 600)
  const sec = (total % 600) / 10
  return `${deg}°${String(min).padStart(2, '0')}'${sec.toFixed(1).padStart(4, '0')}" ${hemi}`
}

/** Formats a position like the reference's readout: 25°07'21.8" N · 55°25'54.0" E */
export function formatLatLng(lng: number, lat: number) {
  return `${dms(lat, 'N', 'S')} · ${dms(lng, 'E', 'W')}`
}

/** Straight-line distance in km (haversine), used only when a POI has no stored route distance. */
export function haversineKm(a: [number, number], b: [number, number]) {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b[1] - a[1])
  const dLng = rad(b[0] - a[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export const kmToMiles = (km: number) => km * 0.621371
