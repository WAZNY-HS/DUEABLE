import { useCallback, useEffect, useState } from 'react'
import brand from '../config/brand'
import { useLocalStorage } from './useLocalStorage'

export const THEME_KEY = `${brand.storageNamespace}:theme:v1`
const QUERY = '(prefers-color-scheme: dark)'

const sanitizeTheme = (v) => (v === 'light' || v === 'dark' ? v : null)
const systemPrefersDark = () => typeof window.matchMedia === 'function' && window.matchMedia(QUERY).matches

export function useTheme() {
  const [saved, setSaved] = useLocalStorage(THEME_KEY, null, { sanitize: sanitizeTheme })
  const [systemDark, setSystemDark] = useState(systemPrefersDark)
  const theme = saved ?? (systemDark ? 'dark' : 'light')

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setSystemDark(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? brand.colors.bgDark : brand.colors.bgLight)
  }, [theme])

  const toggleTheme = useCallback(() => setSaved(theme === 'dark' ? 'light' : 'dark'), [theme, setSaved])

  return { theme, toggleTheme }
}
