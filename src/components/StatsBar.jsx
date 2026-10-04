import { useCallback, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTaskActions, useTasks } from '../context/TaskContext'
import ConfirmDialog from './ConfirmDialog'

export default function StatsBar() {
  const { counts } = useTasks()
  const { clearCompleted } = useTaskActions()
  const [confirming, setConfirming] = useState(false)
  const closeConfirm = useCallback(() => setConfirming(false), [])
  const percent = counts.all === 0 ? 0 : Math.round((counts.completed / counts.all) * 100)

  return (
    <section className="stats card" aria-label="Progress">
      <div className="stats__top">
        <p className="stats__label">
          <strong>{counts.completed}</strong> of <strong>{counts.all}</strong> done
        </p>
        <button
          type="button"
          className="link-btn link-btn--danger"
          disabled={counts.completed === 0}
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={15} aria-hidden="true" />
          Clear completed
        </button>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Tasks completed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="progress__fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </div>

      <ConfirmDialog
        open={confirming}
        title="Clear completed tasks?"
        message={`This permanently removes ${counts.completed} completed ${counts.completed === 1 ? 'task' : 'tasks'}.`}
        confirmLabel="Clear completed"
        onConfirm={() => {
          clearCompleted()
          closeConfirm()
        }}
        onCancel={closeConfirm}
      />
    </section>
  )
}
