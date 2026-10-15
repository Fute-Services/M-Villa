import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { INITIAL_PAN } from '../lib/pan'
import { SceneViewport } from './SceneViewport'

function setup() {
  const onPanChange = vi.fn()
  const { container } = render(<SceneViewport src="/a.jpg" label="Home" pan={INITIAL_PAN} onPanChange={onPanChange} />)
  const root = container.querySelector('.scene-viewport') as HTMLElement
  const img = container.querySelector('img') as HTMLImageElement
  // A 1776x1000 image in a 1000x400 viewport fills the width and overflows 163px vertically.
  Object.defineProperty(root, 'clientWidth', { value: 1000 })
  Object.defineProperty(root, 'clientHeight', { value: 400 })
  Object.defineProperty(img, 'naturalWidth', { value: 1776 })
  Object.defineProperty(img, 'naturalHeight', { value: 1000 })
  return { root, onPanChange }
}

describe('SceneViewport drag', () => {
  it('pans vertically within the overflow and ignores horizontal movement', () => {
    const { root, onPanChange } = setup()
    fireEvent.pointerDown(root, { pointerId: 1, button: 0, clientX: 500, clientY: 300 })
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 380, clientY: 220 })
    const last = onPanChange.mock.calls.at(-1)![0]
    expect(last.x).toBe(0.5)
    expect(last.y).toBeCloseTo(80 / (1000 * (1000 / 1776) - 400), 2)
    expect(root).toHaveClass('is-dragging')
    fireEvent.pointerUp(root, { pointerId: 1 })
    expect(root).not.toHaveClass('is-dragging')
  })

  it('stops at the edge instead of dragging past the image', () => {
    const { root, onPanChange } = setup()
    fireEvent.pointerDown(root, { pointerId: 1, button: 0, clientX: 0, clientY: 390 })
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 0, clientY: 0 })
    expect(onPanChange.mock.calls.at(-1)![0].y).toBe(1)
  })
})
