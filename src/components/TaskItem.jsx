import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, GripVertical, ListChecks, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useTaskActions } from '../context/TaskContext'
import { useDeleteTask } from '../hooks/useDeleteTask'
import { useDragReorder } from '../hooks/useDragReorder'
import { formatDueDate, getDueStatus, subjectHue, subtaskProgress } from '../utils/tasks'
import TaskForm from './TaskForm'

function DueBadge({ task, today }) {
  if (!task.dueDate) return null
  const status = getDueStatus(task, today)
  const label = formatDueDate(task.dueDate, today)
  const text = status === 'overdue' ? `Overdue · ${label}` : status === 'today' ? 'Due today' : `Due ${label}`
  return (
    <span className={`badge ${status ? `badge--${status}` : ''}`}>
      <Calendar size={13} aria-hidden="true" />
      {text}
    </span>
  )
}

function DragHandle({ task, prevId, nextId }) {
  const { reorder } = useTaskActions()
  const { dragging, dragProps } = useDragReorder(task.id)
  const button = useRef(null)
  const refocus = useRef(false)

  // Keyboard moves re-order the DOM, which drops focus; put it back on the handle.
  useEffect(() => {
    if (refocus.current) button.current?.focus()
    refocus.current = false
  }, [prevId, nextId])

  const onKeyDown = (e) => {
    const target = e.key === 'ArrowUp' ? prevId : e.key === 'ArrowDown' ? nextId : null
    if (!target) return
    e.preventDefault()
    refocus.current = true
    reorder(task.id, target)
  }

  return (
    <button
      ref={button}
      type="button"
      className={`drag-handle ${dragging ? 'drag-handle--active' : ''}`}
      aria-label={`Reorder "${task.title}". Drag, or use the up and down arrow keys.`}
      onKeyDown={onKeyDown}
      {...dragProps}
    >
      <GripVertical size={18} aria-hidden="true" />
    </button>
  )
}

function TaskItem({ task, today, manual = false, prevId, nextId }) {
  const { toggle, toggleSubtask, update } = useTaskActions()
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
      <li className="task task--editing" data-task-id={task.id}>
        <TaskForm mode="edit" initialValues={task} onSubmit={handleSave} onCancel={stopEditing} />
      </li>
    )
  }

  const progress = subtaskProgress(task)

  return (
    <li className={`task ${task.completed ? 'task--done' : ''}`} data-task-id={task.id}>
      {manual && <DragHandle task={task} prevId={prevId} nextId={nextId} />}
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
        {progress.total > 0 && (
          <ul className="subtasks" aria-label={`Subtasks for "${task.title}"`}>
            {task.subtasks.map((s) => (
              <li key={s.id}>
                <label className={`subtask ${s.done ? 'subtask--done' : ''}`}>
                  <input type="checkbox" checked={s.done} onChange={() => toggleSubtask(task.id, s.id)} />
                  <span>{s.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="task__meta">
          {task.subject && (
            <span className="badge badge--subject" style={{ '--h': subjectHue(task.subject) }}>
              {task.subject}
            </span>
          )}
          <span className={`badge badge--priority-${task.priority}`}>{task.priority}</span>
          <DueBadge task={task} today={today} />
          {task.repeat !== 'none' && (
            <span className="badge badge--cap">
              <Repeat size={13} aria-hidden="true" />
              {task.repeat}
            </span>
          )}
          {progress.total > 0 && (
            <span className="badge">
              <ListChecks size={13} aria-hidden="true" />
              {progress.done}/{progress.total}
            </span>
          )}
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
