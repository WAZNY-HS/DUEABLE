import { Download } from 'lucide-react'
import brand from '../config/brand'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallButton() {
  const { canInstall, install } = useInstallPrompt()
  if (!canInstall) return null
  return (
    <button type="button" className="icon-btn" onClick={install} aria-label={`Install ${brand.name} as an app`}>
      <Download size={20} aria-hidden="true" />
    </button>
  )
}
