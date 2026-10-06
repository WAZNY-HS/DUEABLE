import { ArrowDownUp, CalendarDays, List } from 'lucide-react'
import { useTaskActions, useTasks } from '../context/TaskContext'

export default function ViewControls() {
  const { view, sortMode } = useTasks()
  const { setView, setSortMode } = useTaskActions()
  const manual = sortMode === 'manual'

  return (
    <div className="view-controls">
      <div className="segmented segmented--two" role="group" aria-label="View">
        <button type="button" className="segmented__btn" aria-pressed={view === 'list'} onClick={() => setView('list')}>
          <List size={16} aria-hidden="true" />
          List
        </button>
        <button type="button" className="segmented__btn" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>
          <CalendarDays size={16} aria-hidden="true" />
          Calendar
        </button>
      </div>
      {view === 'list' && (
        <button
          type="button"
          className={`link-btn ${manual ? 'link-btn--on' : ''}`}
          aria-pressed={manual}
          onClick={() => setSortMode(manual ? 'smart' : 'manual')}
        >
          <ArrowDownUp size={15} aria-hidden="true" />
          Manual order
        </button>
      )}
    </div>
  )
}
