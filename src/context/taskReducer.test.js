import { createTask } from '../utils/tasks'
import { initialTaskState, taskReducer } from './taskReducer'

const withTasks = (...tasks) => ({ ...initialTaskState, tasks })
const make = (title, extra = {}) => ({ ...createTask({ title, ...extra }, 1000), ...extra })

describe('taskReducer', () => {
  it('spawns the next occurrence when a repeating task is completed', () => {
    const task = make('Weekly review', { repeat: 'weekly', dueDate: '2026-10-05', subtasks: [{ id: 's1', title: 'Notes', done: true }] })
    const next = taskReducer(withTasks(task), { type: 'TOGGLE', id: task.id, now: 2000, nextId: 'new', today: '2026-10-05' })

    expect(next.tasks).toHaveLength(2)
    const spawned = next.tasks.find((t) => t.id === 'new')
    expect(spawned).toMatchObject({ completed: false, dueDate: '2026-10-12', repeat: 'weekly' })
    expect(spawned.subtasks[0].done).toBe(false)
    expect(next.tasks.find((t) => t.id === task.id).completed).toBe(true)
  })

  it('does not spawn anything for non-repeating tasks or when un-completing', () => {
    const plain = make('One-off')
    const done = taskReducer(withTasks(plain), { type: 'TOGGLE', id: plain.id, now: 2, nextId: 'x', today: '2026-10-05' })
    expect(done.tasks).toHaveLength(1)

    const repeating = { ...make('Daily', { repeat: 'daily', dueDate: '2026-10-05' }), completed: true }
    const undone = taskReducer(withTasks(repeating), { type: 'TOGGLE', id: repeating.id, now: 2, nextId: 'y', today: '2026-10-05' })
    expect(undone.tasks).toHaveLength(1)
    expect(undone.tasks[0].completed).toBe(false)
  })

  it('toggles a single subtask', () => {
    const task = make('Essay', { subtasks: [{ id: 'a', title: 'Outline', done: false }, { id: 'b', title: 'Draft', done: false }] })
    const next = taskReducer(withTasks(task), { type: 'TOGGLE_SUBTASK', id: task.id, subtaskId: 'b', now: 5 })
    expect(next.tasks[0].subtasks.map((s) => s.done)).toEqual([false, true])
  })

  it('reorders a task onto another task position in both directions', () => {
    const [a, b, c] = ['A', 'B', 'C'].map((t) => make(t))
    const state = withTasks(a, b, c)
    const down = taskReducer(state, { type: 'REORDER', id: a.id, overId: c.id })
    expect(down.tasks.map((t) => t.title)).toEqual(['B', 'C', 'A'])
    const up = taskReducer(state, { type: 'REORDER', id: c.id, overId: a.id })
    expect(up.tasks.map((t) => t.title)).toEqual(['C', 'A', 'B'])
  })
})
