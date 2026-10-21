import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IntroOverlay } from './IntroOverlay'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe('IntroOverlay', () => {
  it('autoplays the landing video with no play button and shows logo, tagline and Explore', () => {
    const { container } = render(<IntroOverlay onExplore={() => {}} />)
    const video = container.querySelector('video')!
    expect(video).toHaveAttribute('src', '/media/landing/landing-bg.mp4')
    expect(video.autoplay).toBe(true)
    expect(video.loop).toBe(true)
    expect(screen.queryByRole('button', { name: /play/i })).toBeNull()
    expect(screen.getByRole('img', { name: 'Hiranandani Communities' })).toBeInTheDocument()
    expect(screen.getByText('Residences | Hospitality | Entertainment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explore/i })).toBeEnabled()
  })

  it('toggles the sound with the round speaker button', () => {
    render(<IntroOverlay onExplore={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mute audio' }))
    expect(screen.getByRole('button', { name: 'Unmute audio' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Unmute audio' }))
    expect(screen.getByRole('button', { name: 'Mute audio' })).toBeInTheDocument()
  })

  it('fades out on Explore and then hands over to Home exactly once, with no text screens', () => {
    const onExplore = vi.fn()
    render(<IntroOverlay onExplore={onExplore} />)
    fireEvent.click(screen.getByRole('button', { name: /explore/i }))
    expect(screen.getByRole('dialog')).toHaveClass('is-leaving')
    expect(screen.queryByRole('heading')).toBeNull()
    expect(onExplore).not.toHaveBeenCalled()

    const video = document.querySelector('video')!
    const pause = vi.spyOn(video, 'pause')
    advance(900)
    expect(onExplore).toHaveBeenCalledTimes(1)
    expect(pause).toHaveBeenCalled() // the landing sound stops when Home shows
    expect(video.muted).toBe(true)
    advance(5000)
    expect(onExplore).toHaveBeenCalledTimes(1)
  })
})
