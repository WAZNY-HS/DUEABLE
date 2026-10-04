import { memo } from 'react'
import { useTaskActions, useTasks } from '../context/TaskContext'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
]

function FilterTabs() {
  const { filter, counts } = useTasks()
  const { setFilter } = useTaskActions()

  return (
    <div className="segmented" role="group" aria-label="Filter tasks">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className="segmented__btn"
          aria-pressed={filter === id}
          onClick={() => setFilter(id)}
        >
          {label}
          <span className="segmented__count">{counts[id]}</span>
        </button>
      ))}
    </div>
  )
}

export default memo(FilterTabs)
