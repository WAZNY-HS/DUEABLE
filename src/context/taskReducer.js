import { nextDueDate, normalizeValues } from '../utils/tasks'

export const initialTaskState = { tasks: [], filter: 'all', query: '', view: 'list', sortMode: 'smart' }

const mapTask = (tasks, id, fn) => tasks.map((t) => (t.id === id ? fn(t) : t))

/** Next copy of a repeating task: same details, fresh id, unchecked subtasks, due date advanced. */
function spawnNext(task, { nextId, now, today }) {
  return {
    ...task,
    id: nextId,
    completed: false,
    dueDate: nextDueDate(task.dueDate || today, task.repeat),
    subtasks: task.subtasks.map((s) => ({ ...s, done: false })),
    createdAt: now,
    updatedAt: now,
  }
}

/** Pure reducer: ids, dates and timestamps come from the caller so it stays deterministic. */
export function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, tasks: [action.task, ...state.tasks] }
    case 'UPDATE':
      return {
        ...state,
        tasks: mapTask(state.tasks, action.id, (t) => ({
          ...t,
          ...normalizeValues({ ...t, ...action.changes }),
          updatedAt: action.now,
        })),
      }
    case 'DELETE':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) }
    case 'TOGGLE': {
      const task = state.tasks.find((t) => t.id === action.id)
      if (!task) return state
      const tasks = mapTask(state.tasks, action.id, (t) => ({ ...t, completed: !t.completed, updatedAt: action.now }))
      const completing = !task.completed
      return completing && task.repeat !== 'none'
        ? { ...state, tasks: [spawnNext(task, action), ...tasks] }
        : { ...state, tasks }
    }
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: mapTask(state.tasks, action.id, (t) => ({
          ...t,
          subtasks: t.subtasks.map((s) => (s.id === action.subtaskId ? { ...s, done: !s.done } : s)),
          updatedAt: action.now,
        })),
      }
    case 'REORDER': {
      const from = state.tasks.findIndex((t) => t.id === action.id)
      const to = state.tasks.findIndex((t) => t.id === action.overId)
      if (from < 0 || to < 0 || from === to) return state
      const tasks = [...state.tasks]
      tasks.splice(to, 0, tasks.splice(from, 1)[0])
      return { ...state, tasks }
    }
    case 'SET_FILTER':
      return { ...state, filter: action.filter }
    case 'SET_QUERY':
      return { ...state, query: action.query }
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'SET_SORT':
      return { ...state, sortMode: action.sortMode }
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
