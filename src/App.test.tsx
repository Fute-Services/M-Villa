import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./views/MapboxMap', () => ({
  default: () => <div data-testid="map" />,
}))

// three.js needs WebGL, which jsdom lacks; the viewer itself is exercised in the browser.
vi.mock('./views/PanoramaViewer', () => ({
  default: ({ panoId, onNavigate }: { panoId: string; onNavigate?: (id: string) => void }) => (
    <div role="region" aria-label={`viewer ${panoId}`}>
      <button onClick={() => onNavigate?.('9625914D_B602_0C58_41C1_84E18864549F')}>chevron to Pano Street 14</button>
    </div>
  ),
}))

beforeEach(() => {
  window.localStorage.clear()
  window.matchMedia = ((query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
})

function enterTour() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Play intro video' }))
  fireEvent.click(screen.getByRole('button', { name: /explore/i }))
}

const menu = (name: RegExp) => screen.getByRole('button', { name })

describe('App tour', () => {
  it('shows the intro first and enters Home via Explore', () => {
    enterTour()
    expect(screen.getByRole('complementary', { name: 'Main menu' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Day View' })).toBeInTheDocument()
  })

  it('switches between Day and Night view and remembers the choice', () => {
    enterTour()
    fireEvent.click(screen.getByRole('button', { name: 'Night View' }))
    expect(screen.getByRole('button', { name: 'Night View' })).toHaveAttribute('aria-pressed', 'true')
    expect(window.localStorage.getItem('greenz.timeOfDay')).toBe('"night"')
  })

  it('opens Location, filters the legend, and closes back to Home', () => {
    enterTour()
    fireEvent.click(menu(/^location$/i))
    expect(screen.getByRole('dialog', { name: /distances/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Airport/ }))
    expect(screen.getByRole('button', { name: /Airport/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Landmark/ })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }))
    expect(screen.getByRole('button', { name: /Airport/ })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Close map' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('says so when the 360° drone view is not in the project and shows the master plan instead', () => {
    enterTour()
    fireEvent.click(menu(/^location$/i))
    fireEvent.click(screen.getByRole('button', { name: /plot view/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/360° drone view is not in this project yet/)
    expect(screen.getByRole('img', { name: /master plan/i })).toBeInTheDocument()
    fireEvent.click(within(screen.getByRole('group', { name: 'View' })).getByRole('button', { name: /location/i }))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('collapses the menu after choosing Amenities and selects a hub', () => {
    enterTour()
    fireEvent.click(menu(/^amenities$/i))
    expect(screen.getByRole('button', { name: 'Expand menu' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Wellness Hub' }))
    expect(screen.getByRole('button', { name: 'Wellness Hub' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('opens the E-Brochure viewer: pages, page jump, zoom, flip, theme, autoplay and close', () => {
    enterTour()
    fireEvent.click(menu(/e-brochure/i))
    const dialog = screen.getByRole('dialog', { name: 'E-Brochure' })
    expect(within(dialog).getAllByRole('img').length).toBe(36)
    expect(within(dialog).getByRole('textbox', { name: 'Page number' })).toHaveValue('1')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Next page' }))
    expect(within(dialog).getByRole('textbox', { name: 'Page number' })).toHaveValue('2')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Last page' }))
    expect(within(dialog).getByRole('textbox', { name: 'Page number' })).toHaveValue('36')
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Page number' }), { target: { value: '10' } })
    fireEvent.keyDown(within(dialog).getByRole('textbox', { name: 'Page number' }), { key: 'Enter' })
    expect(within(dialog).getByRole('button', { name: 'Previous page' })).toBeEnabled()
    expect(within(dialog).getByRole('textbox', { name: 'Page number' })).toHaveValue('10')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Zoom in' }))
    expect(within(dialog).getByText('125%')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset zoom' }))
    expect(within(dialog).getByText('100%')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Light theme' }))
    expect(dialog.querySelector('.brochure__panel')).toHaveClass('is-light')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Flip' }))
    expect(within(dialog).getAllByRole('img')).toHaveLength(1)
    expect(within(dialog).getByRole('img', { name: /page 10 of 36/i })).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Play autoplay' }))
    expect(within(dialog).getByRole('button', { name: 'Pause autoplay' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Pause autoplay' }))

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close brochure' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens a street point from the aerial, shows its name on the plan card, follows a chevron and goes back', async () => {
    enterTour()
    fireEvent.click(menu(/street view$/i))
    const card = screen.getByRole('complementary', { name: /street view plan/i })
    expect(within(card).getByRole('heading', { name: 'Street View' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Street view: / }).length).toBeGreaterThanOrEqual(20)

    fireEvent.click(screen.getByRole('button', { name: 'Street view: Gate 02' }))
    expect(await screen.findByRole('region', { name: /viewer FDF4378F/ })).toBeInTheDocument()
    expect(within(card).getByRole('heading', { name: 'Gate 02' })).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: /^Street view: / })).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /chevron to Pano Street 14/ }))
    expect(within(card).getByRole('heading', { name: 'Pano Street 14' })).toBeInTheDocument()

    fireEvent.click(within(card).getByRole('button', { name: 'Back to the aerial' }))
    expect(within(card).getByRole('heading', { name: 'Street View' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Street view: / }).length).toBeGreaterThanOrEqual(20)
    fireEvent.click(within(card).getByRole('button', { name: 'Back to home' }))
    expect(screen.getByRole('button', { name: 'Day View' })).toBeInTheDocument()
  })

  it('goes back to the street aerial from inside a point when the menu button is pressed again, and plan dots jump between points', async () => {
    enterTour()
    fireEvent.click(menu(/street view$/i))
    fireEvent.click(screen.getByRole('button', { name: 'Street view: Gate 01' }))
    const card = screen.getByRole('complementary', { name: /street view plan/i })
    expect(within(card).getByRole('heading', { name: 'Gate 01' })).toBeInTheDocument()

    fireEvent.click(within(card).getByRole('button', { name: 'Go to Mosque' }))
    expect(within(card).getByRole('heading', { name: 'Mosque' })).toBeInTheDocument()

    fireEvent.click(menu(/street view$/i))
    expect(within(card).getByRole('heading', { name: 'Street View' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Street view: / }).length).toBeGreaterThanOrEqual(20)
  })

  it('opens a unit type: plan card, room tabs, Types list, fullscreen plan, and returns to the exterior', async () => {
    enterTour()
    fireEvent.click(menu(/^inventory$/i))
    const types = () => screen.getByRole('navigation', { name: 'Types' })
    expect(within(types()).getAllByRole('button').map((b) => b.textContent)).toEqual([
      '3 BHK TOWNHOUSE',
      '4 BHK TOWNHOUSE',
      '4 BHK TOWNHOUSE PREMIUM',
      '5 BHK SEMI-DETACHED VILLA',
      '5 BHK TWIN VILLA',
      'Types',
    ])

    fireEvent.click(within(types()).getByRole('button', { name: '3 BHK TOWNHOUSE' }))
    // the menu collapses, the plan card and the room tabs appear, and the list folds to just the Types button
    expect(screen.getByRole('button', { name: 'Expand menu' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: /3 BHK Townhouse with Maid floor plan/i })).toHaveTextContent('UNIT AREA 2,400 SQ.FT')
    const rooms = screen.getByRole('navigation', { name: /townhouse with maid rooms/i })
    expect(within(rooms).getAllByRole('button').map((b) => b.textContent)).toEqual(['Living & Dining', 'Kitchen', 'Master Bedroom', 'Bedroom 1', 'Bedroom 2', 'Master Bathroom'])
    expect(within(types()).getAllByRole('button').map((b) => b.textContent)).toEqual(['Types'])

    fireEvent.click(within(rooms).getByRole('button', { name: 'Kitchen' }))
    expect(within(rooms).getByRole('button', { name: 'Kitchen' })).toHaveAttribute('aria-current', 'true')

    // fullscreen plan
    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen' }))
    const sheet = screen.getByRole('dialog', { name: /floor plans/i })
    expect(sheet).toBeInTheDocument()
    // hovering a room spot on the enlarged plan names the room; clicking it opens that room
    const spot = within(sheet).getByRole('button', { name: 'Open Master Bathroom' })
    fireEvent.mouseEnter(spot)
    expect(within(spot).getByText('Master Bathroom')).toBeInTheDocument()
    fireEvent.click(spot)
    expect(within(rooms).getByRole('button', { name: 'Master Bathroom' })).toHaveAttribute('aria-current', 'true')
    // closing fades the sheet out first, then removes it
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(sheet).toHaveClass('is-closing')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull(), { timeout: 2000 })

    // the view cone is placed for the open room and moves when the room changes
    const cone = () => document.querySelector('.plan-card__cone') as HTMLElement | null
    expect(cone()).not.toBeNull()
    const first = cone()!.style.top
    fireEvent.click(within(rooms).getByRole('button', { name: 'Kitchen' }))
    expect(cone()!.style.top).not.toBe(first)

    // switching type updates the card and the tabs
    fireEvent.click(within(types()).getByRole('button', { name: 'Types' }))
    fireEvent.click(within(types()).getByRole('button', { name: '5 BHK TWIN VILLA' }))
    expect(screen.getByRole('complementary', { name: /5 BHK Twin Villa floor plan/i })).toHaveTextContent('UNIT AREA 3,950 SQ.FT')
    expect(document.querySelector('.plan-card__loader')).not.toBeNull() // the plan area is loading
    expect(within(screen.getByRole('navigation', { name: /twin villa rooms/i })).getAllByRole('button')).toHaveLength(11)

    // opening the menu and pressing Inventory again goes back to the exterior
    fireEvent.click(screen.getByRole('button', { name: 'Expand menu' }))
    fireEvent.click(menu(/^inventory$/i))
    expect(screen.queryByRole('complementary', { name: /floor plan/i })).toBeNull()
    expect(within(types()).getAllByRole('button')).toHaveLength(6)
  })

  it('validates the enquiry form, confirms discarding, and honestly reports a demo save', () => {
    enterTour()
    fireEvent.click(screen.getByRole('button', { name: 'Guided session' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enquire now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save enquiry' }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(4)

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Asha Rao' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('dialog', { name: 'Discard enquiry?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }))

    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'asha@example.com' } })
    fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: '+971 50 123 4567' } })
    fireEvent.change(screen.getByLabelText(/unit type/i), { target: { value: '3bhk' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save enquiry' }))
    expect(screen.getByRole('dialog', { name: 'Saved on this device' })).toHaveTextContent(/No message was sent/)
    expect(JSON.parse(window.localStorage.getItem('greenz.demo.enquiries')!)).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('explains that live guided sessions are unavailable instead of pretending to connect', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Connect' }))
    expect(screen.getByRole('dialog', { name: 'Live guided session' })).toHaveTextContent(/does not include/)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Live guided session' })).toBeNull()
  })

  it('collapses the menu with Escape', () => {
    enterTour()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Expand menu' })).toBeInTheDocument()
  })
})
