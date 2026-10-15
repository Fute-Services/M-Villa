import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WeatherWidget } from './WeatherWidget'

describe('WeatherWidget', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('shows the demo weather, then slides out and leaves the page', () => {
    render(<WeatherWidget />)
    const widget = screen.getByRole('region', { name: /weather in dubai/i })
    expect(widget).toHaveTextContent('36')
    expect(widget).toHaveTextContent('Clear Sky')
    expect(widget).not.toHaveClass('is-leaving')

    act(() => void vi.advanceTimersByTime(8100))
    expect(screen.getByRole('region', { name: /weather in dubai/i })).toHaveClass('is-leaving')

    act(() => void vi.advanceTimersByTime(800))
    expect(screen.queryByRole('region', { name: /weather in dubai/i })).toBeNull()
  })
})
