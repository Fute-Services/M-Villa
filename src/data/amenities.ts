import regionsJson from './amenity-regions.json'
import { FLAT_PANOS, projectToImage } from './panoramas'

/** The amenities aerial (flat panorama) that the Amenities scene lets you zoom and drag. */
export const AMENITY_PANO = FLAT_PANOS.find((p) => p.slug.startsWith('amenities'))

export interface HubSpot {
  /** Matches the id of the hub button in AMENITY_HUBS. */
  id: string
  /** Name plate text (two lines, as in the reference). */
  lines: [string, string]
  /** Centre of the name plate inside the image, as fractions of its width and height. */
  x: number
  y: number
  /** Width of the name plate as a fraction of the image width. */
  width: number
  /** Tilt in degrees, following the perspective of the aerial (estimated from the reference recording). */
  rotate: number
  /** Hover area of the hub as a polygon of image fractions (measured from the reference recording). */
  region: [number, number][]
}

// Name-plate positions and sizes come from the tour's own hotspots (yaw/pitch/field of view); the tilt is estimated.
const RAW = [
  { id: 'beach', lines: ['Beach', 'Hub'], yaw: -6.29, pitch: 3.45, hfov: 4.77, rotate: -20 },
  { id: 'sanctuary', lines: ['Green', 'Sanctuary'], yaw: 0.26, pitch: 5.04, hfov: 3.97, rotate: 0 },
  { id: 'wellness', lines: ['Wellness', 'Hub'], yaw: 6.67, pitch: 3.54, hfov: 4.51, rotate: -18 },
  { id: 'family', lines: ['Family', 'Hub'], yaw: -4.48, pitch: -0.9, hfov: 4.98, rotate: -38 },
  { id: 'sport', lines: ['Sports', 'Hub'], yaw: 4.48, pitch: -0.85, hfov: 5.56, rotate: -38 },
] as const

/** Hover shapes measured from the reference recording: each frame was aligned to this image and the darkened area extracted. */
const REGIONS = regionsJson as unknown as Record<string, [number, number][]>

const toWidthFraction = (yaw: number, hfov: number, cropWidth: number) =>
  (Math.tan(((yaw + hfov / 2) * Math.PI) / 180) - Math.tan(((yaw - hfov / 2) * Math.PI) / 180)) / 2 / cropWidth

export const HUB_SPOTS: HubSpot[] = AMENITY_PANO
  ? RAW.map((r) => {
      const at = projectToImage(r.yaw, r.pitch, AMENITY_PANO.cropFrac)
      return {
        id: r.id,
        lines: [r.lines[0], r.lines[1]],
        x: at.x,
        y: at.y,
        width: toWidthFraction(r.yaw, r.hfov, AMENITY_PANO.cropFrac[2] - AMENITY_PANO.cropFrac[0]),
        rotate: r.rotate,
        region: REGIONS[r.id],
      }
    })
  : []
