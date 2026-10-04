import { useEffect, useId, useRef } from 'react'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  const dialog = useRef(null)
  const cancelButton = useRef(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement
    cancelButton.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      } else if (e.key === 'Tab') {
        // Keep focus inside the dialog.
        const items = dialog.current.querySelectorAll('button')
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        ref={dialog}
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <p id={messageId} className="dialog__text">
          {message}
        </p>
        <div className="dialog__actions">
          <button ref={cancelButton} type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
