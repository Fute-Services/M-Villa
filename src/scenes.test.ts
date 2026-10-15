import { describe, expect, it } from 'vitest'
import { initialTourState, sceneBackground, tourReducer } from './scenes'

describe('tourReducer', () => {
  it('starts on the intro scene in day mode with the menu open', () => {
    expect(initialTourState).toEqual({ scene: 'intro', timeOfDay: 'day', menuOpen: true })
  })

  it('goes to a scene and keeps time of day and menu state', () => {
    const next = tourReducer(
      { scene: 'home', timeOfDay: 'night', menuOpen: true },
      { type: 'goto', scene: 'street-view' },
    )
    expect(next).toEqual({ scene: 'street-view', timeOfDay: 'night', menuOpen: true })
  })

  it('can collapse the menu while navigating', () => {
    const next = tourReducer(initialTourState, { type: 'goto', scene: 'amenities', menuOpen: false })
    expect(next.menuOpen).toBe(false)
  })

  it('returns the same state object for no-op actions', () => {
    const s = initialTourState
    expect(tourReducer(s, { type: 'goto', scene: 'intro' })).toBe(s)
    expect(tourReducer(s, { type: 'setTimeOfDay', timeOfDay: 'day' })).toBe(s)
    expect(tourReducer(s, { type: 'setMenuOpen', open: true })).toBe(s)
  })

  it('uses the master plan aerial (day or night) for overlay scenes', () => {
    expect(sceneBackground('home', 'night')).toContain('masterplan-night')
    expect(sceneBackground('location', 'day')).toContain('masterplan-day')
    expect(sceneBackground('street-view', 'night')).toContain('masterplan-night')
  })

  it('has no night variant for amenities and inventory', () => {
    expect(sceneBackground('amenities', 'night')).toBe(sceneBackground('amenities', 'day'))
    expect(sceneBackground('inventory', 'night')).toBe(sceneBackground('inventory', 'day'))
    expect(sceneBackground('amenities', 'day')).toContain('amenities')
  })
})
