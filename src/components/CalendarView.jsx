import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { groupByDueDate, todayISO, toISODate } from '../utils/tasks'
import TaskItem from './TaskItem'

const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const longDateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
// 1 Jan 2024 is a Monday, so the grid starts on Monday.
const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(2024, 0, 1 + i)),
)

const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dayState(dayTasks, iso, today) {
  if (dayTasks.length === 0) return ''
  if (dayTasks.every((t) => t.completed)) return 'done'
  return iso < today && dayTasks.some((t) => !t.completed) ? 'overdue' : 'open'
}

export default function CalendarView() {
  const { visibleTasks } = useTasks()
  const today = todayISO()
  const [cursor, setCursor] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }))
  const [selected, setSelected] = useState(today)
  const byDate = useMemo(() => groupByDueDate(visibleTasks), [visibleTasks])
  const undated = useMemo(() => visibleTasks.filter((t) => !t.dueDate).length, [visibleTasks])

  const offset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells = Array.from({ length: offset + daysInMonth }, (_, i) => (i < offset ? null : i - offset + 1))

  const shiftMonth = (delta) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const goToday = () => {
    setCursor({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 })
    setSelected(today)
  }

  const selectedTasks = byDate.get(selected) ?? []

  return (
    <section className="calendar card" aria-label="Calendar">
      <div className="calendar__nav">
        <h2 className="calendar__month" aria-live="polite">
          {monthFormat.format(new Date(cursor.y, cursor.m, 1))}
        </h2>
        <div className="calendar__nav-actions">
          <button type="button" className="link-btn" onClick={goToday}>
            Today
          </button>
          <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="calendar__grid">
        {WEEKDAYS.map((name) => (
          <span key={name} className="calendar__weekday" aria-hidden="true">
            {name}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />
          const iso = toISODate(new Date(cursor.y, cursor.m, day))
          const dayTasks = byDate.get(iso) ?? []
          const state = dayState(dayTasks, iso, today)
          const count = dayTasks.length
          return (
            <button
              key={iso}
              type="button"
              className={`calendar__day ${iso === today ? 'calendar__day--today' : ''}`}
              aria-pressed={iso === selected}
              aria-label={`${longDateFormat.format(parseISO(iso))}, ${count} ${count === 1 ? 'task' : 'tasks'}`}
              onClick={() => setSelected(iso)}
            >
              <span>{day}</span>
              {count > 0 && <span className={`calendar__count calendar__count--${state}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="calendar__agenda">
        <h3 className="calendar__agenda-title">{longDateFormat.format(parseISO(selected))}</h3>
        {selectedTasks.length > 0 ? (
          <ul className="task-list" aria-label={`Tasks due ${selected}`}>
            {selectedTasks.map((task) => (
              <TaskItem key={task.id} task={task} today={today} />
            ))}
          </ul>
        ) : (
          <p className="calendar__empty">Nothing due this day.</p>
        )}
        {undated > 0 && (
          <p className="calendar__empty">
            {undated} {undated === 1 ? 'task has' : 'tasks have'} no due date. Switch to List to see them.
          </p>
        )}
      </div>
    </section>
  )
}
