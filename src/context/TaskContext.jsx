import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import brand from '../config/brand'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createTask, countTasks, filterTasks, sanitizeTasks, sortTasks, FILTERS } from '../utils/tasks'
import { initialTaskState, taskReducer } from './taskReducer'

export const STORAGE_KEY = `${brand.storageNamespace}:tasks:v1`

const TaskStateContext = createContext(null)
const TaskActionsContext = createContext(null)

function sanitizeStored(raw) {
  if (!raw || typeof raw !== 'object') return null
  return { tasks: sanitizeTasks(raw.tasks), filter: FILTERS.includes(raw.filter) ? raw.filter : 'all' }
}

/**
 * Single seam between the UI and persistence. To move to an API, replace the
 * useLocalStorage call below with a fetch/sync layer; components stay untouched.
 */
export function TaskProvider({ children }) {
  const [stored, setStored] = useLocalStorage(
    STORAGE_KEY,
    { tasks: [], filter: 'all' },
    { sanitize: sanitizeStored },
  )
  const [state, dispatch] = useReducer(taskReducer, { ...initialTaskState, ...stored })

  useEffect(() => {
    setStored({ tasks: state.tasks, filter: state.filter })
  }, [state.tasks, state.filter, setStored])

  const counts = useMemo(() => countTasks(state.tasks), [state.tasks])
  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(state.tasks, state.filter, state.query)),
    [state.tasks, state.filter, state.query],
  )

  const stateValue = useMemo(
    () => ({ filter: state.filter, query: state.query, counts, visibleTasks }),
    [state.filter, state.query, counts, visibleTasks],
  )

  const actions = useMemo(
    () => ({
      add: (values) => dispatch({ type: 'ADD', task: createTask(values) }),
      update: (id, changes) => dispatch({ type: 'UPDATE', id, changes, now: Date.now() }),
      remove: (id) => dispatch({ type: 'DELETE', id }),
      toggle: (id) => dispatch({ type: 'TOGGLE', id, now: Date.now() }),
      restore: (tasks) => dispatch({ type: 'RESTORE', tasks }),
      setFilter: (filter) => dispatch({ type: 'SET_FILTER', filter }),
      setQuery: (query) => dispatch({ type: 'SET_QUERY', query }),
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
