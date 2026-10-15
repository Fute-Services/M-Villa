import { useEffect, useState } from 'react'
import { CONTACT, MENU_ITEMS, SOCIALS } from '../data/content'
import { usePersistentState } from '../hooks/usePersistentState'
import type { SceneId } from '../scenes'
import { Icon } from './Icon'
import './SideMenu.css'

interface Props {
  scene: SceneId
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (scene: SceneId) => void
  onToggleTimeOfDay: () => void
  onGuide: () => void
}

function Logo() {
  return <img className="logo" src="/brand/logo.png" alt="Greenz by Danube" draggable={false} />
}

export function SideMenu({ scene, open, onOpenChange, onNavigate, onToggleTimeOfDay, onGuide }: Props) {
  // Escape collapses the menu (useful on mobile, where it overlays the scene).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  // On close the body blurs and fades for a moment before the panel folds into the logo chip (as in the reference).
  const [shownOpen, setShownOpen] = useState(open)
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) setShownOpen(true)
  }
  useEffect(() => {
    if (open || !shownOpen) return
    const t = window.setTimeout(() => setShownOpen(false), 650)
    return () => window.clearTimeout(t)
  }, [open, shownOpen])
  const leaving = !open && shownOpen

  // The tour has no soundtrack; this switch mutes any video (the intro) and is remembered.
  const [muted, setMuted] = usePersistentState<boolean>('greenz.muted', false)
  useEffect(() => {
    document.querySelectorAll('video').forEach((v) => (v.muted = muted))
  }, [muted])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.()
  }

  return (
    <aside className={`side-menu${shownOpen ? ' is-open' : ' is-collapsed'}`} aria-label="Main menu">
      <header className="side-menu__header">
        <Logo />
        <button
          type="button"
          className="side-menu__toggle"
          aria-label={open ? 'Collapse menu' : 'Expand menu'}
          aria-expanded={open}
          onClick={() => onOpenChange(!open)}
        >
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={22} />
        </button>
      </header>

      {shownOpen && (
        <div className={`side-menu__body${leaving ? ' is-leaving' : ''}`} aria-hidden={leaving || undefined} inert={leaving || undefined}>
          <nav className="side-menu__nav">
            {MENU_ITEMS.map((item) => {
              const current = item.scene === scene
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`menu-button${current ? ' is-current' : ''}`}
                  aria-current={current ? 'page' : undefined}
                  onClick={() => item.scene && onNavigate(item.scene)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <section className="info-card" aria-label="Contact">
            <div className="info-card__row">
              <Icon name="phone" size={34} />
              <address>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
                <a href={`https://${CONTACT.website}`} target="_blank" rel="noreferrer">
                  {CONTACT.website}
                </a>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </address>
            </div>
            <div className="info-card__row">
              <Icon name="address" size={34} />
              <p>{CONTACT.cities}</p>
            </div>
            <div className="side-menu__socials" aria-label="Social networks">
              {SOCIALS.map((s) => (
                <span key={s.id} className="round-button" role="img" aria-label={s.label}>
                  <Icon name={s.icon} size={18} />
                </span>
              ))}
            </div>
          </section>

          <div className="side-menu__controls" role="group" aria-label="Tour controls">
            <button type="button" className="round-button round-button--lg" aria-label="Toggle day and night" title="Day / night" onClick={onToggleTimeOfDay}>
              <Icon name="sun" size={26} />
            </button>
            <button type="button" className="round-button round-button--lg" aria-label="Guided session" title="Guided session" onClick={onGuide}>
              <Icon name="guide" size={26} />
            </button>
            <button
              type="button"
              className="round-button round-button--lg"
              aria-label={muted ? 'Sound off' : 'Sound on'}
              aria-pressed={muted}
              title={muted ? 'Sound off' : 'Sound on'}
              onClick={() => setMuted((m) => !m)}
            >
              <Icon name="mute" size={26} />
            </button>
            <button type="button" className="round-button round-button--lg" aria-label="Toggle fullscreen" title="Fullscreen" onClick={toggleFullscreen}>
              <Icon name="vr" size={26} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
