import { Bell, BellOff } from 'lucide-react'
import { useReminders } from '../hooks/useReminders'

export default function ReminderToggle() {
  const { supported, active, toggle } = useReminders()
  if (!supported) return null
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? 'Turn off due-date reminders' : 'Turn on due-date reminders'}
    >
      {active ? <Bell size={20} aria-hidden="true" /> : <BellOff size={20} aria-hidden="true" />}
    </button>
  )
}
