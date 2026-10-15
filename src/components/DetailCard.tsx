import type { ReactNode } from 'react'
import { CloseButton } from './Controls'
import './DetailCard.css'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Placeholder detail panel for hubs, unit types and street panoramas (real content not supplied). */
export function DetailCard({ title, onClose, children }: Props) {
  return (
    <section className="detail-card" aria-label={title}>
      <header className="detail-card__header">
        <h2>{title}</h2>
        <CloseButton onClick={onClose} label={`Close ${title}`} />
      </header>
      <div className="detail-card__body">{children}</div>
    </section>
  )
}
