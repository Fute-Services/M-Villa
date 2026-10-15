import { Suspense, lazy, useMemo, useRef, useState } from 'react'
import '@fontsource/outfit/300.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import { PLOT_VIEW_SLIDE, POI_CATEGORIES, slideSrc, type PoiCategory } from '../data/content'
import { DRONE_HOTSPOTS, DRONE_SHOT_ID, getCube } from '../data/panoramas'
import { POIS } from '../data/poi'
import { CloseButton, SegmentedToggle } from '../components/Controls'
import { Icon } from '../components/Icon'
import { PROJECT_LNG_LAT, formatLatLng } from '../lib/geo'
import type { MapHandle, MapStyle, RouteState } from './MapboxMap'
import './LocationView.css'

const MapboxMap = lazy(() => import('./MapboxMap'))
const PanoramaViewer = lazy(() => import('./PanoramaViewer'))

/** Plot View needs the Drone Shot cube faces in /public/panoramas/cube; until they are added it shows the master plan. */
const DRONE_AVAILABLE = getCube(DRONE_SHOT_ID)?.available === true

type Panel = 'location' | 'plot'

interface Props {
  onClose: () => void
}

/** "Route from property" card: spinner while the route is requested, then distance and drive time. */
function RouteCard({ name, route }: { name: string; route: RouteState }) {
  const loading = route?.status === 'loading'
  return (
    <aside className="route-card" aria-label="Route from property" aria-live="polite">
      <div className="route-card__eyebrow">Route from property</div>
      <div className="route-card__name">{name}</div>
      {loading && (
        <div className="route-card__loading">
          <span className="route-card__spinner" aria-hidden="true" />
          <span>Calculating route…</span>
        </div>
      )}
      {route?.status === 'ready' && (
        <dl className="route-card__stats">
          <div>
            <dt>Distance</dt>
            <dd>{route.distance}</dd>
          </div>
          <div>
            <dt>Drive time</dt>
            <dd>{route.duration}</dd>
          </div>
        </dl>
      )}
      <hr className="route-card__divider" />
      <div className="route-card__line" aria-hidden="true">
        <i className="route-card__origin" />
        <span className="route-card__dash" />
        <i className="route-card__dest" />
      </div>
    </aside>
  )
}

export function LocationView({ onClose }: Props) {
  const [style, setStyle] = useState<MapStyle>('satellite')
  const [panel, setPanel] = useState<Panel>('location')
  const [category, setCategory] = useState<PoiCategory | null>(null)
  const [legendOpen, setLegendOpen] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [route, setRoute] = useState<RouteState>(null)
  const [readout, setReadout] = useState(formatLatLng(...PROJECT_LNG_LAT))
  const mapHandle = useRef<MapHandle>(null)

  const counts = useMemo(() => {
    const out: Partial<Record<PoiCategory, number>> = {}
    POIS.forEach((p) => (out[p.category] = (out[p.category] ?? 0) + 1))
    return out
  }, [])
  const selected = POIS.find((p) => p.id === selectedId)

  // Choosing a category (or "Show all") clears any open route, like the reference.
  const chooseCategory = (next: PoiCategory | null) => {
    setSelectedId(null)
    setCategory(next)
  }

  return (
    <div className="location" role="dialog" aria-modal="true" aria-label="Greenz by Danube distances">
      <div className={`location__map location__map--${style}`}>
        {panel === 'location' ? (
          <Suspense fallback={<div className="map-notice">Loading map…</div>}>
            <MapboxMap
              style={style}
              pois={POIS}
              category={category}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRoute={setRoute}
              onMove={(lng, lat) => setReadout(formatLatLng(lng, lat))}
              handle={mapHandle}
            />
          </Suspense>
        ) : DRONE_AVAILABLE ? (
          <Suspense fallback={<div className="map-notice">Loading 360° view…</div>}>
            <PanoramaViewer embedded panoId={DRONE_SHOT_ID} imageHotspots={DRONE_HOTSPOTS} />
          </Suspense>
        ) : (
          <div className="location__plot">
            <img src={slideSrc(PLOT_VIEW_SLIDE)} alt="Greenz by Danube master plan" draggable={false} />
            <p className="location__plot-note" role="status">
              The 360° drone view is not in this project yet. Showing the master plan instead.
            </p>
          </div>
        )}
      </div>

      <header className="location__header">
        <h2>Greenz by Danube — Distances</h2>
        <SegmentedToggle<MapStyle>
          label="Map style"
          variant="dark"
          value={style}
          onChange={setStyle}
          options={[
            { value: 'map', label: 'Map', icon: 'map' },
            { value: 'satellite', label: 'Satellite', icon: 'satellite' },
          ]}
        />
        <div className="location__coords" aria-label="Coordinates">
          {readout}
        </div>
      </header>

      {panel === 'location' && (
        <div className="location__zoom">
          <button type="button" aria-label="Zoom in" onClick={() => mapHandle.current?.zoomIn()}>
            <Icon name="zoomIn" size={16} />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => mapHandle.current?.zoomOut()}>
            <Icon name="zoomOut" size={16} />
          </button>
          <button type="button" aria-label="Reset north" onClick={() => mapHandle.current?.resetNorth()}>
            <Icon name="compass" size={16} />
          </button>
        </div>
      )}

      <section className={`legend${legendOpen ? '' : ' is-collapsed'}`} aria-label="Map legend">
        <div className="legend__head">
          <button type="button" className="legend__title" aria-expanded={legendOpen} onClick={() => setLegendOpen((o) => !o)}>
            Map Legend
            <Icon name={legendOpen ? 'chevronDown' : 'chevronUp'} size={16} />
          </button>
          {category && legendOpen && (
            <button type="button" className="legend__showall" onClick={() => chooseCategory(null)}>
              Show all
            </button>
          )}
        </div>
        {legendOpen && (
          <ul>
            {POI_CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={category === c.id}
                  className={category && category !== c.id ? 'is-off' : ''}
                  onClick={() => chooseCategory(category === c.id ? null : c.id)}
                >
                  <span className="legend__icon" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <span className="legend__label">{c.label}</span>
                  <span className="legend__count">{counts[c.id] ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected && route && panel === 'location' && <RouteCard key={selected.id} name={selected.name} route={route} />}

      <div className="location__mode">
        <SegmentedToggle<Panel>
          label="View"
          variant="dark"
          value={panel}
          onChange={(p) => {
            setSelectedId(null)
            setPanel(p)
          }}
          options={[
            { value: 'location', label: 'Location', icon: 'pin' },
            { value: 'plot', label: 'Plot View', icon: 'plot' },
          ]}
        />
      </div>

      <div className="location__close">
        <CloseButton onClick={onClose} label="Close map" />
      </div>
    </div>
  )
}
