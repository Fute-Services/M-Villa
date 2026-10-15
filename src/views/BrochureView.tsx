import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { BROCHURE_SLIDE_COUNT, slideSrc } from '../data/content'
import { Icon } from '../components/Icon'
import './BrochureView.css'

interface Props {
  onClose: () => void
}

type Mode = 'scroll' | 'flip'
type Speed = 'slow' | 'normal' | 'fast'

const SPEED_MS: Record<Speed, number> = { slow: 5000, normal: 3000, fast: 1500 }
const ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 250, 300]
const PAGES = Array.from({ length: BROCHURE_SLIDE_COUNT }, (_, i) => i + 1)

/** Small stroke icons for the viewer toolbar (original paths). */
function Glyph({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

const G = {
  first: 'M7 6v12M18 6l-6 6 6 6',
  prev: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  last: 'M17 6v12M6 6l6 6-6 6',
  play: 'M8 5l11 7-11 7V5z',
  pause: 'M8 5v14M16 5v14',
  zoomIn: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3M11 8v6M8 11h6',
  zoomOut: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3M8 11h6',
  reset: 'M4 12a8 8 0 108-8H7M7 4L4 7l3 3',
  moon: 'M20 14A8 8 0 019.5 4 8 8 0 1020 14z',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  scroll: 'M4 6h16M4 12h16M4 18h16',
  flip: 'M4 5h7v14H4zM13 5h7v14h-7z',
}

/**
 * E-Brochure viewer: a dark panel with the brochure pages in a scrolling two-column list, a toolbar to jump,
 * flip, autoplay, zoom, switch theme, save a page and go fullscreen. The reference shows a 28-page PDF; this one
 * shows the 36 brochure images available in the project.
 */
export function BrochureView({ onClose }: Props) {
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<Mode>('scroll')
  const [zoom, setZoom] = useState(100)
  const [light, setLight] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>('normal')
  const [draft, setDraft] = useState('1')
  const [fullscreen, setFullscreen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const clampPage = (n: number) => Math.min(BROCHURE_SLIDE_COUNT, Math.max(1, n))

  const goTo = useCallback((n: number) => {
    const target = clampPage(n)
    setPage(target)
    setDraft(String(target))
    itemRefs.current[target - 1]?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
  }, [])

  // In scroll mode the current page follows what is at the top of the list.
  const onScroll = () => {
    const box = scrollRef.current
    if (!box || mode !== 'scroll') return
    const top = box.getBoundingClientRect().top
    const index = itemRefs.current.findIndex((el) => el && el.getBoundingClientRect().bottom - top > 40)
    if (index >= 0 && index + 1 !== page) {
      setPage(index + 1)
      setDraft(String(index + 1))
    }
  }

  // Autoplay steps through the pages and stops at the last one.
  useEffect(() => {
    if (!playing) return
    if (page >= BROCHURE_SLIDE_COUNT) {
      const t = window.setTimeout(() => setPlaying(false), 0)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => goTo(page + 1), SPEED_MS[speed])
    return () => window.clearTimeout(t)
  }, [playing, page, speed, goTo])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (document.querySelector('.dialog-backdrop')) return
      if ((e.target as HTMLElement | null)?.closest?.('input, select')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(page + 1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goTo(page - 1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, goTo, onClose])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === panelRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const switchMode = (next: Mode) => {
    setMode(next)
    if (next === 'scroll') window.setTimeout(() => goTo(page), 0)
  }

  const stepZoom = (dir: 1 | -1) => {
    const i = ZOOM_STEPS.indexOf(zoom)
    setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, Math.max(0, i + dir))])
  }

  const onPageKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') goTo(Number.parseInt(draft, 10) || page)
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void panelRef.current?.requestFullscreen?.()
  }

  const style = { '--zoom': zoom / 100 } as CSSProperties

  return (
    <div className="brochure" role="dialog" aria-modal="true" aria-label="E-Brochure">
      <div className={`brochure__panel${light ? ' is-light' : ''}`} ref={panelRef} style={style}>
        <div className="brochure__stage">
          {mode === 'scroll' ? (
            <div className="brochure__scroll" ref={scrollRef} onScroll={onScroll} data-testid="brochure-scroll">
              <div className="brochure__grid">
                {PAGES.map((n) => (
                  <div
                    key={n}
                    className={`brochure__page${n === 1 ? ' is-cover' : ''}`}
                    ref={(el) => {
                      itemRefs.current[n - 1] = el
                    }}
                  >
                    <img src={slideSrc(n - 1)} alt={`Brochure page ${n} of ${BROCHURE_SLIDE_COUNT}`} loading={n < 6 ? 'eager' : 'lazy'} draggable={false} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="brochure__flip">
              <img key={page} src={slideSrc(page - 1)} alt={`Brochure page ${page} of ${BROCHURE_SLIDE_COUNT}`} draggable={false} />
            </div>
          )}
        </div>

        <div className="brochure__bar" role="toolbar" aria-label="Brochure controls">
          <div className="brochure__group">
            <button type="button" className="bb" aria-label="First page" disabled={page === 1} onClick={() => goTo(1)}>
              <Glyph d={G.first} />
            </button>
            <button type="button" className="bb" aria-label="Previous page" disabled={page === 1} onClick={() => goTo(page - 1)}>
              <Glyph d={G.prev} />
            </button>
            <label className="brochure__pager">
              <span className="sr-only">Page number</span>
              <input
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
                onKeyDown={onPageKey}
                onBlur={() => setDraft(String(page))}
                aria-label="Page number"
              />
              <span aria-hidden="true">/ {BROCHURE_SLIDE_COUNT}</span>
            </label>
            <button type="button" className="bb" aria-label="Next page" disabled={page === BROCHURE_SLIDE_COUNT} onClick={() => goTo(page + 1)}>
              <Glyph d={G.next} />
            </button>
            <button type="button" className="bb" aria-label="Last page" disabled={page === BROCHURE_SLIDE_COUNT} onClick={() => goTo(BROCHURE_SLIDE_COUNT)}>
              <Glyph d={G.last} />
            </button>
          </div>

          <div className="brochure__seg" role="group" aria-label="View mode">
            <button type="button" aria-pressed={mode === 'scroll'} onClick={() => switchMode('scroll')}>
              <Glyph d={G.scroll} size={14} />
              Scroll
            </button>
            <button type="button" aria-pressed={mode === 'flip'} onClick={() => switchMode('flip')}>
              <Glyph d={G.flip} size={14} />
              Flip
            </button>
          </div>

          <div className="brochure__group">
            <button
              type="button"
              className={`bb${playing ? ' is-on' : ''}`}
              aria-label={playing ? 'Pause autoplay' : 'Play autoplay'}
              aria-pressed={playing}
              onClick={() => setPlaying((p) => !p)}
            >
              <Glyph d={playing ? G.pause : G.play} />
            </button>
            <select className="brochure__speed" value={speed} onChange={(e) => setSpeed(e.target.value as Speed)} aria-label="Autoplay speed">
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div className="brochure__group">
            <button type="button" className="bb" aria-label="Zoom out" disabled={zoom === ZOOM_STEPS[0]} onClick={() => stepZoom(-1)}>
              <Glyph d={G.zoomOut} />
            </button>
            <span className="brochure__zoom" aria-live="polite">
              {zoom}%
            </span>
            <button type="button" className="bb" aria-label="Zoom in" disabled={zoom === ZOOM_STEPS.at(-1)} onClick={() => stepZoom(1)}>
              <Glyph d={G.zoomIn} />
            </button>
            <button type="button" className="bb" aria-label="Reset zoom" onClick={() => setZoom(100)}>
              <Glyph d={G.reset} />
            </button>
          </div>

          <div className="brochure__group">
            <button type="button" className="bb" aria-label={light ? 'Dark theme' : 'Light theme'} onClick={() => setLight((l) => !l)}>
              <Glyph d={light ? G.moon : G.sun} />
            </button>
            <a className="bb" aria-label="Download this page" href={slideSrc(page - 1)} download={`greenz-brochure-page-${page}.webp`}>
              <Glyph d={G.download} />
            </a>
            <button type="button" className="bb" aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
              <Glyph d={G.fullscreen} />
            </button>
          </div>
        </div>

        <button type="button" className="brochure__close" aria-label="Close brochure" onClick={onClose}>
          <Icon name="close" size={24} />
        </button>
      </div>
    </div>
  )
}
