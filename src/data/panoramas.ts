import droneJson from './drone-hotspots.json'
import graphJson from './tour-graph.json'
import manifestJson from './panoramas.json'

export interface CubePano {
  id: string
  slug: string
  label: string
  faceSize: number
  path: string
  /** All six face images are present in /public/panoramas/cube. */
  available: boolean
}

export interface FlatPano {
  id: string
  slug: string
  label: string
  file: string
  size: [number, number]
  /** Where the visible image sits inside the original 90° cube face, as fractions [x0, y0, x1, y1]. */
  cropFrac: [number, number, number, number]
}

export interface TourLink {
  target: string
  yaw: number
  pitch: number
}

export interface TourNode {
  camera: { hfov: number; pitch: number; yaw: number } | null
  links: TourLink[]
}

const manifest = manifestJson as unknown as { flat: FlatPano[]; cube: CubePano[] }
const graph = graphJson as unknown as Record<string, TourNode>

export const CUBE_PANOS = manifest.cube
export const FLAT_PANOS = manifest.flat

const cubeById = new Map(CUBE_PANOS.map((p) => [p.id, p]))
const flatBySlugPrefix = (prefix: string) => FLAT_PANOS.find((p) => p.slug.startsWith(prefix))

export const getCube = (id: string) => cubeById.get(id)
export const nodeFor = (id: string): TourNode => graph[id] ?? { camera: null, links: [] }

/** The aerial used by the Street View scene (a copy of the master plan with a hotspot per street point). */
export const AERIAL_ID = '85057B3E_98FF_9E1E_41DB_33935AA7F3BE'
export const aerialPano = () => FLAT_PANOS.find((p) => p.id === AERIAL_ID)

/** File of the flat panorama whose slug starts with `prefix`, if it has been downloaded. */
export const flatFile = (prefix: string) => flatBySlugPrefix(prefix)?.file

/** Flat-panorama background files used by the scenes. */
export const FLAT_FILES = {
  masterplanDay: flatFile('12-masterplan-day') ?? '',
  masterplanNight: flatFile('13-masterplan-night') ?? '',
  amenities: flatFile('amenities') ?? '',
  inventory: flatFile('19-street-view-1') ?? '',
}

/**
 * Where a view direction (degrees, as stored in the tour) lands inside a flat panorama image.
 * Returns fractions (0..1) of the visible image. Front cube face, rectilinear projection.
 */
export function projectToImage(yawDeg: number, pitchDeg: number, crop: FlatPano['cropFrac']) {
  const yaw = (yawDeg * Math.PI) / 180
  const pitch = (pitchDeg * Math.PI) / 180
  const x = Math.tan(yaw)
  const y = Math.tan(pitch) / Math.cos(yaw)
  const u = (x + 1) / 2
  const v = (1 - y) / 2
  return { x: (u - crop[0]) / (crop[2] - crop[0]), y: (v - crop[1]) / (crop[3] - crop[1]) }
}

export interface StreetPoint {
  id: string
  label: string
  /** Order in which the point appears in the tour. */
  order: number
  yaw: number
  pitch: number
  available: boolean
}

/** Street points reachable from the aerial, with their hotspot directions. */
export const STREET_POINTS: StreetPoint[] = nodeFor(AERIAL_ID).links.flatMap((l, order) => {
  const pano = getCube(l.target)
  return pano ? [{ id: pano.id, label: pano.label, order, yaw: l.yaw, pitch: l.pitch, available: pano.available }] : []
})

/** The "Drone Shot" 360° panorama shown by the Location scene's Plot View. */
export const DRONE_SHOT_ID = '91DB5439_B61E_1438_41E3_C2E2B12F5C99'

export interface ImageHotspot {
  kind: 'pin' | 'label'
  yaw: number
  pitch: number
  /** Angular size of the image in degrees. */
  hfov: number
  vfov: number
  src: string
}

/** Pins and name plates placed on the drone panorama (positions and sizes from the tour; images in /public/panoramas/drone). */
export const DRONE_HOTSPOTS = droneJson as ImageHotspot[]

/** Interior and amenity panoramas grouped by the unit type they belong to (from their labels). */
export function unitTypeOf(label: string): string | null {
  if (/premium/i.test(label)) return '4bhk-premium'
  if (/twin/i.test(label)) return '5bhk-twin'
  if (/^3\s?bhk/i.test(label)) return '3bhk'
  if (/^4\s?bhk/i.test(label)) return '4bhk'
  if (/^5\s?bhk/i.test(label)) return '5bhk-semi'
  return null
}
