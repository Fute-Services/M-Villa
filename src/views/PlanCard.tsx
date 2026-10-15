import { useEffect, useState, type CSSProperties, type RefObject } from 'react'
import { Icon } from '../components/Icon'
import type { UnitType } from '../data/inventory'

const PLAN_LOAD_MS = 1200

interface Props {
  type: UnitType
  /** Index of the open room tab (its position on the plan places the view cone). */
  room: number
  /** The plan element; the parent writes the live yaw into its `--yaw` CSS variable so the cone turns with the view. */
  planRef: RefObject<HTMLDivElement | null>
  expanded: boolean
  onExpand: () => void
  onCollapse: () => void
  /** Open a room from the enlarged plan (click on its spot). */
  onRoom: (index: number) => void
}

/**
 * Floor-plan card (top-left) and its enlarged sheet. Changing type switches the header at once, while the plan
 * area blurs with a thin progress bar and then the new plan resolves in (as in the reference).
 */
export function PlanCard({ type, room, planRef, expanded, onExpand, onCollapse, onRoom }: Props) {
  const [tip, setTip] = useState(false)
  // Closing fades the sheet out before it is removed (as in the reference).
  const [modalShown, setModalShown] = useState(expanded)
  const [prevExpanded, setPrevExpanded] = useState(expanded)
  if (prevExpanded !== expanded) {
    setPrevExpanded(expanded)
    if (expanded) setModalShown(true)
  }
  useEffect(() => {
    if (expanded || !modalShown) return
    const t = window.setTimeout(() => setModalShown(false), 500)
    return () => window.clearTimeout(t)
  }, [expanded, modalShown])
  const [hoverRoom, setHoverRoom] = useState<number | null>(null)
  const [shown, setShown] = useState(type)
  const [loading, setLoading] = useState(false)
  const [prevId, setPrevId] = useState(type.id)
  if (prevId !== type.id) {
    setPrevId(type.id)
    setLoading(true)
  }
  useEffect(() => {
    if (!loading) return
    const t = window.setTimeout(() => {
      setShown(type)
      setLoading(false)
    }, PLAN_LOAD_MS)
    return () => window.clearTimeout(t)
  }, [loading, type])

  const spot = shown.roomSpots[room] ?? null
  const coneStyle = spot
    ? ({ left: `${spot.x * 100}%`, top: `${spot.y * 100}%`, '--angle': `${spot.angle}deg` } as CSSProperties)
    : undefined

  return (
    <>
      <aside className="plan-card" aria-label={`${type.beds} ${type.title} floor plan`}>
        <header className="plan-card__head" key={type.id}>
          <div className="plan-card__beds">
            <strong>{type.beds}</strong>
            {type.bedsSuffix && <small>{type.bedsSuffix}</small>}
          </div>
          <div className="plan-card__title">
            <strong>{type.title}</strong>
            <small>{type.area}</small>
          </div>
        </header>
        <div className={`plan-card__plan${loading ? ' is-loading' : ''}`} ref={planRef}>
          <img src={shown.plan} alt={`${shown.label} floor plans`} draggable={false} />
          {!loading && coneStyle && (
            <span className="plan-card__cone" style={coneStyle} aria-hidden="true">
              <i />
            </span>
          )}
          {loading && (
            <span className="plan-card__loader" aria-hidden="true">
              <b />
            </span>
          )}
          <button
            type="button"
            className="plan-card__expand"
            aria-label="Fullscreen"
            onClick={onExpand}
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
            onFocus={() => setTip(true)}
            onBlur={() => setTip(false)}
          >
            <Icon name="expand" size={14} />
            {tip && <span className="plan-card__tip">Fullscreen</span>}
          </button>
        </div>
      </aside>

      {modalShown && (
        <div
          className={`plan-modal${expanded ? '' : ' is-closing'}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${type.label} floor plans`}
          onMouseDown={(e) => e.target === e.currentTarget && onCollapse()}
        >
          <div className="plan-modal__sheet">
            <div className="plan-modal__plan">
              <img src={type.plan} alt={`${type.label} floor plans, large`} draggable={false} />
              {type.roomSpots.map((spot, i) =>
                spot ? (
                  <button
                    key={i}
                    type="button"
                    className={`plan-modal__dot${i === room ? ' is-current' : ''}`}
                    style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }}
                    aria-label={`Open ${type.rooms[i]}`}
                    onClick={() => onRoom(i)}
                    onMouseEnter={() => setHoverRoom(i)}
                    onMouseLeave={() => setHoverRoom(null)}
                    onFocus={() => setHoverRoom(i)}
                    onBlur={() => setHoverRoom(null)}
                  >
                    {hoverRoom === i && <span className="plan-modal__tip">{type.rooms[i]}</span>}
                  </button>
                ) : null,
              )}
            </div>
          </div>
          <button type="button" className="plan-modal__close" aria-label="Close floor plan" onClick={onCollapse}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </>
  )
}
