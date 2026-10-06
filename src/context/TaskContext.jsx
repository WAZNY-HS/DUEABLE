import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import brand from '../config/brand'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  FILTERS,
  countTasks,
  createTask,
  filterTasks,
  makeId,
  sanitizeTasks,
  sortTasks,
  todayISO,
} from '../utils/tasks'
import { initialTaskState, taskReducer } from './taskReducer'

export const STORAGE_KEY = `${brand.storageNamespace}:tasks:v1`
const VIEWS = ['list', 'calendar']
const SORT_MODES = ['smart', 'manual']

const TaskStateContext = createContext(null)
const TaskActionsContext = createContext(null)

function sanitizeStored(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    tasks: sanitizeTasks(raw.tasks),
    filter: FILTERS.includes(raw.filter) ? raw.filter : 'all',
    view: VIEWS.includes(raw.view) ? raw.view : 'list',
    sortMode: SORT_MODES.includes(raw.sortMode) ? raw.sortMode : 'smart',
  }
}

/**
 * Single seam between the UI and persistence. To move to an API, replace the
 * useLocalStorage call below with a fetch/sync layer; components stay untouched.
 */
export function TaskProvider({ children }) {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, initialTaskState, { sanitize: sanitizeStored })
  const [state, dispatch] = useReducer(taskReducer, { ...initialTaskState, ...stored })
  const { tasks, filter, query, view, sortMode } = state

  useEffect(() => {
    setStored({ tasks, filter, view, sortMode })
  }, [tasks, filter, view, sortMode, setStored])

  const counts = useMemo(() => countTasks(tasks), [tasks])
  const subjects = useMemo(() => [...new Set(tasks.map((t) => t.subject).filter(Boolean))].sort(), [tasks])
  const visibleTasks = useMemo(() => {
    const matching = filterTasks(tasks, filter, query)
    return sortMode === 'manual' ? matching : sortTasks(matching)
  }, [tasks, filter, query, sortMode])

  const stateValue = useMemo(
    () => ({ tasks, filter, query, view, sortMode, counts, subjects, visibleTasks }),
    [tasks, filter, query, view, sortMode, counts, subjects, visibleTasks],
  )

  const actions = useMemo(
    () => ({
      add: (values) => dispatch({ type: 'ADD', task: createTask(values) }),
      update: (id, changes) => dispatch({ type: 'UPDATE', id, changes, now: Date.now() }),
      remove: (id) => dispatch({ type: 'DELETE', id }),
      toggle: (id) => dispatch({ type: 'TOGGLE', id, now: Date.now(), nextId: makeId(), today: todayISO() }),
      toggleSubtask: (id, subtaskId) => dispatch({ type: 'TOGGLE_SUBTASK', id, subtaskId, now: Date.now() }),
      reorder: (id, overId) => dispatch({ type: 'REORDER', id, overId }),
      restore: (restored) => dispatch({ type: 'RESTORE', tasks: restored }),
      setFilter: (next) => dispatch({ type: 'SET_FILTER', filter: next }),
      setQuery: (next) => dispatch({ type: 'SET_QUERY', query: next }),
      setView: (next) => dispatch({ type: 'SET_VIEW', view: next }),
      setSortMode: (next) => dispatch({ type: 'SET_SORT', sortMode: next }),
      clearCompleted: () => dispatch({ type: 'CLEAR_COMPLETED' }),
    }),
    [],
  )

  return (
    <TaskActionsContext.Provider value={actions}>
      <TaskStateContext.Provider value={stateValue}>{children}</TaskStateContext.Provider>
    </TaskActionsContext.Provider>
  )
}

function useRequired(context, name) {
  const value = useContext(context)
  if (!value) throw new Error(`${name} must be used inside <TaskProvider>`)
  return value
}

export const useTasks = () => useRequired(TaskStateContext, 'useTasks')
export const useTaskActions = () => useRequired(TaskActionsContext, 'useTaskActions')
