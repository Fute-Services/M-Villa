import { useRef, useState } from 'react'
import { Icon } from './Icon'
import './IntroOverlay.css'

interface Props {
  onExplore: () => void
  onConnect: () => void
}

/**
 * Loader/intro: blurred backdrop, portrait promo video with a play button, then an EXPLORE call to action.
 * Video and poster are user-supplied: /media/intro.mp4 and /media/intro-poster.jpg.
 */
export function IntroOverlay({ onExplore, onConnect }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  const start = () => {
    setStarted(true)
    // play() may return undefined (older browsers, jsdom) or reject (no video asset yet); both are fine.
    Promise.resolve(videoRef.current?.play()).catch(() => {})
  }

  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label="Welcome to Greenz by Danube" onClick={() => !started && start()}>
      <div className="intro__card" onClick={(e) => e.stopPropagation()}>
        <div className="intro__media">
          <video
            ref={videoRef}
            className="intro__video"
            src="/media/intro.mp4"
            poster="/media/intro-poster.jpg"
            playsInline
            onEnded={() => setStarted(true)}
          />
          <div className="intro__placeholder" aria-hidden="true">
            Intro video placeholder
          </div>
          {!started && (
            <button type="button" className="intro__play" aria-label="Play intro video" onClick={start}>
              <Icon name="play" size={40} />
            </button>
          )}
        </div>
        <div className="intro__footer">
          <button type="button" className="intro__explore" disabled={!started} onClick={onExplore}>
            <Icon name="explore" size={20} />
            <span>Explore</span>
          </button>
        </div>
      </div>

      <aside className="intro__live" onClick={(e) => e.stopPropagation()}>
        <p>
          <strong>Join Live Guided Session:</strong>
          <br />- Silent Mode Session -<br />(Webcam and Mic not allowed)
        </p>
        <button type="button" onClick={onConnect}>
          Connect
        </button>
      </aside>
    </div>
  )
}
