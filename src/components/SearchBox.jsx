import { Search, X } from 'lucide-react'
import { useTaskActions, useTasks } from '../context/TaskContext'
import { SEARCH_INPUT_ID } from '../hooks/useHotkeys'

export default function SearchBox() {
  const { query } = useTasks()
  const { setQuery } = useTaskActions()

  return (
    <div className="search">
      <label className="sr-only" htmlFor={SEARCH_INPUT_ID}>
        Search tasks
      </label>
      <Search size={18} className="search__icon" aria-hidden="true" />
      <input
        id={SEARCH_INPUT_ID}
        className="input search__input"
        type="text"
        placeholder="Search tasks"
        value={query}
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setQuery('')
            e.currentTarget.blur()
          }
        }}
      />
      {query && (
        <button type="button" className="search__clear" onClick={() => setQuery('')} aria-label="Clear search">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
