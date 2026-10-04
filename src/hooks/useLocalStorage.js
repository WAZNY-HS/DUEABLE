import { useEffect, useState } from 'react'

function readStorage(key, fallback, sanitize) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    const value = sanitize ? sanitize(parsed) : parsed
    return value ?? fallback
  } catch {
    return fallback
  }
}

/**
 * useState that persists to localStorage. Corrupted JSON, blocked storage and
 * failed writes (quota, private mode) all degrade to plain in-memory state.
 * `sanitize` validates untrusted stored data and returns null/undefined to reject it.
 */
export function useLocalStorage(key, initialValue, { sanitize } = {}) {
  const [value, setValue] = useState(() => readStorage(key, initialValue, sanitize))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage unavailable: keep working in memory.
    }
  }, [key, value])

  return [value, setValue]
}
