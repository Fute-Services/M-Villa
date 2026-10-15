import type { SceneId } from '../scenes'
import type { IconName } from '../components/Icon'

export interface MenuItem {
  id: string
  label: string
  icon: IconName
  scene?: SceneId
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'Home', icon: 'home', scene: 'home' },
  { id: 'location', label: 'Location', icon: 'pin', scene: 'location' },
  { id: 'amenities', label: 'Amenities', icon: 'lotus', scene: 'amenities' },
  { id: 'street-view', label: 'Street View', icon: 'route', scene: 'street-view' },
  { id: 'inventory', label: 'Inventory', icon: 'house', scene: 'inventory' },
  { id: 'e-brochure', label: 'E-Brochure', icon: 'book', scene: 'brochure' },
]

export const BROCHURE_SLIDE_COUNT = 36

/** E-Brochure slides (public/brochure/slide-00.webp ... slide-35.webp, 1600x900). */
export const slideSrc = (index: number) => `/brochure/slide-${String(index).padStart(2, '0')}.webp`

/** 240x135 thumbnails generated from the slides (public/brochure/thumbs). */
export const thumbSrc = (index: number) => `/brochure/thumbs/slide-${String(index).padStart(2, '0')}.webp`

/** Master plan slide, used for the Location scene's Plot View. */
export const PLOT_VIEW_SLIDE = 3

export const CONTACT = {
  phone: '+971 800 57 57',
  website: 'danubeproperties.com',
  email: 'info@danubeproperties.ae',
  cities:
    'Dubai | Abu Dhabi | Muscat | Riyadh | Bahrain | London | China | Mumbai | New Delhi | Gurugram | Kochi | Hyderabad',
}

export const SOCIALS = [
  { id: 'facebook', label: 'Facebook', icon: 'facebook' as IconName },
  { id: 'instagram', label: 'Instagram', icon: 'instagram' as IconName },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' as IconName },
]

export interface OptionItem {
  id: string
  label: string
  icon: IconName
  /** Index of the E-Brochure slide shown for this item (matched by title; the live site's own mapping is unobserved). */
  slide: number
}

export const AMENITY_HUBS: OptionItem[] = [
  { id: 'wellness', label: 'Wellness Hub', icon: 'wellness', slide: 14 },
  { id: 'sanctuary', label: 'Greenz Sanctuary', icon: 'tree', slide: 10 },
  { id: 'beach', label: 'Beach Hub', icon: 'umbrella', slide: 11 },
  { id: 'sport', label: 'Sport Hub', icon: 'sport', slide: 13 },
  { id: 'family', label: 'Family Hub', icon: 'family', slide: 12 },
]


export type PoiCategory =
  | 'road'
  | 'airport'
  | 'landmark'
  | 'mall'
  | 'restaurant'
  | 'university'
  | 'entertainment'
  | 'park'
  | 'metro'

/** Legend entries: same labels and emoji the reference uses for the legend and the map markers. */
export const POI_CATEGORIES: { id: PoiCategory; label: string; emoji: string }[] = [
  { id: 'road', label: 'Major Road', emoji: '🛣️' },
  { id: 'airport', label: 'Airport', emoji: '✈️' },
  { id: 'landmark', label: 'Landmark', emoji: '🏙️' },
  { id: 'mall', label: 'Shopping Mall', emoji: '🛍️' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'university', label: 'University', emoji: '🎓' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎡' },
  { id: 'park', label: 'Park & Nature', emoji: '🌿' },
  { id: 'metro', label: 'Metro — Blue Line', emoji: '🚇' },
]
