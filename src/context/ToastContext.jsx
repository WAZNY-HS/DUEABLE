import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext(null)
export const TOAST_DURATION_MS = 5000

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(0)

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const showToast = useCallback(
    (next) => {
      window.clearTimeout(timer.current)
      setToast({ ...next, id: Date.now() })
      timer.current = window.setTimeout(dismiss, TOAST_DURATION_MS)
    },
    [dismiss],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside <ToastProvider>')
  return value
}
