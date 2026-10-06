import { useCallback, useEffect, useRef, useState } from 'react'
import { useTaskActions } from '../context/TaskContext'

const EDGE = 80
const SCROLL_STEP = 14
const OVER_CLASS = 'task--drop-target'

/**
 * Pointer-based drag (mouse and touch) from a handle. Nothing moves in the DOM until
 * drop, so pointer capture stays valid; the hovered row just shows a drop indicator.
 */
export function useDragReorder(taskId) {
  const { reorder } = useTaskActions()
  const [dragging, setDragging] = useState(false)
  const overRef = useRef(null)

  const clearOver = () => {
    overRef.current?.classList.remove(OVER_CLASS)
    overRef.current = null
  }

  const onPointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }, [])

  const onPointerMove = useCallback(
    (e) => {
      if (!dragging) return
      if (e.clientY < EDGE) window.scrollBy(0, -SCROLL_STEP)
      else if (e.clientY > window.innerHeight - EDGE) window.scrollBy(0, SCROLL_STEP)

      const row = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-task-id]')
      const next = row && row.dataset.taskId !== taskId ? row : null
      if (next === overRef.current) return
      clearOver()
      next?.classList.add(OVER_CLASS)
      overRef.current = next
    },
    [dragging, taskId],
  )

  const finish = useCallback(
    (e) => {
      if (!dragging) return
      const overId = overRef.current?.dataset.taskId
      clearOver()
      setDragging(false)
      if (e.type === 'pointerup' && overId) reorder(taskId, overId)
    },
    [dragging, reorder, taskId],
  )

  useEffect(() => clearOver, [])

  return { dragging, dragProps: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish } }
}
