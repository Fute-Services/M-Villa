import { Suspense, lazy, useEffect, useState, type CSSProperties } from 'react'
import { STREET_POINTS, aerialPano, getCube, projectToImage } from '../data/panoramas'
import { Icon } from '../components/Icon'
import { coverOverflow, usePan, type Pan } from '../lib/pan'
import './views.css'

const PanoramaViewer = lazy(() => import('./PanoramaViewer'))

interface Props {
  onBack: () => void
  /** Changes whenever the Street View menu button is pressed again, which returns to the aerial. */
  resetSignal?: number
}

const DISSOLVE_MS = 1600
const PLAN_ZOOM = 2.6
/** Where the amenities centre sits on the plan (approximate, read off the aerial). */
const PLAN_LOGO = { x: 0.345, y: 0.38 }
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Maps image fractions to viewport pixels for a cover-fitted background that has been dragged by `pan`. */
function useCoverMapper(imageSize: [number, number], pan: Pan) {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const { scale, x: overX, y: overY } = coverOverflow(imageSize, [vp.w, vp.h])
  const offX = -pan.x * overX
  const offY = -pan.y * overY
  return (fx: number, fy: number) => ({ left: offX + fx * imageSize[0] * scale, top: offY + fy * imageSize[1] * scale })
}

interface Layer {
  id: string
  key: number
}

/**
 * Street View: the aerial with a walker hotspot per street point. Choosing one dissolves (blur) into that point's
 * 360° view, where chevrons on the ground lead to neighbouring points. The card at the bottom-left shows the
 * point's name and where it is on the plan; its arrow returns to the aerial (and, from the aerial, to Home).
 */
export function StreetView({ onBack, resetSignal = 0 }: Props) {
  const aerial = aerialPano()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [layers, setLayers] = useState<Layer[]>([])
  const [seenSignal, setSeenSignal] = useState(resetSignal)
  if (seenSignal !== resetSignal) {
    setSeenSignal(resetSignal)
    setActiveId(null)
  }
  const pan = usePan()
  const mapPoint = useCoverMapper(aerial?.size ?? [1600, 900], pan)

  // Keep the outgoing panorama underneath while the dissolve plays (derived during render, like SceneViewport).
  const top = layers[layers.length - 1]
  if (activeId && top?.id !== activeId) {
    setLayers([...(top ? [top] : []), { id: activeId, key: (top?.key ?? 0) + 1 }])
  }
  useEffect(() => {
    if (layers.length === 0 || (layers.length === 1 && activeId)) return
    const t = window.setTimeout(() => setLayers((l) => (activeId ? l.slice(-1) : [])), DISSOLVE_MS)
    return () => window.clearTimeout(t)
  }, [layers, activeId])

  const points = aerial
    ? STREET_POINTS.map((p) => ({ p, ...projectToImage(p.yaw, p.pitch, aerial.cropFrac) })).filter(
        (h) => h.x >= 0 && h.x <= 1 && h.y >= 0 && h.y <= 1,
      )
    : []
  const current = points.find((h) => h.p.id === activeId)
  const zoom = current ? PLAN_ZOOM : 1
  const planStyle = {
    '--z': zoom,
    '--tx': current ? clamp(current.x * zoom - 0.5, 0, zoom - 1) : 0,
    '--ty': current ? clamp(current.y * zoom - 0.5, 0, zoom - 1) : 0,
  } as CSSProperties
  const title = activeId ? (getCube(activeId)?.label ?? 'Street View') : 'Street View'

  return (
    <>
      {!activeId && (
        <div className="street-layer">
          {points.map(({ p, x, y }) => (
            <button
              key={p.id}
              type="button"
              className="street-hotspot"
              style={mapPoint(x, y)}
              aria-label={`Street view: ${p.label}`}
              title={p.label}
              onClick={() => setActiveId(p.id)}
            >
              <Icon name="walker" size={20} />
            </button>
          ))}
        </div>
      )}

      {layers.length > 0 && (
        <div className="street-pano">
          {layers.map((layer, i) => {
            const isCurrent = i === layers.length - 1 && layer.id === activeId
            return (
              <div key={layer.key} className={`street-pano__layer ${isCurrent ? 'is-current' : 'is-leaving'}`}>
                <Suspense fallback={null}>
                  <PanoramaViewer embedded linkStyle="chevron" panoId={layer.id} onNavigate={isCurrent ? setActiveId : undefined} />
                </Suspense>
              </div>
            )
          })}
        </div>
      )}

      <aside className="minimap" aria-label="Street view plan">
        <header>
          <button type="button" aria-label={activeId ? 'Back to the aerial' : 'Back to home'} onClick={activeId ? () => setActiveId(null) : onBack}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <h2>{title}</h2>
        </header>
        <div className="minimap__plan">
          <div className="minimap__map" style={planStyle} role="group" aria-label="Plan of the street points">
            <img
              className="minimap__logo"
              src="/brand/hiranandani-mark.png"
              alt=""
              draggable={false}
              style={{ left: `${PLAN_LOGO.x * 100}%`, top: `${PLAN_LOGO.y * 100}%` }}
            />
            {current && <span className="minimap__here" style={{ left: `${current.x * 100}%`, top: `${current.y * 100}%` }} />}
            {points.map(({ p, x, y }) => (
              <button
                key={p.id}
                type="button"
                className="minimap__dot"
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                aria-label={`Go to ${p.label}`}
                title={p.label}
                onClick={() => setActiveId(p.id)}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
