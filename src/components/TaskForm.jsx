import { useId, useState } from 'react'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { NEW_TASK_INPUT_ID } from '../hooks/useHotkeys'
import { LIMITS, PRIORITIES, REPEATS, makeId, validateTaskInput } from '../utils/tasks'

const EMPTY = { title: '', subject: '', priority: 'medium', dueDate: '', notes: '', repeat: 'none', subtasks: [] }

/** Used for both adding (mode="add") and inline editing (mode="edit"). */
export default function TaskForm({ mode = 'add', initialValues, onSubmit, onCancel }) {
  const isEdit = mode === 'edit'
  const uid = useId()
  const titleId = isEdit ? `${uid}-title` : NEW_TASK_INPUT_ID
  const errorId = `${uid}-error`
  const optionsId = `${uid}-options`

  const [values, setValues] = useState({ ...EMPTY, ...initialValues })
  const [errors, setErrors] = useState({})
  const [showOptions, setShowOptions] = useState(isEdit)
  const [subtaskDraft, setSubtaskDraft] = useState('')
  const { subjects } = useTasks()

  const addSubtask = () => {
    const title = subtaskDraft.trim()
    if (!title || values.subtasks.length >= LIMITS.subtasks) return
    setValues((v) => ({ ...v, subtasks: [...v.subtasks, { id: makeId(), title, done: false }] }))
    setSubtaskDraft('')
  }

  const removeSubtask = (id) => setValues((v) => ({ ...v, subtasks: v.subtasks.filter((s) => s.id !== id) }))

  const setField = (field) => (e) => {
    const { value } = e.target
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const found = validateTaskInput(values)
    if (found.title) {
      setErrors(found)
      return
    }
    const draft = subtaskDraft.trim()
    const subtasks = draft ? [...values.subtasks, { id: makeId(), title: draft, done: false }] : values.subtasks
    onSubmit({ ...values, subtasks })
    if (!isEdit) {
      setValues(EMPTY)
      setErrors({})
      setSubtaskDraft('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key !== 'Escape') return
    if (isEdit) onCancel()
    else if (values.title) {
      setValues(EMPTY)
      setErrors({})
    } else e.target.blur()
  }

  const titleLength = values.title.trim().length
  const nearLimit = titleLength > LIMITS.title * 0.8

  return (
    <form className={`task-form ${isEdit ? 'task-form--edit' : 'card'}`} onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
      <div className="task-form__row">
        <div className="task-form__title">
          <label className="sr-only" htmlFor={titleId}>
            {isEdit ? 'Edit task title' : 'New task title'}
          </label>
          <input
            id={titleId}
            className="input"
            type="text"
            placeholder={isEdit ? 'Task title' : 'What needs doing?'}
            value={values.title}
            onChange={setField('title')}
            autoComplete="off"
            autoFocus={isEdit}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? errorId : undefined}
          />
        </div>
        {!isEdit && (
          <button type="submit" className="btn btn--primary">
            <Plus size={18} aria-hidden="true" />
            <span>Add task</span>
          </button>
        )}
      </div>

      {(errors.title || nearLimit) && (
        <div className="task-form__meta">
          <p id={errorId} className="field-error" role={errors.title ? 'alert' : undefined}>
            {errors.title}
          </p>
          {nearLimit && (
            <span className={`counter ${titleLength > LIMITS.title ? 'counter--over' : ''}`}>
              {titleLength}/{LIMITS.title}
            </span>
          )}
        </div>
      )}

      {!isEdit && (
        <button
          type="button"
          className="link-btn"
          aria-expanded={showOptions}
          aria-controls={optionsId}
          onClick={() => setShowOptions((open) => !open)}
        >
          More options
          <ChevronDown size={16} aria-hidden="true" className={showOptions ? 'chevron chevron--open' : 'chevron'} />
        </button>
      )}

      {showOptions && (
        <div id={optionsId} className="task-form__options">
          <div className="field">
            <label htmlFor={`${uid}-subject`}>Subject</label>
            <input
              id={`${uid}-subject`}
              className="input"
              type="text"
              placeholder="e.g. Biology"
              maxLength={LIMITS.subject}
              value={values.subject}
              onChange={setField('subject')}
              autoComplete="off"
              list={`${uid}-subjects`}
            />
            <datalist id={`${uid}-subjects`}>
              {subjects.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor={`${uid}-due`}>Due date</label>
            <input id={`${uid}-due`} className="input" type="date" value={values.dueDate} onChange={setField('dueDate')} />
          </div>
          <div className="field">
            <label htmlFor={`${uid}-repeat`}>Repeat</label>
            <select id={`${uid}-repeat`} className="input" value={values.repeat} onChange={setField('repeat')}>
              {REPEATS.map((r) => (
                <option key={r} value={r}>
                  {r === 'none' ? 'Does not repeat' : r[0].toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <fieldset className="field field--wide">
            <legend>Priority</legend>
            <div className="chip-group">
              {PRIORITIES.map((p) => (
                <label key={p} className={`chip-radio chip-radio--${p}`}>
                  <input
                    type="radio"
                    name={`${uid}-priority`}
                    value={p}
                    checked={values.priority === p}
                    onChange={setField('priority')}
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field field--wide">
            <label htmlFor={`${uid}-subtask`}>Subtasks</label>
            {values.subtasks.length > 0 && (
              <ul className="subtask-editor">
                {values.subtasks.map((s) => (
                  <li key={s.id}>
                    <span>{s.title}</span>
                    <button type="button" className="icon-btn" onClick={() => removeSubtask(s.id)} aria-label={`Remove subtask "${s.title}"`}>
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="task-form__row">
              <input
                id={`${uid}-subtask`}
                className="input"
                type="text"
                placeholder="Add a step, then press Enter"
                maxLength={LIMITS.subtask}
                value={subtaskDraft}
                onChange={(e) => setSubtaskDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubtask()
                  }
                }}
                autoComplete="off"
              />
              <button type="button" className="btn btn--ghost" onClick={addSubtask} aria-label="Add subtask">
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="field field--wide">
            <label htmlFor={`${uid}-notes`}>Notes</label>
            <textarea
              id={`${uid}-notes`}
              className="input"
              rows={3}
              maxLength={LIMITS.notes}
              placeholder="Anything to remember?"
              value={values.notes}
              onChange={setField('notes')}
            />
          </div>
        </div>
      )}

      {isEdit && (
        <div className="task-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            <X size={18} aria-hidden="true" />
            <span>Cancel</span>
          </button>
          <button type="submit" className="btn btn--primary">
            <Check size={18} aria-hidden="true" />
            <span>Save</span>
          </button>
        </div>
      )}
    </form>
  )
}
