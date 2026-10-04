import { useEffect } from 'react'

export const NEW_TASK_INPUT_ID = 'new-task-title'
export const SEARCH_INPUT_ID = 'task-search'

const isTypingTarget = (el) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/** N focuses the new-task field, / focuses search. Ignored while typing or with modifiers. */
export function useHotkeys() {
  useEffect(() => {
    const targets = { n: NEW_TASK_INPUT_ID, '/': SEARCH_INPUT_ID }
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return
      const id = targets[e.key.toLowerCase()]
      const el = id && document.getElementById(id)
      if (!el) return
      e.preventDefault()
      el.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
