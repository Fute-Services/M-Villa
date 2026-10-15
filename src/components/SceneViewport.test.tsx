import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SceneViewport } from './SceneViewport'

describe('SceneViewport', () => {
  it('renders an accessible background with the given source', () => {
    const { container } = render(<SceneViewport src="/scenes/home-day.jpg" label="Home" />)
    expect(screen.getByRole('img', { name: 'Home' })).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/scenes/home-day.jpg')
  })

  it('keeps the previous layer underneath while the new one resolves out of a blur', () => {
    const { container, rerender } = render(<SceneViewport src="/a.jpg" label="x" />)
    expect(container.querySelector('img')).toHaveClass('is-initial')
    rerender(<SceneViewport src="/b.jpg" label="x" />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[0]).toHaveClass('is-leaving')
    expect(imgs[1]).toHaveClass('is-current')
  })
})
