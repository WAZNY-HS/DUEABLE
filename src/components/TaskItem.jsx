import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, Pencil, Trash2 } from 'lucide-react'
import { useTaskActions } from '../context/TaskContext'
import { useDeleteTask } from '../hooks/useDeleteTask'
import { formatDueDate, getDueStatus } from '../utils/tasks'
import TaskForm from './TaskForm'

function DueBadge({ task, today }) {
  const status = getDueStatus(task, today)
  if (!task.dueDate) return null
  const label = formatDueDate(task.dueDate, today)
  const text = status === 'overdue' ? `Overdue · ${label}` : status === 'today' ? 'Due today' : `Due ${label}`
  return (
    <span className={`badge ${status ? `badge--${status}` : ''}`}>
      <Calendar size={13} aria-hidden="true" />
      {text}
    </span>
  )
}

function TaskItem({ task, today }) {
  const { toggle, update } = useTaskActions()
  const deleteTask = useDeleteTask()
  const [editing, setEditing] = useState(false)
  const editButton = useRef(null)
  const wasEditing = useRef(false)

  useEffect(() => {
    if (wasEditing.current && !editing) editButton.current?.focus()
    wasEditing.current = editing
  }, [editing])

  const handleSave = useCallback(
    (values) => {
      update(task.id, values)
      setEditing(false)
    },
    [update, task.id],
  )
  const stopEditing = useCallback(() => setEditing(false), [])

  if (editing) {
    return (
      <li className="task task--editing">
        <TaskForm mode="edit" initialValues={task} onSubmit={handleSave} onCancel={stopEditing} />
      </li>
    )
  }

  return (
    <li className={`task ${task.completed ? 'task--done' : ''}`}>
      <label className="check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
        />
        <span className="check__box" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      </label>

      <div className="task__body">
        <p className="task__title">{task.title}</p>
        {task.notes && <p className="task__notes">{task.notes}</p>}
        <div className="task__meta">
          {task.subject && <span className="badge badge--subject">{task.subject}</span>}
          <span className={`badge badge--priority-${task.priority}`}>{task.priority}</span>
          <DueBadge task={task} today={today} />
        </div>
      </div>

      <div className="task__actions">
        <button
          ref={editButton}
          type="button"
          className="icon-btn"
          onClick={() => setEditing(true)}
          aria-label={`Edit "${task.title}"`}
        >
          <Pencil size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn icon-btn--danger" onClick={() => deleteTask(task)} aria-label={`Delete "${task.title}"`}>
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

export default memo(TaskItem)
