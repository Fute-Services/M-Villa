import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './Controls.css'

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconName
  active?: boolean
  children: ReactNode
}

/** Glass pill button used for hubs, unit types and expanders. */
export function PillButton({ icon, active, children, className = '', ...rest }: PillButtonProps) {
  return (
    <button
      type="button"
      className={`pill-button${active ? ' is-active' : ''} ${className}`}
      aria-pressed={active}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  )
}

interface SegmentedToggleProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string; icon?: IconName }[]
  onChange: (value: T) => void
  variant?: 'glass' | 'dark'
}

/** Two-or-more segment toggle (Day/Night, Map/Satellite, Location/Plot View). */
export function SegmentedToggle<T extends string>({
  label,
  value,
  options,
  onChange,
  variant = 'glass',
}: SegmentedToggleProps<T>) {
  return (
    <div className={`segmented segmented--${variant}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`segmented__item${o.value === value ? ' is-active' : ''}`}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={18} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="close-button" onClick={onClick} aria-label={label}>
      <Icon name="close" size={26} />
    </button>
  )
}
