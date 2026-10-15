import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { FLAT_FILES, FLAT_PANOS, getCube, nodeFor } from '../data/panoramas'

import type { DoorSpot } from './PanoramaViewer'
import { INVENTORY_PANO_ID, UNIT_TYPES } from '../data/inventory'
import { OptionList } from '../components/OptionList'
import { PlanCard } from './PlanCard'
import { HOME_VIEW, clampView, coverSize, dragBy, offsetFor, type View } from '../lib/zoom'
import './InventoryView.css'

const PanoramaViewer = lazy(() => import('./PanoramaViewer'))

/** The exterior is shown larger than the screen and dragged around (measured from the reference recording). */
const EXTERIOR_ZOOM = 1.35
const DISSOLVE_MS = 1600
const exteriorPano = FLAT_PANOS.find((p) => FLAT_FILES.inventory === p.file)
const EXTERIOR_VIEW: View = { ...HOME_VIEW, z: EXTERIOR_ZOOM }

interface Layer {
  key: string
  panoId: string
}

interface Props {
  /** Collapse the side menu once a type is opened (the reference does). */
  onOpenType: () => void
  /** Changes when the Inventory menu button is pressed again, which returns to the exterior. */
  resetSignal?: number
}

/**
 * Inventory: a draggable exterior with the list of unit types. Choosing a type dissolves into a 360° interior
 * with a floor-plan card (top-left, expandable), room tabs along the bottom and the Types list.
 */
export function InventoryView({ onOpenType, resetSignal = 0 }: Props) {
  const [typeId, setTypeId] = useState<string | null>(null)
  const [roomIndex, setRoomIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [layers, setLayers] = useState<Layer[]>([])
  const [seenSignal, setSeenSignal] = useState(resetSignal)
  const type = UNIT_TYPES.find((t) => t.id === typeId)
  const planRef = useRef<HTMLDivElement>(null)
  // The plan cone follows the camera: the yaw is written straight to a CSS variable (no re-render per frame).
  const onView = useCallback((yaw: number) => planRef.current?.style.setProperty('--yaw', `${yaw.toFixed(1)}deg`), [])

  // Derived state: pressing the menu button again returns to the exterior.
  if (seenSignal !== resetSignal) {
    setSeenSignal(resetSignal)
    setTypeId(null)
    setExpanded(false)
  }

  // Keep the outgoing panorama underneath while the dissolve plays (derived during render, like SceneViewport).
  const wantedKey = type ? `${type.id}:${roomIndex}` : null
  const top = layers[layers.length - 1]
  if (wantedKey && top?.key !== wantedKey) {
    setLayers([...(top ? [top] : []), { key: wantedKey, panoId: INVENTORY_PANO_ID }])
  }
  useEffect(() => {
    if (layers.length === 0 || (layers.length === 1 && wantedKey)) return
    const t = window.setTimeout(() => setLayers((l) => (wantedKey ? l.slice(-1) : [])), DISSOLVE_MS)
    return () => window.clearTimeout(t)
  }, [layers, wantedKey])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setExpanded(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [expanded])

  // Doors in the panorama lead to rooms of the open type (the tour links the living room to the kitchen and master bedroom).
  const doors = useMemo<DoorSpot[]>(() => {
    if (!type) return []
    const find = (needle: string) => type.rooms.findIndex((r) => r.toLowerCase().includes(needle))
    return nodeFor(INVENTORY_PANO_ID).links.flatMap((l) => {
      const label = getCube(l.target)?.label ?? ''
      const room = /kitchen/i.test(label) ? find('kitchen') : /master/i.test(label) ? find('master bedroom') : -1
      return room < 0 ? [] : [{ id: l.target, label: type.rooms[room], yaw: l.yaw, pitch: l.pitch, onOpen: () => setRoomIndex(room) }]
    })
  }, [type])

  const choose = (id: string) => {
    if (id !== typeId) setRoomIndex(0)
    if (!typeId) onOpenType()
    setTypeId(id)
  }

  return (
    <>
      {!type && <Exterior />}

      {layers.length > 0 && (
        <div className="inventory-pano">
          {layers.map((layer, i) => {
            const isCurrent = i === layers.length - 1 && layer.key === wantedKey
            return (
              <div key={layer.key} className={`inventory-pano__layer ${isCurrent ? 'is-current' : 'is-leaving'}`}>
                <Suspense fallback={null}>
                  <PanoramaViewer embedded panoId={layer.panoId} onView={isCurrent ? onView : undefined} doors={isCurrent ? doors : undefined} />
                </Suspense>
              </div>
            )
          })}
        </div>
      )}

      {type && (
        <>
          <PlanCard type={type} room={roomIndex} planRef={planRef} expanded={expanded} onExpand={() => setExpanded(true)} onCollapse={() => setExpanded(false)} onRoom={setRoomIndex} />
          <nav className="room-tabs" aria-label={`${type.title} rooms`} key={type.id}>
            {type.rooms.map((room, i) => (
              <button
                key={`${room}-${i}`}
                type="button"
                className={`room-tab${i === roomIndex ? ' is-active' : ''}`}
                aria-current={i === roomIndex}
                onClick={() => setRoomIndex(i)}
              >
                {room}
              </button>
            ))}
          </nav>
        </>
      )}

      <OptionList
        key={`types-${type?.id ?? 'exterior'}`}
        title="Types"
        items={UNIT_TYPES.map((t) => ({ id: t.id, label: t.label, icon: t.icon, slide: 0 }))}
        selectedId={typeId}
        onSelect={choose}
        compact
        hideSelectedWhenCollapsed
        variant="inventory"
      />
    </>
  )
}

function Exterior() {
  const [viewport, setViewport] = useState<[number, number]>([window.innerWidth, window.innerHeight])
  const [view, setView] = useState<View>(EXTERIOR_VIEW)
  const viewRef = useRef(view)
  const viewportRef = useRef(viewport)
  const last = useRef<{ id: number; x: number; y: number } | null>(null)
  const size: [number, number] = exteriorPano?.size ?? [16, 9]
  const base = coverSize(size, viewport)
  const baseRef = useRef(base)
  useEffect(() => {
    baseRef.current = base
  })
  useEffect(() => {
    viewRef.current = view
    viewportRef.current = viewport
  })
  useEffect(() => {
    const onResize = () => setViewport([window.innerWidth, window.innerHeight])
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!exteriorPano) return null
  const off = offsetFor(clampView(view, base, viewport), base, viewport)
  const z = clampView(view, base, viewport).z

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    last.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const l = last.current
    if (!l || l.id !== e.pointerId) return
    const next = dragBy(viewRef.current, e.clientX - l.x, e.clientY - l.y, baseRef.current, viewportRef.current)
    last.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
    viewRef.current = next
    setView(next)
  }
  const onUp = () => {
    last.current = null
  }

  const style = { width: base.w * z, height: base.h * z, transform: `translate(${off.x}px, ${off.y}px)` } as CSSProperties
  return (
    <div
      className="inventory-stage"
      data-zoom={z.toFixed(2)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <img className="inventory-stage__img" src={exteriorPano.file} alt="Townhouse exterior" draggable={false} style={style} />
    </div>
  )
}

