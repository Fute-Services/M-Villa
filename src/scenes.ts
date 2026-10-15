import { FLAT_FILES } from './data/panoramas'

export const SCENE_IDS = [
  'intro',
  'home',
  'location',
  'amenities',
  'street-view',
  'inventory',
  'brochure',
] as const

export type SceneId = (typeof SCENE_IDS)[number]
export type TimeOfDay = 'day' | 'night'

export interface TourState {
  scene: SceneId
  timeOfDay: TimeOfDay
  menuOpen: boolean
}

export type TourAction =
  | { type: 'goto'; scene: SceneId; menuOpen?: boolean }
  | { type: 'setTimeOfDay'; timeOfDay: TimeOfDay }
  | { type: 'setMenuOpen'; open: boolean }

export const initialTourState: TourState = { scene: 'intro', timeOfDay: 'day', menuOpen: true }

export function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case 'goto': {
      const menuOpen = action.menuOpen ?? state.menuOpen
      return state.scene === action.scene && state.menuOpen === menuOpen
        ? state
        : { ...state, scene: action.scene, menuOpen }
    }
    case 'setTimeOfDay':
      return state.timeOfDay === action.timeOfDay
        ? state
        : { ...state, timeOfDay: action.timeOfDay }
    case 'setMenuOpen':
      return state.menuOpen === action.open ? state : { ...state, menuOpen: action.open }
  }
}

/**
 * Background image per scene (files in /public/scenes, stitched from the reference tour's panoramas).
 * Location, Street View and the E-Brochure sit over the Home aerial. Only the Home aerial has a night
 * variant; Amenities and Inventory always use their day render.
 */
export function sceneBackground(scene: SceneId, timeOfDay: TimeOfDay): string {
  if (scene === 'amenities') return FLAT_FILES.amenities
  if (scene === 'inventory') return FLAT_FILES.inventory
  return timeOfDay === 'night' ? FLAT_FILES.masterplanNight : FLAT_FILES.masterplanDay
}
