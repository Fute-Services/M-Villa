import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AMENITY_PANO, HUB_SPOTS } from '../data/amenities'
import { HOME_VIEW, coverSize, offsetFor } from '../lib/zoom'
import { AmenitiesView } from './AmenitiesView'

// three.js needs WebGL, which jsdom lacks.
vi.mock('./PanoramaViewer', () => ({ default: ({ panoId }: { panoId: string }) => <div data-testid="pano" data-pano={panoId} /> }))

const stageOf = (c: HTMLElement) => c.querySelector('.amenity-stage') as HTMLElement
const zoomOf = (c: HTMLElement) => stageOf(c).getAttribute('data-zoom')
const settle = (ms = 3000) => act(() => void vi.advanceTimersByTime(ms))

/** Screen position (px) of the middle of a hub's name plate at zoom 1. */
function pointOnHub(id: string) {
  const spot = HUB_SPOTS.find((s) => s.id === id)!
  const viewport: [number, number] = [window.innerWidth, window.innerHeight]
  const base = coverSize(AMENITY_PANO!.size, viewport)
  const off = offsetFor(HOME_VIEW, base, viewport)
  return { clientX: off.x + spot.x * base.w, clientY: off.y + spot.y * base.h }
}

describe('AmenitiesView', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] }))
  afterEach(() => vi.useRealTimers())

  it('shows the aerial with every hub name plate hidden until hovered', () => {
    const { container } = render(<AmenitiesView />)
    expect(screen.getByRole('img', { name: /amenities aerial/i })).toBeInTheDocument()
    expect(container.querySelectorAll('.amenity-label')).toHaveLength(5)
    expect(container.querySelectorAll('.amenity-label.is-active')).toHaveLength(0)
    expect(zoomOf(container)).toBe('1.00')
  })

  it('lights up the hub under the pointer and fades it out when the pointer leaves', () => {
    const { container } = render(<AmenitiesView />)
    const stage = stageOf(container)
    fireEvent.pointerMove(stage, { pointerId: 1, ...pointOnHub('sport') })
    expect(stage).toHaveAttribute('data-hover', 'sport')
    expect(container.querySelectorAll('.amenity-label.is-active')).toHaveLength(1)
    expect(container.querySelector('.amenity-regions polygon.is-active')).not.toBeNull()

    fireEvent.pointerMove(stage, { pointerId: 1, ...pointOnHub('beach') })
    expect(stage).toHaveAttribute('data-hover', 'beach')

    fireEvent.pointerLeave(stage)
    expect(stage).toHaveAttribute('data-hover', '')
    expect(container.querySelectorAll('.amenity-label.is-active')).toHaveLength(0)
  })

  it('opens a hub from its button: a 360° view with a panel of views, and a compact Hubs list', () => {
    render(<AmenitiesView />)
    fireEvent.click(screen.getByRole('button', { name: 'Beach Hub' }))
    expect(screen.getByRole('region', { name: /beach hub 360° views/i })).toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(50)) // lets the lazy viewer resolve

    const panel = screen.getByRole('complementary', { name: /beach hub views/i })
    const captions = within(panel).getAllByRole('button').filter((b) => b.getAttribute('aria-current') !== null)
    expect(captions.map((b) => b.getAttribute('aria-label'))).toEqual(['Beach Lagoon', 'Sunken Seating', 'Kids Pool'])
    expect(within(panel).getByRole('button', { name: 'Beach Lagoon' })).toHaveAttribute('aria-current', 'true')

    // The Hubs list is collapsed to the open hub until the expander is used.
    const hubs = screen.getByRole('navigation', { name: 'Hubs' })
    expect(within(hubs).queryByRole('button', { name: 'Sport Hub' })).toBeNull()
    expect(within(hubs).getByRole('button', { name: 'Beach Hub' })).toBeInTheDocument()
    fireEvent.click(within(hubs).getByRole('button', { name: 'Hubs' }))
    expect(within(hubs).getByRole('button', { name: 'Sport Hub' })).toBeInTheDocument()

    fireEvent.click(within(hubs).getByRole('button', { name: 'Sport Hub' }))
    expect(screen.getByRole('region', { name: /sport hub 360° views/i })).toBeInTheDocument()
    const sport = screen.getByRole('complementary', { name: /sport hub views/i })
    expect(within(sport).getByRole('button', { name: 'Padel' })).toBeInTheDocument()
  })

  it('lists all seven Family Hub views, in the order of the reference', () => {
    render(<AmenitiesView />)
    fireEvent.click(screen.getByRole('button', { name: 'Family Hub' }))
    const panel = screen.getByRole('complementary', { name: /family hub views/i })
    const labels = within(panel).getAllByRole('button').filter((b) => b.getAttribute('aria-current') !== null).map((b) => b.getAttribute('aria-label'))
    expect(labels).toEqual(['Clubhouse GF', 'Clubhouse FF', 'Daycare', 'Walk Zone', 'Greenz Sanctuary', 'Jogging Track 1', 'Jogging Track 2'])
  })

  it('switches the active view from the panel and can collapse the panel', () => {
    render(<AmenitiesView />)
    fireEvent.click(screen.getByRole('button', { name: 'Wellness Hub' }))
    const panel = screen.getByRole('complementary', { name: /wellness hub views/i })
    fireEvent.click(within(panel).getByRole('button', { name: 'SPA' }))
    expect(within(panel).getByRole('button', { name: 'SPA' })).toHaveAttribute('aria-current', 'true')
    expect(within(panel).getByRole('button', { name: 'Gym' })).toHaveAttribute('aria-current', 'false')

    fireEvent.click(within(panel).getByRole('button', { name: /hide views/i }))
    expect(within(panel).queryByRole('button', { name: 'Gym' })).toBeNull()
    fireEvent.click(within(panel).getByRole('button', { name: /show views/i }))
    expect(within(panel).getByRole('button', { name: 'Gym' })).toBeInTheDocument()
  })

  it('opens the hub that is clicked on the image and returns to the aerial with Escape', () => {
    const { container } = render(<AmenitiesView />)
    const stage = stageOf(container)
    fireEvent.pointerDown(stage, { pointerId: 1, button: 0, ...pointOnHub('family') })
    fireEvent.pointerUp(stage, { pointerId: 1 })
    fireEvent.click(stage)
    expect(screen.getByRole('region', { name: /family hub 360° views/i })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: /360° views/i })).toBeNull()
  })

  it('returns to the aerial when the open hub is chosen again', () => {
    render(<AmenitiesView />)
    fireEvent.click(screen.getByRole('button', { name: 'Sport Hub' }))
    const hubs = screen.getByRole('navigation', { name: 'Hubs' })
    fireEvent.click(within(hubs).getByRole('button', { name: 'Sport Hub' }))
    expect(screen.queryByRole('region', { name: /360° views/i })).toBeNull()
    expect(within(screen.getByRole('navigation', { name: 'Hubs' })).getByRole('button', { name: 'Family Hub' })).toBeInTheDocument()
  })

  it('zooms smoothly with the wheel (not instantly) and respects the limits', () => {
    const { container } = render(<AmenitiesView />)
    const stage = stageOf(container)
    fireEvent.wheel(stage, { deltaY: -600 })
    act(() => void vi.advanceTimersByTime(50))
    const early = Number(zoomOf(container))
    expect(early).toBeGreaterThan(1)
    settle()
    const settled = Number(zoomOf(container))
    expect(settled).toBeGreaterThan(early)

    for (let i = 0; i < 10; i++) fireEvent.wheel(stage, { deltaY: -2000 })
    settle()
    expect(zoomOf(container)).toBe('4.00')
    for (let i = 0; i < 10; i++) fireEvent.wheel(stage, { deltaY: 2000 })
    settle()
    expect(zoomOf(container)).toBe('1.00')
  })
})
