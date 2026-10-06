import brand from '../config/brand'
import InstallButton from './InstallButton'
import Logo from './Logo'
import ReminderToggle from './ReminderToggle'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <Logo size={44} />
        <div>
          <h1 className="brand__name">{brand.name}</h1>
          <p className="brand__tagline">{brand.tagline}</p>
        </div>
      </div>
      <div className="header__actions">
        <InstallButton />
        <ReminderToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
