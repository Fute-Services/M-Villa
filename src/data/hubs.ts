import { getCube } from './panoramas'
import type { IconName } from '../components/Icon'

export interface HubItem {
  id: string
  /** Caption under the thumbnail (as shown in the reference). */
  label: string
  /** The 360° panorama shown for this view (tour panorama id). */
  panoId: string
}

export interface HubDetail {
  id: string
  title: string
  icon: IconName
  items: HubItem[]
}

/** Thumbnail for a view, cut from its own panorama (public/panoramas/hub-thumbs). */
export const hubThumb = (panoId: string) => `/panoramas/hub-thumbs/${getCube(panoId)?.slug ?? ''}.jpg`

// Tour panorama ids. A few views are shared on purpose: the reference reuses Greenz Sanctuary, Garden and the
// jogging tracks from the Street View points.
const GREENZ_SANCTUARY = '979AC05A_B606_0C78_41C7_51A2F91D7250'

/** Hub panels with the captions seen in the reference recording, in the same order. */
export const HUB_DETAILS: HubDetail[] = [
  {
    id: 'wellness',
    title: 'Wellness Hub',
    icon: 'wellness',
    items: [
      { id: 'gym', label: 'Gym', panoId: '0D597AD8_4C97_B0CC_41C6_A15131A87A46' },
      { id: 'spa', label: 'SPA', panoId: '0EED7F5D_4CAF_B1C4_41C5_F35DF6C8AB6B' },
    ],
  },
  {
    id: 'sanctuary',
    title: 'Green Sanctuary',
    icon: 'tree',
    items: [
      { id: 'greenz-sanctuary', label: 'Greenz Sanctuary', panoId: GREENZ_SANCTUARY },
      { id: 'hammock-bay-2', label: 'Hammock Bay 2', panoId: '97C670DB_B606_0C78_41D8_D76AF7F3E3E9' },
      { id: 'hammock-bay-1', label: 'Hammock Bay 1', panoId: '97ED1E35_B606_37C8_41E0_D75007567131' },
      { id: 'garden', label: 'Garden', panoId: '97C73A71_B602_1C48_41E1_0752650A4A54' },
    ],
  },
  {
    id: 'beach',
    title: 'Beach Hub',
    icon: 'umbrella',
    items: [
      { id: 'beach-lagoon', label: 'Beach Lagoon', panoId: '97CB1572_B606_1448_41B3_22A12DE78B9F' },
      { id: 'sunken-seating', label: 'Sunken Seating', panoId: '97C44F78_B606_3438_41CE_8654DD86EC46' },
      { id: 'kids-pool', label: 'Kids Pool', panoId: '97F939FC_B606_3C38_41E5_EDEC80FE030E' },
    ],
  },
  {
    id: 'sport',
    title: 'Sport Hub',
    icon: 'sport',
    items: [
      { id: 'soccer', label: 'Soccer', panoId: '0E94FEA7_4CAE_D344_41B2_4D112FC7C4AD' },
      { id: 'padel', label: 'Padel', panoId: '0EA7327A_4C91_53CC_41CD_2995B6877C93' },
      { id: 'basketball', label: 'Basketball', panoId: '0D5C2C3E_4CAE_D744_41BD_D903391A9606' },
    ],
  },
  {
    id: 'family',
    title: 'Family Hub',
    icon: 'family',
    items: [
      { id: 'clubhouse-gf', label: 'Clubhouse GF', panoId: 'D6B4584E_F512_2680_41B8_2698BB00860C' },
      { id: 'clubhouse-ff', label: 'Clubhouse FF', panoId: 'F3BA7093_DB66_9947_41D3_273A2040452D' },
      { id: 'daycare', label: 'Daycare', panoId: 'E9961532_CBFC_99DE_41E7_6CC564505BDA' },
      { id: 'walk-zone', label: 'Walk Zone', panoId: '97F96702_B606_75C8_41C3_620274C82AF0' },
      { id: 'family-greenz-sanctuary', label: 'Greenz Sanctuary', panoId: GREENZ_SANCTUARY },
      { id: 'jogging-track-1', label: 'Jogging Track 1', panoId: '97DB7892_B606_1CC8_41DC_4C32FC9CD6A4' },
      { id: 'jogging-track-2', label: 'Jogging Track 2', panoId: '97FD9E5B_B606_1478_41E0_A1A1F0FAB903' },
    ],
  },
]

export const hubDetail = (id: string) => HUB_DETAILS.find((h) => h.id === id)
