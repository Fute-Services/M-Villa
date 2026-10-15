import { useEffect, useId, useRef, type ReactNode } from 'react'
import './Dialog.css'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** Footer actions. */
  actions?: ReactNode
}

/** Modal dialog: Escape and backdrop click close it, focus moves in and returns on close. */
export function Dialog({ title, onClose, children, actions }: DialogProps) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      previous?.focus?.()
    }
  }, [onClose])

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <div className="dialog__body">{children}</div>
        {actions && <div className="dialog__actions">{actions}</div>}
      </div>
    </div>
  )
}

interface ConfirmProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Keep editing', onConfirm, onCancel }: ConfirmProps) {
  return (
    <Dialog
      title={title}
      onClose={onCancel}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  )
}
