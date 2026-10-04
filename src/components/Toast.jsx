import { X } from 'lucide-react'

/** The live region stays mounted so screen readers announce each new message. */
export default function Toast({ toast, onDismiss }) {
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span className="toast__message">{toast.message}</span>
          {toast.actionLabel && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.onAction()
                onDismiss()
              }}
            >
              {toast.actionLabel}
            </button>
          )}
          <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
