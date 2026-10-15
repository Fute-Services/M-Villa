import { useEffect, useState } from 'react'
import '@fontsource/outfit/300.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import { formatDubaiClock } from './dubaiClock'
import './WeatherWidget.css'

/**
 * Static demo weather (no API integration); the time and date are live in the Dubai timezone.
 * Values match the reference recording (36°, Clear Sky).
 */
const DEMO = { temp: 36, low: 36, high: 36, condition: 'Clear Sky', city: 'Dubai' }

/** The reference shows the widget for a few seconds after entering Home, then slides it out to the left. */
const VISIBLE_MS = 8000
const SLIDE_MS = 700

export function WeatherWidget() {
  const [now, setNow] = useState(() => new Date())
  const [phase, setPhase] = useState<'shown' | 'leaving' | 'gone'>('shown')

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30_000)
    const leave = window.setTimeout(() => setPhase('leaving'), VISIBLE_MS)
    const gone = window.setTimeout(() => setPhase('gone'), VISIBLE_MS + SLIDE_MS)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(leave)
      window.clearTimeout(gone)
    }
  }, [])

  if (phase === 'gone') return null
  const clock = formatDubaiClock(now)

  return (
    <section className={`weather${phase === 'leaving' ? ' is-leaving' : ''}`} aria-label={`Weather in ${DEMO.city}`}>
      <div className="weather__card">
        <span className="weather__cloud" aria-hidden="true" />
        <span className="weather__sun" aria-hidden="true" />
        <svg className="weather__ray" viewBox="0 0 180 136" aria-hidden="true">
          <defs>
            <linearGradient id="weather-ray" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#f6d84a" stopOpacity="0" />
              <stop offset="0.35" stopColor="#f6d84a" stopOpacity="0.9" />
              <stop offset="1" stopColor="#f0c419" stopOpacity="1" />
            </linearGradient>
          </defs>
          <line x1="22" y1="96" x2="136" y2="44" stroke="url(#weather-ray)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <div className="weather__temp">
          {DEMO.temp}
          <sup>°</sup>
        </div>
        <div className="weather__range">
          {DEMO.low}~{DEMO.high}°
        </div>
        <div className="weather__date">{clock.date}</div>
        <div className="weather__time">{clock.time}</div>
        <div className="weather__city">{DEMO.city}</div>
        <div className="weather__condition">{DEMO.condition}</div>
      </div>
    </section>
  )
}
