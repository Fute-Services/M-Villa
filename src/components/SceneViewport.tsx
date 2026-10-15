import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { INITIAL_PAN, coverOverflow, panBy, type Pan } from '../lib/pan'
import './SceneViewport.css'

interface Props {
  src: string
  label: string
  /** Used for the gradient shown while the image is missing (data-scene styling). */
  scene?: string
  /** Drag position of the background (controlled). */
  pan?: Pan
  onPanChange?: (pan: Pan) => void
}

const FRICTION = 0.93
const MIN_SPEED = 0.02 // px per ms

/**
 * Full-bleed background that can be dragged within its overflow (vertically for the wide master plan, like the
 * reference), with a little inertia. When `src` changes the new image resolves out of a blur while the old one
 * blurs away underneath (the Day/Night dissolve). Falls back to a gradient if the image is missing.
 */
export function SceneViewport({ src, label, scene, pan = INITIAL_PAN, onPanChange }: Props) {
  const [layers, setLayers] = useState([{ src, key: 0 }])
  const [dragging, setDragging] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panRef = useRef(pan)
  useEffect(() => {
    panRef.current = pan
  }, [pan])
  const drag = useRef<{ id: number; x: number; y: number; t: number; vx: number; vy: number } | null>(null)
  const raf = useRef(0)
  const last = layers[layers.length - 1]

  // Derive the next layer during render instead of in an effect.
  if (last.src !== src) {
    setLayers([last, { src, key: last.key + 1 }])
  }

  const overflow = () => {
    const root = rootRef.current
    const img = root?.querySelector<HTMLImageElement>('.is-current, .is-initial')
    if (!root || !img || !img.naturalWidth || !img.naturalHeight) return { x: 0, y: 0 }
    return coverOverflow([img.naturalWidth, img.naturalHeight], [root.clientWidth, root.clientHeight])
  }

  const move = (dx: number, dy: number) => {
    const next = panBy(panRef.current, dx, dy, overflow())
    if (next.x !== panRef.current.x || next.y !== panRef.current.y) {
      panRef.current = next
      onPanChange?.(next)
      return true
    }
    return false
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !onPanChange) return
    cancelAnimationFrame(raf.current)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 }
    setDragging(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const now = performance.now()
    const dt = Math.max(1, now - d.t)
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    // Smoothed pointer velocity (px/ms), used for the inertia after release.
    d.vx = d.vx * 0.6 + (dx / dt) * 0.4
    d.vy = d.vy * 0.6 + (dy / dt) * 0.4
    d.x = e.clientX
    d.y = e.clientY
    d.t = now
    move(dx, dy)
  }

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    setDragging(false)
    let vx = d.vx
    let vy = d.vy
    let prev = performance.now()
    if (Math.hypot(vx, vy) < MIN_SPEED || performance.now() - d.t > 80) return
    const glide = (now: number) => {
      const dt = Math.min(48, now - prev)
      prev = now
      vx *= FRICTION ** (dt / 16)
      vy *= FRICTION ** (dt / 16)
      const moved = move(vx * dt, vy * dt)
      if (moved && Math.hypot(vx, vy) > MIN_SPEED) raf.current = requestAnimationFrame(glide)
    }
    raf.current = requestAnimationFrame(glide)
  }

  const style = { '--pan-x': pan.x, '--pan-y': pan.y } as CSSProperties

  return (
    <div
      ref={rootRef}
      className={`scene-viewport${dragging ? ' is-dragging' : ''}`}
      role="img"
      aria-label={label}
      data-scene={scene}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {layers.map((layer, i) => {
        const current = i === layers.length - 1
        const state = current ? (layer.key === 0 ? 'is-initial' : 'is-current') : 'is-leaving'
        return (
          <img
            key={layer.key}
            className={`scene-viewport__layer ${state}`}
            src={layer.src}
            alt=""
            draggable={false}
            onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
          />
        )
      })}
    </div>
  )
}
