import { Suspense, lazy, useEffect, useState } from 'react'
import { hubThumb, type HubDetail } from '../data/hubs'
import { Icon } from '../components/Icon'
import './HubExplorer.css'

const PanoramaViewer = lazy(() => import('./PanoramaViewer'))

interface Props {
  hub: HubDetail
  onClose: () => void
}

/**
 * A hub opened from the Amenities aerial: a 360° view that dissolves in with a blur, and a panel on the right
 * listing the hub's views as thumbnails. Choosing a thumbnail dissolves to that view.
 */
export function HubExplorer({ hub, onClose }: Props) {
  // The picked view is remembered per hub, so switching hubs starts on that hub's first view.
  const [picked, setPicked] = useState({ hub: hub.id, item: hub.items[0].id })
  const itemId = picked.hub === hub.id ? picked.item : hub.items[0].id
  const [layers, setLayers] = useState([{ key: `${hub.id}:${hub.items[0].id}`, panoId: hub.items[0].panoId, first: true }])
  const [panelOpen, setPanelOpen] = useState(true)

  const currentKey = `${hub.id}:${itemId}`
  const top = layers[layers.length - 1]
  // Derive the next dissolve layer during render, as SceneViewport does.
  if (top.key !== currentKey) {
    setLayers([top, { key: currentKey, panoId: (hub.items.find((i) => i.id === itemId) ?? hub.items[0]).panoId, first: false }])
  }

  // The outgoing layer is only needed while the dissolve plays.
  useEffect(() => {
    if (layers.length < 2) return
    const id = window.setTimeout(() => setLayers((l) => l.slice(-1)), 1600)
    return () => window.clearTimeout(id)
  }, [layers])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="hub-explorer" role="region" aria-label={`${hub.title} 360° views`}>
      {layers.map((layer, i) => (
        <div
          key={layer.key}
          className={`hub-explorer__layer ${i === layers.length - 1 ? (layer.first ? 'is-first' : 'is-current') : 'is-leaving'}`}
        >
          <Suspense fallback={null}>
            <PanoramaViewer embedded autoRotate={6} panoId={layer.panoId} />
          </Suspense>
        </div>
      ))}

      <aside className={`hub-panel${panelOpen ? '' : ' is-collapsed'}`} aria-label={`${hub.title} views`}>
        <header className="hub-panel__header">
          <Icon name={hub.icon} size={16} />
          <span className="hub-panel__title">{hub.title}</span>
          <button
            type="button"
            className="hub-panel__toggle"
            aria-label={panelOpen ? 'Hide views' : 'Show views'}
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((o) => !o)}
          >
            <Icon name="chevronLeft" size={14} className="flip" />
          </button>
        </header>
        {panelOpen && (
          <ul className="hub-panel__list" key={hub.id}>
            {hub.items.map((item, i) => (
              <li key={item.id} style={{ animationDelay: `${i * 80}ms` }}>
                <button
                  type="button"
                  className={`hub-thumb${item.id === itemId ? ' is-active' : ''}`}
                  aria-label={item.label}
                  aria-current={item.id === itemId}
                  onClick={() => setPicked({ hub: hub.id, item: item.id })}
                >
                  <img src={hubThumb(item.panoId)} alt="" draggable={false} />
                  <span className="hub-thumb__caption">{item.label}</span>
                  <span className="hub-thumb__tip" aria-hidden="true">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}
