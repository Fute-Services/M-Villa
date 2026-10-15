import type { IconName } from '../components/Icon'
import conesJson from './plan-cones.json'

export interface UnitType {
  id: string
  /** Button text in the Types list (as in the reference). */
  label: string
  icon: IconName
  /** Plan card header: big bedroom count, optional small suffix, and the two lines beside it. */
  beds: string
  bedsSuffix?: string
  title: string
  area: string
  /** Floor plan image (cut from the brochure slide). */
  plan: string
  /** Room tabs along the bottom, in the order of the reference. */
  rooms: string[]
  /** Where each room sits on the plan, as fractions of the plan image, and its map angle (tour data); null if the tour has none. */
  roomSpots: (RoomSpot | null)[]
}

export interface RoomSpot {
  x: number
  y: number
  angle: number
}

const CONES = conesJson as unknown as Record<string, (RoomSpot | null)[]>

/**
 * Every room of every type opens the same 360° panorama for now (an interior from the tour, a placeholder as
 * requested). Give a room its own panorama later by mapping it here.
 */
export const INVENTORY_PANO_ID = '69302417_4C9F_5744_41CD_7D862BDEBED8'

const BASE_TYPES: Omit<UnitType, 'roomSpots'>[] = [
  {
    id: '3bhk',
    label: '3 BHK TOWNHOUSE',
    icon: 'bed',
    beds: '3 BHK',
    title: 'Townhouse with Maid',
    area: 'UNIT AREA 2,400 SQ.FT',
    plan: '/inventory/plan-3bhk.webp',
    rooms: ['Living & Dining', 'Kitchen', 'Master Bedroom', 'Bedroom 1', 'Bedroom 2', 'Master Bathroom'],
  },
  {
    id: '4bhk',
    label: '4 BHK TOWNHOUSE',
    icon: 'bed',
    beds: '4 BHK',
    title: 'Townhouse with Maid',
    area: 'UNIT AREA 2,750 SQ.FT',
    plan: '/inventory/plan-4bhk.webp',
    rooms: ['Living & Dining', 'Kitchen', 'Bedroom', 'Master Bedroom 1', 'Master Bedroom 2', 'Bedroom', 'Bathroom'],
  },
  {
    id: '4bhk-premium',
    label: '4 BHK TOWNHOUSE PREMIUM',
    icon: 'bed',
    beds: '4 BHK',
    bedsSuffix: 'Premium',
    title: 'Townhouse with Maid',
    area: 'UNIT AREA 3,100 SQ.FT',
    plan: '/inventory/plan-4bhk-premium.webp',
    rooms: ['Living', 'Kitchen', 'Master Bedroom', 'Bedroom 1', 'Bedroom 2', 'Bedroom 3', 'Maid Room', 'Bathroom'],
  },
  {
    id: '5bhk-semi',
    label: '5 BHK SEMI-DETACHED VILLA',
    icon: 'bed',
    beds: '5 BHK',
    title: 'Semi-Detached Villa',
    area: 'UNIT AREA 3,700 SQ.FT',
    plan: '/inventory/plan-5bhk-semi.webp',
    rooms: ['Living & Dining', 'Kitchen', 'Master Bedroom 1', 'Bedroom 1', 'Bedroom 2', 'Master Bedroom 2', 'Bedroom 3', 'Bathroom 1', 'Bathroom 2', 'Balcony', 'Terrace'],
  },
  {
    id: '5bhk-twin',
    label: '5 BHK TWIN VILLA',
    icon: 'bed',
    beds: '5 BHK',
    bedsSuffix: 'TWIN VILLA',
    title: 'Twin Villa',
    area: 'UNIT AREA 3,950 SQ.FT',
    plan: '/inventory/plan-5bhk-twin.webp',
    rooms: ['Living & Dining', 'Kitchen', 'Bedroom 1', 'Master Bedroom 1', 'Master Bedroom 2', 'Bedroom 2', 'Bedroom 3', 'Bathroom', 'Balcony 1', 'Balcony 2', 'Balcony 3'],
  },
]

export const UNIT_TYPES: UnitType[] = BASE_TYPES.map((t) => ({ ...t, roomSpots: CONES[t.id] ?? [] }))
