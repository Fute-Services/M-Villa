import { useState, type ReactNode } from 'react'
import type { OptionItem } from '../data/content'
import { Icon } from './Icon'
import { PillButton } from './Controls'
import './OptionList.css'

interface Props {
  title: string
  items: OptionItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  /** Optional controls shown above the pills (e.g. filter chips). */
  header?: ReactNode
  emptyMessage?: string
  /**
   * When something is selected, start collapsed showing only the selected pill; the expander opens the full list
   * and choosing an item collapses it again. (Remount with a new `key` when the selection appears or clears.)
   */
  compact?: boolean
  /** With compact: when collapsed, show only the expander (not the selected pill). */
  hideSelectedWhenCollapsed?: boolean
  /** Visual variant: 'inventory' = raised, equal-width, smaller pills (as in the reference Inventory scene). */
  variant?: 'inventory'
}

/** Bottom-left stack of glass pills with a collapsible expander ("Hubs" / "Types"). */
export function OptionList({ title, items, selectedId, onSelect, header, emptyMessage, compact, hideSelectedWhenCollapsed, variant }: Props) {
  const collapseToSelection = Boolean(compact && selectedId)
  const [expanded, setExpanded] = useState(!collapseToSelection)
  const shown = collapseToSelection && !expanded ? items.filter((i) => i.id === selectedId) : items
  const listVisible = expanded || (collapseToSelection && !hideSelectedWhenCollapsed)

  return (
    <nav className={`option-list${variant ? ` option-list--${variant}` : ''}`} aria-label={title}>
      {expanded && header}
      {expanded && items.length === 0 && emptyMessage && <p className="option-list__empty">{emptyMessage}</p>}
      {listVisible &&
        shown.map((item, index) => (
          <PillButton
            key={item.id}
            style={{ '--pill-i': shown.length - 1 - index } as React.CSSProperties}
            icon={item.icon}
            active={item.id === selectedId}
            onClick={() => {
              if (collapseToSelection) setExpanded(false)
              onSelect(item.id)
            }}
          >
            {item.label}
          </PillButton>
        ))}
      <button
        type="button"
        className="option-list__expander pill-button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        <Icon name={expanded ? 'chevronDown' : 'chevronUp'} size={18} />
        <span>{title}</span>
      </button>
    </nav>
  )
}
