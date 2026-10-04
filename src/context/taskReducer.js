import { normalizeValues } from '../utils/tasks'

export const initialTaskState = { tasks: [], filter: 'all', query: '' }

/** Pure reducer: ids and timestamps are created by the caller so it stays deterministic. */
export function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, tasks: [action.task, ...state.tasks] }
    case 'UPDATE':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, ...normalizeValues({ ...t, ...action.changes }), updatedAt: action.now } : t,
        ),
      }
    case 'DELETE':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    case 'TOGGLE':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed, updatedAt: action.now } : t,
        ),
      }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    case 'SET_QUERY':
      return { ...state, query: action.query }
    case 'CLEAR_COMPLETED':
      return { ...state, tasks: state.tasks.filter((t) => !t.completed) }
    case 'RESTORE': {
      const existing = new Set(state.tasks.map((t) => t.id))
      return { ...state, tasks: [...action.tasks.filter((t) => !existing.has(t.id)), ...state.tasks] }
    }
    default:
      return state
  }
}
