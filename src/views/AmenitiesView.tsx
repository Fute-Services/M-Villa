import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { AMENITY_PANO, HUB_SPOTS } from '../data/amenities'
import { AMENITY_HUBS } from '../data/content'
import { hubDetail } from '../data/hubs'
import { OptionList } from '../components/OptionList'
import { HubExplorer } from './HubExplorer'
import {
  HOME_VIEW,
  MAX_ZOOM,
  MIN_ZOOM,
  clampView,
  coverSize,
  dragBy,
  hubAt,
  offsetFor,
  type View,
} from '../lib/zoom'
import './AmenitiesView.css'

const ZOOM_SMOOTHING_MS = 280 // wheel zoom settles gradually, like the reference
const FRICTION = 0.94 // drag inertia, per 16 ms
const MIN_SPEED = 0.02 // px per ms
const DRAG_THRESHOLD = 4

/**
 * Amenities: the aerial can be dragged (with inertia) and zoomed with the wheel about the screen centre.
 * Hovering a hub area darkens it and fades its name plate in; choosing a hub opens its 360° views.
 */
export function AmenitiesView() {
  const [viewport, setViewport] = useState<[number, number]>([window.innerWidth, window.innerHeight])
  const [view, setView] = useState<View>(HOME_VIEW)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef(view)
  const viewportRef = useRef(viewport)
  const hoveredRef = useRef<string | null>(null)
  const targetZoom = useRef(1)
  const velocity = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const loop = useRef(0)
  const lastFrame = useRef(0)
  const pointers = useRef(new Map<number, { x: number; y: number; t: number }>())
  const pinchDist = useRef(0)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(0)

  const pano = AMENITY_PANO
  const imageSize: [number, number] = pano?.size ?? [16, 9]
  const base = coverSize(imageSize, viewport)
  const baseRef = useRef(base)
  useEffect(() => {
    baseRef.current = base
  })

  const refreshHover = (v: View) => {
    const p = pointer.current
    const id = p ? hubAt(HUB_SPOTS, p, v, baseRef.current, viewportRef.current) : null
    if (id !== hoveredRef.current) {
      hoveredRef.current = id
      setHovered(id)
    }
  }

  const apply = (next: View) => {
    const clamped = clampView(next, baseRef.current, viewportRef.current)
    viewRef.current = clamped
    setView(clamped)
    refreshHover(clamped)
  }

  const tick = (now: number) => {
    const dt = Math.min(48, now - lastFrame.current)
    lastFrame.current = now
    let v = viewRef.current
    let active = false

    const dz = targetZoom.current - v.z
    if (Math.abs(dz) > 0.0005) {
      v = { ...v, z: v.z + dz * (1 - Math.exp(-dt / ZOOM_SMOOTHING_MS)) }
      active = true
    }
    const vel = velocity.current
    if (!dragging.current && Math.hypot(vel.x, vel.y) > MIN_SPEED) {
      v = dragBy(v, vel.x * dt, vel.y * dt, baseRef.current, viewportRef.current)
      const decay = FRICTION ** (dt / 16)
      vel.x *= decay
      vel.y *= decay
      active = true
    }
    apply(v)
    loop.current = active || dragging.current ? requestAnimationFrame(tick) : 0
  }

  const ensureLoop = () => {
    if (loop.current) return
    lastFrame.current = performance.now()
    loop.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const onResize = () => {
      const vp: [number, number] = [window.innerWidth, window.innerHeight]
      viewportRef.current = vp
      setViewport(vp)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(loop.current)
      loop.current = 0
    }
  }, [])

  // Wheel zoom about the screen centre, smoothed (needs a non-passive listener to stop the page scrolling).
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      targetZoom.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom.current * Math.exp(-e.deltaY * 0.0012)))
      ensureLoop()
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
    // ensureLoop only uses refs, so the listener never goes stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Choosing a hub (button or area) opens its 360° views; choosing the open hub again returns to the aerial.
  const selectHub = (id: string) => {
    setSelected((cur) => (cur === id ? null : id))
    pointer.current = null
    refreshHover(viewRef.current)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    velocity.current = { x: 0, y: 0 }
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() })
    pointer.current = { x: e.clientX, y: e.clientY }
    refreshHover(viewRef.current) // a tap has no preceding move, so find the hub under it now
    moved.current = 0
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y)
    }
    ensureLoop()
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: e.clientX, y: e.clientY }
    const last = pointers.current.get(e.pointerId)
    if (!last) {
      refreshHover(viewRef.current)
      return
    }
    const now = performance.now()
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, t: now })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchDist.current) {
        const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewRef.current.z * (dist / pinchDist.current)))
        targetZoom.current = z
        apply({ ...viewRef.current, z })
      }
      pinchDist.current = dist
      moved.current += DRAG_THRESHOLD
      return
    }
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    const dt = Math.max(1, now - last.t)
    moved.current += Math.abs(dx) + Math.abs(dy)
    // Smoothed pointer velocity (px/ms): the image keeps gliding after release.
    velocity.current = { x: velocity.current.x * 0.6 + (dx / dt) * 0.4, y: velocity.current.y * 0.6 + (dy / dt) * 0.4 }
    apply(dragBy(viewRef.current, dx, dy, baseRef.current, viewportRef.current))
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(e.pointerId)
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchDist.current = 0
    if (pointers.current.size === 0) dragging.current = false
    // Only glide if the pointer was still moving when released.
    if (!last || performance.now() - last.t > 80) velocity.current = { x: 0, y: 0 }
    ensureLoop()
  }

  const onClick = () => {
    if (moved.current < DRAG_THRESHOLD && hoveredRef.current) selectHub(hoveredRef.current)
  }

  if (!pano) return null

  const off = offsetFor(view, base, viewport)
  const width = base.w * view.z
  const world = {
    width,
    height: base.h * view.z,
    transform: `translate(${off.x}px, ${off.y}px)`,
    '--w': `${width}px`,
  } as CSSProperties
  const activeId = selected ? null : hovered
  const openHub = selected ? hubDetail(selected) : undefined

  return (
    <>
      <div
        ref={stageRef}
        className={`amenity-stage${hovered ? ' is-hovering' : ''}`}
        data-zoom={view.z.toFixed(2)}
        data-hover={hovered ?? ''}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          pointer.current = null
          refreshHover(viewRef.current)
        }}
        onClick={onClick}
      >
        <div className="amenity-world" style={world}>
          <img src={pano.file} alt="Amenities aerial view" draggable={false} />
          <svg className="amenity-regions" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
            {HUB_SPOTS.map((spot) => (
              <polygon
                key={spot.id}
                className={activeId === spot.id ? 'is-active' : ''}
                points={spot.region.map(([x, y]) => `${x},${y}`).join(' ')}
              />
            ))}
          </svg>
          {HUB_SPOTS.map((spot) => (
            <span
              key={spot.id}
              className={`amenity-label${activeId === spot.id ? ' is-active' : ''}`}
              style={{ '--fx': spot.x, '--fy': spot.y, '--lw': spot.width, '--rot': `${spot.rotate}deg` } as CSSProperties}
              aria-hidden="true"
            >
              <span>{spot.lines[0]}</span>
              <span>{spot.lines[1]}</span>
            </span>
          ))}
        </div>
      </div>
      {openHub && <HubExplorer hub={openHub} onClose={() => setSelected(null)} />}
      <OptionList key={`hubs-${selected ?? 'aerial'}`} title="Hubs" items={AMENITY_HUBS} selectedId={selected} onSelect={selectHub} compact />
    </>
  )
}
