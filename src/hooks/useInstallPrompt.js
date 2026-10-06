import { useCallback, useEffect, useState } from 'react'

/** Captures the browser's install prompt so we can offer an "Install app" button. */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    const onInstalled = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }, [promptEvent])

  return { canInstall: promptEvent !== null, install }
}
