import { useEffect, useRef, useState } from 'react'
import './IntroOverlay.css'

interface Props {
  /** Called once the landing has faded out, so the tour can show Home. */
  onExplore: () => void
}

// The reference fades screens over 0.8 s.
const FADE_MS = 800

const SPARKLE =
  'M8.27 11.04c-.44-.15-.44-.76 0-.91l2.56-.85a3.4 3.4 0 0 0 2.42-2.42l.85-2.56c.15-.44.77-.44.91 0l.86 2.57a3.4 3.4 0 0 0 2.42 2.42l2.56.85c.2.07.33.25.33.45s-.13.38-.33.45l-2.56.85a3.4 3.4 0 0 0-2.42 2.42l-.85 2.56a.48.48 0 0 1-.91 0l-.85-2.56a3.4 3.4 0 0 0-2.42-2.42l-2.56-.85zM1.52 16.16a.3.3 0 0 1 0-.56l1.54-.51a1.7 1.7 0 0 0 1.45-1.45l.51-1.54a.3.3 0 0 1 .56 0l.51 1.54c.11.34.3.65.55.9s.56.44.9.55l1.54.51a.3.3 0 0 1 0 .56l-1.54.51a1.7 1.7 0 0 0-1.45 1.45l-.51 1.54a.3.3 0 0 1-.56 0l-.51-1.54a1.7 1.7 0 0 0-1.45-1.45l-1.54-.51zM.13 6.8a.19.19 0 0 1 0-.36l1.02-.34a1.1 1.1 0 0 0 .97-.97l.34-1.02a.19.19 0 0 1 .36 0l.34 1.02c.08.23.2.43.37.6s.37.3.6.37l1.02.34a.19.19 0 0 1 0 .36l-1.02.34a1.1 1.1 0 0 0-.97.97l-.34 1.02a.19.19 0 0 1-.36 0l-.34-1.02a1.1 1.1 0 0 0-.97-.97L.13 6.8z'
const SPEAKER_ON = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'
const SPEAKER_OFF = 'M3.63 3.63a1 1 0 0 0 0 1.41L7.29 8.7H4.5c-.83 0-1.5.67-1.5 1.5v3.6c0 .83.67 1.5 1.5 1.5h2.79l4.41 4.41c.63.63 1.71.18 1.71-.71v-4.89l4.89 4.89c-.58.45-1.24.79-1.97.96a1 1 0 0 0-.74 1.2c.18.53.74.86 1.28.73 1.12-.27 2.14-.83 2.99-1.59l1.83 1.83a1 1 0 1 0 1.41-1.41L5.05 3.63a1 1 0 0 0-1.42 0zM11.41 6.59 9.62 8.38l1.79 1.79V6.59zM19 12c0-1.88-.77-3.58-2.01-4.81a1 1 0 1 0-1.41 1.41c.79.79 1.28 1.88 1.28 3.08 0 .57-.11 1.12-.31 1.62l1.52 1.52c.59-.88.93-1.92.93-2.82zm-3-6.12c2.28 1.55 3.81 4.14 3.97 7.09l1.99 1.99c-.19-3.87-2.29-7.23-5.3-9.1a1 1 0 0 0-1.39.38 1.01 1.01 0 0 0 .39 1.39z'

/**
 * Landing: a full-screen looping video (sound on when the browser allows autoplay with sound, otherwise it starts
 * muted and the first click or the speaker button turns sound on). Explore fades it out onto Home.
 */
export function IntroOverlay({ onExplore }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Try to autoplay with sound; browsers that refuse get a muted autoplay and the first click unmutes it.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let unlock: (() => void) | undefined
    const unmuteOnGesture = () => {
      unlock = () => {
        video.muted = false
        setMuted(false)
        Promise.resolve(video.play()).catch(() => {})
        window.removeEventListener('pointerdown', unlock!)
        window.removeEventListener('keydown', unlock!)
      }
      window.addEventListener('pointerdown', unlock)
      window.addEventListener('keydown', unlock)
    }
    video.muted = false
    video.volume = 1
    Promise.resolve(video.play()).catch(() => {
      video.muted = true
      setMuted(true)
      Promise.resolve(video.play()).catch(() => {})
      unmuteOnGesture()
    })
    return () => {
      if (unlock) {
        window.removeEventListener('pointerdown', unlock)
        window.removeEventListener('keydown', unlock)
      }
    }
  }, [])

  const onExploreRef = useRef(onExplore)
  useEffect(() => {
    onExploreRef.current = onExplore
  })
  useEffect(() => {
    if (!leaving) return
    const t = window.setTimeout(() => {
      // Silence the landing video for good before Home shows; a removed element must not keep playing.
      const video = videoRef.current
      if (video) {
        video.muted = true
        video.pause()
      }
      onExploreRef.current()
    }, FADE_MS)
    return () => window.clearTimeout(t)
  }, [leaving])

  // Also stop it if the overlay goes away by any other route.
  useEffect(() => {
    const video = videoRef.current
    return () => video?.pause()
  }, [])

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    const next = !video.muted
    video.muted = next
    setMuted(next)
    if (!next) {
      video.volume = 1
      Promise.resolve(video.play()).catch(() => {})
    }
  }

  return (
    <div className={`intro${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="Welcome to Greenz by Danube">
      <video ref={videoRef} className="intro__video" src="/media/landing/landing-bg.mp4" autoPlay loop playsInline preload="auto" />
      <div className="intro__shade" />
      <div className="intro__content">
        <img className="intro__logo" src="/brand/hiranandani-logo.webp" alt="Hiranandani Communities" draggable={false} />
        <p className="intro__tagline">Residences | Hospitality | Entertainment</p>
        <button type="button" className="intro__explore" disabled={leaving} onClick={() => setLeaving(true)}>
          <svg viewBox="0 0 22 22" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d={SPARKLE} />
          </svg>
          explore
        </button>
      </div>
      <button type="button" className="intro__sound" aria-label={muted ? 'Unmute audio' : 'Mute audio'} onClick={toggleSound}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d={muted ? SPEAKER_OFF : SPEAKER_ON} />
        </svg>
      </button>
      <div className="intro__credit">Design by Fute Services</div>
    </div>
  )
}
