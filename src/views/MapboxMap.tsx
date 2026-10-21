import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import type { Feature, FeatureCollection, LineString } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { POI_CATEGORIES, type PoiCategory } from '../data/content'
import type { Poi } from '../data/poi'
import { fetchRoute } from '../lib/directions'
import { MAPBOX_TOKEN, hasMapboxToken } from '../lib/mapbox'
import { PROJECT_LNG_LAT } from '../lib/geo'
import './MapboxMap.css'

export type MapStyle = 'map' | 'satellite'

export type RouteState = { status: 'loading' } | { status: 'ready'; distance: string; duration: string } | null

export interface MapHandle {
  zoomIn: () => void
  zoomOut: () => void
  resetNorth: () => void
}

interface Props {
  style: MapStyle
  pois: Poi[]
  /** Legend filter: only this category is shown when set. */
  category: PoiCategory | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRoute: (state: RouteState) => void
  onMove: (lng: number, lat: number) => void
  handle?: Ref<MapHandle>
}

const STYLE_URLS: Record<MapStyle, string> = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  map: 'mapbox://styles/mapbox/dark-v11',
}

const HOME_VIEW = { center: [55.32, 25.16] as [number, number], zoom: 11.5 }
const GOLD = '#c9a96e'
const emojiFor = (id: PoiCategory) => POI_CATEGORIES.find((c) => c.id === id)!.emoji
const labelFor = (id: PoiCategory) => POI_CATEGORIES.find((c) => c.id === id)!.label

const EMPTY_LINE: Feature<LineString> = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }

/** Route and 1–5 km radius rings; re-added after every style change because setStyle drops custom layers. */
function addOverlays(map: mapboxgl.Map, routeData: Feature<LineString>) {
  map.addSource('route', { type: 'geojson', data: routeData })
  map.addLayer({
    id: 'route-glow',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': 14, 'line-opacity': 0.09, 'line-blur': 8 },
  })
  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#ffffff', 'line-width': 2.5, 'line-opacity': 0.95 },
  })

  const [lng, lat] = PROJECT_LNG_LAT
  for (const km of [1, 2, 3, 4, 5]) {
    const r = (km * 1000) / 111320
    const ring = Array.from({ length: 81 }, (_, i) => {
      const a = (i / 80) * 2 * Math.PI
      return [lng + r * Math.cos(a), lat + r * Math.sin(a)] as [number, number]
    })
    map.addSource(`radius-${km}`, {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: ring } },
    })
    map.addLayer({
      id: `radius-line-${km}`,
      type: 'line',
      source: `radius-${km}`,
      paint: { 'line-color': GOLD, 'line-width': 1, 'line-opacity': 0.22, 'line-dasharray': [4, 5] },
    })
    map.addSource(`rlbl-${km}`, {
      type: 'geojson',
      data: { type: 'Feature', properties: { label: `${km} km` }, geometry: { type: 'Point', coordinates: [lng, lat + r] } },
    })
    map.addLayer({
      id: `rlbl-${km}`,
      type: 'symbol',
      source: `rlbl-${km}`,
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Open Sans Light', 'Arial Unicode MS Regular'],
        'text-size': 10,
        'text-offset': [0, 0.5],
      },
      paint: { 'text-color': GOLD, 'text-opacity': 0.6 },
    })
  }
}

function logoMarkerElement() {
  const wrap = document.createElement('div')
  wrap.className = 'logo-marker-wrap'
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div')
    ring.className = 'pulse-ring'
    wrap.append(ring)
  }
  const img = document.createElement('img')
  img.className = 'logo-img'
  img.src = '/brand/hiranandani-mark.png'
  img.alt = 'Hiranandani Communities'
  img.draggable = false
  wrap.append(img)
  return wrap
}

export default function MapboxMap({ style, pois, category, selectedId, onSelect, onRoute, onMove, handle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ marker: mapboxgl.Marker; inner: HTMLButtonElement; poi: Poi }[]>([])
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const routeDataRef = useRef<Feature<LineString>>(EMPTY_LINE)
  const cb = useRef({ onSelect, onRoute, onMove })
  cb.current = { onSelect, onRoute, onMove }
  const [error, setError] = useState<string | null>(null)

  useImperativeHandle(
    handle,
    () => ({
      zoomIn: () => mapRef.current?.zoomIn(),
      zoomOut: () => mapRef.current?.zoomOut(),
      resetNorth: () => mapRef.current?.resetNorthPitch(),
    }),
    [],
  )

  const setRouteData = (data: Feature<LineString>) => {
    routeDataRef.current = data
    const source = mapRef.current?.getSource('route') as mapboxgl.GeoJSONSource | undefined
    source?.setData(data as unknown as FeatureCollection | Feature)
  }

  // Create the map, the project logo and every POI marker once.
  useEffect(() => {
    if (!hasMapboxToken || !containerRef.current) return
    mapboxgl.accessToken = MAPBOX_TOKEN
    let map: mapboxgl.Map
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: STYLE_URLS.satellite,
        center: HOME_VIEW.center,
        zoom: HOME_VIEW.zoom,
        logoPosition: 'bottom-left',
      })
    } catch {
      queueMicrotask(() => setError('This browser could not start the map (WebGL is unavailable).'))
      return
    }
    mapRef.current = map

    map.on('move', () => {
      const c = map.getCenter()
      cb.current.onMove(c.lng, c.lat)
    })
    map.on('error', (e) => {
      const status = (e.error as { status?: number } | undefined)?.status
      if (status === 401 || status === 403) setError('Mapbox rejected the token. Check VITE_MAPBOX_TOKEN and its URL restrictions.')
    })
    map.on('style.load', () => addOverlays(map, routeDataRef.current))
    // A click on empty map clears the selected route (marker clicks stop propagation).
    map.on('click', () => cb.current.onSelect(null))

    new mapboxgl.Marker({ element: logoMarkerElement(), anchor: 'center' }).setLngLat(PROJECT_LNG_LAT).addTo(map)

    markersRef.current = pois.map((poi) => {
      const wrap = document.createElement('div')
      const inner = document.createElement('button')
      inner.type = 'button'
      inner.className = 'amenity-marker'
      inner.textContent = emojiFor(poi.category)
      inner.setAttribute('aria-label', `${labelFor(poi.category)}: ${poi.name}`)
      inner.addEventListener('click', (e) => {
        e.stopPropagation()
        cb.current.onSelect(poi.id)
      })
      wrap.append(inner)
      const marker = new mapboxgl.Marker({ element: wrap, anchor: 'center' }).setLngLat(poi.lngLat).addTo(map)
      return { marker, inner, poi }
    })

    return () => {
      popupRef.current = null
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
    // The map and markers are created once; later changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Map / Satellite toggle.
  const appliedStyle = useRef<MapStyle>('satellite')
  useEffect(() => {
    const map = mapRef.current
    if (!map || appliedStyle.current === style) return
    appliedStyle.current = style
    const center = map.getCenter()
    const zoom = map.getZoom()
    map.setStyle(STYLE_URLS[style])
    map.once('style.load', () => map.jumpTo({ center, zoom }))
  }, [style])

  // Legend filter: hide other categories and frame what is left (or fly home on reset).
  const previousCategory = useRef<PoiCategory | null>(null)
  useEffect(() => {
    markersRef.current.forEach(({ inner, poi }) => {
      const hidden = category !== null && poi.category !== category
      inner.classList.toggle('hidden-marker', hidden)
      inner.tabIndex = hidden ? -1 : 0
    })
    const map = mapRef.current
    if (!map || previousCategory.current === category) return
    previousCategory.current = category
    if (category) {
      const bounds = new mapboxgl.LngLatBounds(PROJECT_LNG_LAT, PROJECT_LNG_LAT)
      pois.filter((p) => p.category === category).forEach((p) => bounds.extend(p.lngLat))
      map.fitBounds(bounds, { padding: { top: 100, bottom: 120, left: 240, right: 100 }, duration: 800, maxZoom: 14 })
    } else {
      map.flyTo({ center: HOME_VIEW.center, zoom: HOME_VIEW.zoom, duration: 700 })
    }
  }, [category, pois])

  // Selection: popup, route request, route line and framing.
  useEffect(() => {
    const map = mapRef.current
    markersRef.current.forEach(({ inner, poi }) => inner.classList.toggle('active', poi.id === selectedId))

    const old = popupRef.current
    popupRef.current = null
    old?.remove()
    setRouteData(EMPTY_LINE)

    const poi = pois.find((p) => p.id === selectedId)
    if (!map || !poi) {
      cb.current.onRoute(null)
      return
    }

    const content = document.createElement('div')
    const cat = document.createElement('div')
    cat.className = 'popup-cat'
    cat.textContent = labelFor(poi.category)
    const name = document.createElement('div')
    name.className = 'popup-name'
    name.textContent = poi.name
    const dist = document.createElement('div')
    dist.className = 'popup-dist'
    dist.textContent = `${poi.dist} from property`
    content.append(cat, name, dist)

    const popup = new mapboxgl.Popup({ offset: 24, closeButton: true, closeOnClick: false })
      .setDOMContent(content)
      .setLngLat(poi.lngLat)
      .addTo(map)
    popup.on('close', () => {
      // Only a user closing the active popup clears the selection.
      if (popupRef.current === popup) cb.current.onSelect(null)
    })
    popupRef.current = popup

    const controller = new AbortController()
    cb.current.onRoute({ status: 'loading' })
    void fetchRoute(PROJECT_LNG_LAT, poi.lngLat, controller.signal).then((route) => {
      if (controller.signal.aborted) return
      const bounds = new mapboxgl.LngLatBounds(PROJECT_LNG_LAT, PROJECT_LNG_LAT)
      if (route) {
        setRouteData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.coords } })
        route.coords.forEach((c) => bounds.extend(c))
        cb.current.onRoute({ status: 'ready', distance: `${route.distanceKm.toFixed(1)} km`, duration: `${route.durationMin} min` })
        map.fitBounds(bounds, { padding: { top: 100, bottom: 130, left: 240, right: 280 }, duration: 900, maxZoom: 16 })
      } else {
        bounds.extend(poi.lngLat)
        cb.current.onRoute({ status: 'ready', distance: poi.dist, duration: '—' })
        map.fitBounds(bounds, { padding: 130, duration: 900, maxZoom: 14 })
      }
    })
    return () => controller.abort()
  }, [selectedId, pois])

  if (!hasMapboxToken) {
    return (
      <div className="map-notice" role="alert">
        <strong>Map needs a Mapbox token.</strong>
        <span>
          Put your public token (starts with <code>pk.</code>) in <code>.env.local</code> as{' '}
          <code>VITE_MAPBOX_TOKEN</code>, save the file, then restart <code>npm run dev</code>.
        </span>
      </div>
    )
  }

  return (
    <>
      <div ref={containerRef} className="map-canvas" aria-label="Interactive map" />
      {error && (
        <div className="map-notice" role="alert">
          {error}
        </div>
      )}
    </>
  )
}
