import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three'
import { getCube, nodeFor, type ImageHotspot } from '../data/panoramas'
import { directionFor } from '../lib/direction'
import { CloseButton } from '../components/Controls'
import './PanoramaViewer.css'

export interface DoorSpot {
  id: string
  label: string
  yaw: number
  pitch: number
  onOpen: () => void
}

interface Props {
  panoId: string
  /** Jump to a neighbouring point (street view). Enables the arrow hotspots from the tour graph. */
  onNavigate?: (id: string) => void
  onClose?: () => void
  /** Fill the parent instead of the whole window; no title or close button (used by Plot View). */
  embedded?: boolean
  /** Degrees per second the view drifts while idle (resumes 4 s after the last interaction). */
  autoRotate?: number
  /** Door hotspots (a ring with a door icon and the room name on hover) placed at a yaw/pitch; click opens that room. */
  doors?: DoorSpot[]
  /** Called while the view turns, with the current yaw in degrees (used to aim the floor-plan view cone). */
  onView?: (yawDeg: number) => void
  /** Look of the neighbour hotspots: a green dot, or a flat white chevron lying on the ground. */
  linkStyle?: 'dot' | 'chevron'
  /** Pins and name plates drawn at a yaw/pitch, scaled with the zoom like the tour's image hotspots. */
  imageHotspots?: ImageHotspot[]
}

const NO_LINKS: never[] = []
const NO_DOORS: DoorSpot[] = []
const NO_HOTSPOTS: ImageHotspot[] = []
const FACES = ['f', 'r', 'b', 'l', 'u', 'd'] as const
const rad = (deg: number) => (deg * Math.PI) / 180
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Places each cube face on a plane around the camera (faces are images as seen from inside the cube). */
function faceTransform(face: (typeof FACES)[number]) {
  switch (face) {
    case 'f':
      return { pos: [0, 0, -1], rot: [0, 0, 0] }
    case 'r':
      return { pos: [1, 0, 0], rot: [0, -Math.PI / 2, 0] }
    case 'b':
      return { pos: [0, 0, 1], rot: [0, Math.PI, 0] }
    case 'l':
      return { pos: [-1, 0, 0], rot: [0, Math.PI / 2, 0] }
    case 'u':
      return { pos: [0, 1, 0], rot: [Math.PI / 2, 0, 0] }
    case 'd':
      return { pos: [0, -1, 0], rot: [-Math.PI / 2, 0, 0] }
  }
}

/** 360° cube-map viewer: drag to look, wheel/pinch to zoom, arrow keys, hotspots to neighbouring points and image hotspots. */
export default function PanoramaViewer({ panoId, onNavigate, onClose, embedded = false, imageHotspots = NO_HOTSPOTS, autoRotate = 0, linkStyle = 'dot', onView, doors = NO_DOORS }: Props) {
  const pano = getCube(panoId)
  const node = nodeFor(panoId)
  const hostRef = useRef<HTMLDivElement>(null)
  const hotspotRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])
  const doorRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [loadState, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const status = !pano || !pano.available ? 'error' : loadState
  const navigable = Boolean(onNavigate)
  const links = useMemo(() => (navigable ? node.links.filter((l) => getCube(l.target)?.available) : NO_LINKS), [navigable, node])
  // Keep the latest close handler without rebuilding the WebGL scene when the parent re-renders.
  const closeRef = useRef(onClose)
  const viewRef = useRef(onView)
  useEffect(() => {
    closeRef.current = onClose
    viewRef.current = onView
  }, [onClose, onView])
  const minFov = embedded ? 20 : 35

  useEffect(() => {
    const host = hostRef.current
    if (!pano || !pano.available || !host) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: true })
    } catch {
      queueMicrotask(() => setStatus('error'))
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    host.prepend(renderer.domElement)
    renderer.domElement.className = 'pano__canvas'

    const scene = new Scene()
    const camera = new PerspectiveCamera(75, 1, 0.05, 10)
    camera.rotation.order = 'YXZ'
    const loader = new TextureLoader()
    const textures: Texture[] = []
    let remaining = FACES.length
    let failed = false
    const maxAniso = renderer.capabilities.getMaxAnisotropy()

    FACES.forEach((face) => {
      loader.load(
        `${pano.path}/${face}.webp`,
        (tex) => {
          tex.colorSpace = SRGBColorSpace
          tex.anisotropy = maxAniso
          textures.push(tex)
          const mesh = new Mesh(new PlaneGeometry(2.004, 2.004), new MeshBasicMaterial({ map: tex }))
          const t = faceTransform(face)
          mesh.position.set(t.pos[0], t.pos[1], t.pos[2])
          mesh.rotation.set(t.rot[0], t.rot[1], t.rot[2])
          scene.add(mesh)
          if (--remaining === 0 && !failed) setStatus('ready')
        },
        undefined,
        () => {
          failed = true
          setStatus('error')
        },
      )
    })

    // View state (degrees) and interaction.
    const start = node.camera
    let yaw = start?.yaw ?? 0
    let pitch = start?.pitch ?? 0
    let fov = 75
    const dom = renderer.domElement
    let dragging = false
    let lastInput = -Infinity
    let prevFrame = performance.now()
    const touch = () => (lastInput = performance.now())
    let lastX = 0
    let lastY = 0
    const pointers = new Map<number, { x: number; y: number }>()
    let pinchStart = 0

    const onDown = (e: PointerEvent) => {
      touch()
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      dom.setPointerCapture(e.pointerId)
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y)
      }
    }
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return
      touch()
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchStart) fov = clamp(fov * (pinchStart / dist), minFov, 100)
        pinchStart = dist
        return
      }
      if (!dragging) return
      const k = fov / dom.clientHeight
      yaw -= (e.clientX - lastX) * k
      pitch = clamp(pitch + (e.clientY - lastY) * k, -89, 89)
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      touch()
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchStart = 0
      if (pointers.size === 0) dragging = false
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      touch()
      fov = clamp(fov + e.deltaY * 0.05, minFov, 100)
    }
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('.dialog-backdrop')) return
      const step = 5
      if (e.key === 'ArrowLeft') yaw -= step
      else if (e.key === 'ArrowRight') yaw += step
      else if (e.key === 'ArrowUp') pitch = clamp(pitch + step, -89, 89)
      else if (e.key === 'ArrowDown') pitch = clamp(pitch - step, -89, 89)
      else if (e.key === '+' || e.key === '=') fov = clamp(fov - 5, minFov, 100)
      else if (e.key === '-') fov = clamp(fov + 5, minFov, 100)
      else if (e.key === 'Escape') closeRef.current?.()
    }
    dom.addEventListener('pointerdown', onDown)
    dom.addEventListener('pointermove', onMove)
    dom.addEventListener('pointerup', onUp)
    dom.addEventListener('pointercancel', onUp)
    dom.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    // The tour stores a horizontal field of view; the viewer zooms with a vertical one.
    if (embedded && start?.hfov) {
      fov = clamp((2 * Math.atan(Math.tan(rad(start.hfov) / 2) / camera.aspect) * 180) / Math.PI, minFov, 100)
    }

    const tmp = new Vector3()
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const now = performance.now()
      const dt = Math.min(0.05, (now - prevFrame) / 1000)
      prevFrame = now
      if (autoRotate && !dragging && now - lastInput > 4000) yaw += autoRotate * dt
      camera.fov = fov
      camera.rotation.set(rad(pitch), -rad(yaw), 0)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      renderer.render(scene, camera)
      viewRef.current?.(yaw)
      const w = host.clientWidth
      const h = host.clientHeight
      for (const link of links) {
        const el = hotspotRefs.current[link.target]
        if (!el) continue
        tmp.copy(directionFor(link.yaw, link.pitch)).project(camera)
        const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1
        el.style.display = visible ? '' : 'none'
        if (visible) {
          el.style.left = `${(tmp.x * 0.5 + 0.5) * w}px`
          el.style.top = `${(-tmp.y * 0.5 + 0.5) * h}px`
        }
      }
      for (const door of doors) {
        const el = doorRefs.current[door.id]
        if (!el) continue
        tmp.copy(directionFor(door.yaw, door.pitch)).project(camera)
        const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1
        el.style.display = visible ? '' : 'none'
        if (visible) {
          el.style.left = `${(tmp.x * 0.5 + 0.5) * w}px`
          el.style.top = `${(-tmp.y * 0.5 + 0.5) * h}px`
        }
      }
      // Image hotspots keep their angular size, so they grow and shrink as the view zooms.
      const focalPx = h / (2 * Math.tan(rad(fov) / 2))
      imageHotspots.forEach((spot, i) => {
        const el = imageRefs.current[i]
        if (!el) return
        tmp.copy(directionFor(spot.yaw, spot.pitch)).project(camera)
        const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.4 && Math.abs(tmp.y) < 1.4
        el.style.display = visible ? '' : 'none'
        if (visible) {
          el.style.left = `${(tmp.x * 0.5 + 0.5) * w}px`
          el.style.top = `${(-tmp.y * 0.5 + 0.5) * h}px`
          el.style.width = `${2 * focalPx * Math.tan(rad(spot.hfov) / 2)}px`
        }
      })
    }
    frame()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      dom.removeEventListener('pointerdown', onDown)
      dom.removeEventListener('pointermove', onMove)
      dom.removeEventListener('pointerup', onUp)
      dom.removeEventListener('pointercancel', onUp)
      dom.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      scene.traverse((obj) => {
        if (obj instanceof Mesh) {
          obj.geometry.dispose()
          ;(obj.material as MeshBasicMaterial).dispose()
        }
      })
      textures.forEach((t) => t.dispose())
      renderer.dispose()
      dom.remove()
    }
  }, [pano, node, links, doors, imageHotspots, embedded, minFov, autoRotate])

  const label = `360° view: ${pano?.label ?? 'unavailable'}`

  return (
    <div
      className={`pano${embedded ? ' pano--embedded' : ''}`}
      role={embedded ? 'region' : 'dialog'}
      aria-modal={embedded ? undefined : true}
      aria-label={label}
      ref={hostRef}
    >
      {links.map((link) => {
        const target = getCube(link.target)
        return (
          <button
            key={link.target}
            type="button"
            className={`pano__hotspot pano__hotspot--${linkStyle}`}
            ref={(el) => {
              hotspotRefs.current[link.target] = el
            }}
            aria-label={`Go to ${target?.label ?? 'next point'}`}
            title={target?.label}
            onClick={() => onNavigate?.(link.target)}
          >
            {linkStyle === 'chevron' && (
              <svg viewBox="0 0 48 28" aria-hidden="true">
                <path d="M4 24 L24 6 L44 24" />
              </svg>
            )}
          </button>
        )
      })}
      {doors.map((door) => (
        <button
          key={door.id}
          type="button"
          className="pano__door"
          ref={(el) => {
            doorRefs.current[door.id] = el
          }}
          aria-label={`Open ${door.label}`}
          onClick={door.onOpen}
        >
          <span className="pano__door-label">{door.label}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10.5" />
            <rect x="8.5" y="6.5" width="7" height="11" rx="1" />
            <circle cx="13.6" cy="12.2" r="0.7" />
          </svg>
        </button>
      ))}
      {imageHotspots.map((spot, i) => (
        <img
          key={`${spot.src}-${i}`}
          ref={(el) => {
            imageRefs.current[i] = el
          }}
          className={`pano__image-hotspot pano__image-hotspot--${spot.kind}`}
          src={spot.src}
          alt=""
          draggable={false}
          style={{ display: 'none' }}
          onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
        />
      ))}
      {!embedded && <div className="pano__title">{pano?.label}</div>}
      {status === 'loading' && <div className="pano__status">Loading 360° view…</div>}
      {status === 'error' && (
        <div className="pano__status pano__status--error" role="alert">
          The 360° images for this point are not in the project yet.
        </div>
      )}
      {!embedded && <div className="pano__help">Drag to look around · scroll to zoom</div>}
      {!embedded && onClose && (
        <div className="pano__close">
          <CloseButton onClick={onClose} label="Close 360° view" />
        </div>
      )}
    </div>
  )
}
