import { useCallback, useEffect } from 'react'
import brand from '../config/brand'
import { useTasks } from '../context/TaskContext'
import { useToast } from '../context/ToastContext'
import { dueSummary, todayISO } from '../utils/tasks'
import { notify } from '../utils/notify'
import { useLocalStorage } from './useLocalStorage'

const KEY = `${brand.storageNamespace}:reminders:v1`
const CHECK_INTERVAL_MS = 60_000
const DEFAULTS = { enabled: false, lastNotified: '' }

const sanitize = (v) =>
  v && typeof v === 'object' ? { enabled: v.enabled === true, lastNotified: String(v.lastNotified ?? '') } : null

/** One summary notification per day for due-today/overdue tasks. Works while the app is open or installed. */
export function useReminders() {
  const { tasks } = useTasks()
  const { showToast } = useToast()
  const [prefs, setPrefs] = useLocalStorage(KEY, DEFAULTS, { sanitize })
  const supported = typeof Notification !== 'undefined'
  const active = supported && prefs.enabled && Notification.permission === 'granted'

  const toggle = useCallback(async () => {
    if (prefs.enabled) {
      setPrefs((p) => ({ ...p, enabled: false }))
      return
    }
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    if (permission === 'granted') setPrefs({ enabled: true, lastNotified: '' })
    else showToast({ message: 'Notifications are blocked. Allow them in your browser settings.' })
  }, [prefs.enabled, setPrefs, showToast])

  useEffect(() => {
    if (!active) return undefined
    const check = () => {
      const today = todayISO()
      const summary = prefs.lastNotified === today ? null : dueSummary(tasks, today)
      if (!summary) return
      notify(brand.name, summary)
      setPrefs((p) => ({ ...p, lastNotified: today }))
    }
    check()
    const timer = window.setInterval(check, CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [active, tasks, prefs.lastNotified, setPrefs])

  return { supported, active, toggle }
}
