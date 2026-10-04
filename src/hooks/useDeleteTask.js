import { useCallback } from 'react'
import { useTaskActions } from '../context/TaskContext'
import { useToast } from '../context/ToastContext'
import { truncate } from '../utils/tasks'

/** Deletes immediately and offers a 5s undo instead of a blocking confirm. */
export function useDeleteTask() {
  const { remove, restore } = useTaskActions()
  const { showToast } = useToast()

  return useCallback(
    (task) => {
      remove(task.id)
      showToast({
        message: `Deleted "${truncate(task.title, 40)}"`,
        actionLabel: 'Undo',
        onAction: () => restore([task]),
      })
    },
    [remove, restore, showToast],
  )
}
