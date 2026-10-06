export const PRIORITIES = ['low', 'medium', 'high']
export const FILTERS = ['all', 'pending', 'completed']
export const REPEATS = ['none', 'daily', 'weekly', 'monthly']
export const LIMITS = { title: 120, subject: 30, notes: 500, subtask: 80, subtasks: 20 }

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

export const makeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

function normalizeSubtasks(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((s) => s && typeof s.title === 'string' && s.title.trim())
    .slice(0, LIMITS.subtasks)
    .map((s) => ({
      id: typeof s.id === 'string' ? s.id : makeId(),
      title: s.title.trim().slice(0, LIMITS.subtask),
      done: s.done === true,
    }))
}

export function normalizeValues(values) {
  return {
    repeat: REPEATS.includes(values.repeat) ? values.repeat : 'none',
    subtasks: normalizeSubtasks(values.subtasks),
    title: (values.title ?? '').trim(),
    subject: (values.subject ?? '').trim(),
    notes: (values.notes ?? '').trim(),
    priority: PRIORITIES.includes(values.priority) ? values.priority : 'medium',
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(values.dueDate ?? '') ? values.dueDate : '',
  }
}

export function validateTaskInput(values) {
  const errors = {}
  const title = (values.title ?? '').trim()
  if (!title) errors.title = 'Give your task a name.'
  else if (title.length > LIMITS.title) errors.title = `Keep it under ${LIMITS.title} characters.`
  return errors
}

export function createTask(values, now = Date.now()) {
  return { ...normalizeValues(values), id: makeId(), completed: false, createdAt: now, updatedAt: now }
}

const isValidTask = (t) =>
  t &&
  typeof t === 'object' &&
  typeof t.id === 'string' &&
  typeof t.title === 'string' &&
  t.title.trim() !== '' &&
  typeof t.completed === 'boolean'

/** Drops corrupted entries and fills in missing fields from untrusted (stored) data. */
export function sanitizeTasks(raw) {
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  return raw.filter(isValidTask).flatMap((t) => {
    if (seen.has(t.id)) return []
    seen.add(t.id)
    const createdAt = Number.isFinite(t.createdAt) ? t.createdAt : Date.now()
    return [
      {
        ...normalizeValues(t),
        title: t.title.trim().slice(0, LIMITS.title),
        id: t.id,
        completed: t.completed,
        createdAt,
        updatedAt: Number.isFinite(t.updatedAt) ? t.updatedAt : createdAt,
      },
    ]
  })
}

export function countTasks(tasks) {
  const completed = tasks.reduce((n, t) => n + (t.completed ? 1 : 0), 0)
  return { all: tasks.length, pending: tasks.length - completed, completed }
}

export function filterTasks(tasks, filter, query = '') {
  const q = query.trim().toLowerCase()
  return tasks.filter((t) => {
    if (filter === 'pending' && t.completed) return false
    if (filter === 'completed' && !t.completed) return false
    if (!q) return true
    return `${t.title} ${t.subject} ${t.notes}`.toLowerCase().includes(q)
  })
}

/** Pending first (soonest due, then priority, then newest); completed last (most recent first). */
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.completed) return b.updatedAt - a.updatedAt
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate < b.dueDate ? -1 : 1
    }
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.createdAt - a.createdAt
  })
}

const pad = (n) => String(n).padStart(2, '0')

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const todayISO = () => toISODate(new Date())

/** ISO dates compare correctly as strings, so no Date parsing (and no timezone drift) is needed. */
export function getDueStatus(task, today) {
  if (task.completed || !task.dueDate) return null
  if (task.dueDate < today) return 'overdue'
  return task.dueDate === today ? 'today' : 'upcoming'
}

export function formatDueDate(iso, today) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (iso === today) return 'Today'
  if (iso === toISODate(tomorrow)) return 'Tomorrow'
  const sameYear = y === Number(today.slice(0, 4))
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date)
}

export const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

export function subtaskProgress(task) {
  const done = task.subtasks.reduce((n, s) => n + (s.done ? 1 : 0), 0)
  return { done, total: task.subtasks.length }
}

/** Next occurrence for a repeating task; monthly clamps to the month's last day (31 Jan -> 28 Feb). */
export function nextDueDate(iso, repeat) {
  const [y, m, d] = iso.split('-').map(Number)
  if (repeat === 'daily') return toISODate(new Date(y, m - 1, d + 1))
  if (repeat === 'weekly') return toISODate(new Date(y, m - 1, d + 7))
  const lastDay = new Date(y, m + 1, 0).getDate()
  return toISODate(new Date(y, m, Math.min(d, lastDay)))
}

/** Stable hue (0-359) per subject so each subject keeps its own colour. */
export function subjectHue(subject) {
  let hash = 0
  for (const ch of subject.toLowerCase()) hash = (hash * 31 + ch.codePointAt(0)) % 360
  return hash
}

export function groupByDueDate(tasks) {
  const groups = new Map()
  for (const task of tasks) {
    if (!task.dueDate) continue
    groups.set(task.dueDate, [...(groups.get(task.dueDate) ?? []), task])
  }
  return groups
}

/** Reminder text for pending tasks that are due today or overdue; null when nothing needs attention. */
export function dueSummary(tasks, today) {
  let dueToday = 0
  let overdue = 0
  for (const task of tasks) {
    const status = getDueStatus(task, today)
    if (status === 'today') dueToday += 1
    else if (status === 'overdue') overdue += 1
  }
  if (!dueToday && !overdue) return null
  return [dueToday && `${dueToday} due today`, overdue && `${overdue} overdue`].filter(Boolean).join(' · ')
}
