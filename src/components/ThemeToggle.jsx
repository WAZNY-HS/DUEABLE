import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${next} theme`}>
      {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  )
}
