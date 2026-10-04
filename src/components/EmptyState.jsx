import { CheckCheck, Inbox, PartyPopper, SearchX } from 'lucide-react'

const COPY = {
  none: { Icon: Inbox, title: 'A clean slate', text: 'Add your first task above. Future you says thanks.' },
  pending: { Icon: PartyPopper, title: 'Nothing pending', text: "You're all caught up. Go touch some grass." },
  completed: { Icon: CheckCheck, title: 'No wins yet', text: 'Finish a task and it will show up here.' },
}

export default function EmptyState({ filter, hasTasks, query }) {
  const key = query.trim() ? 'search' : hasTasks ? filter : 'none'
  const { Icon, title, text } =
    key === 'search'
      ? { Icon: SearchX, title: 'No matches', text: `Nothing matches "${query.trim()}". Try another word.` }
      : (COPY[key] ?? COPY.none)

  return (
    <div className="empty">
      <span className="empty__icon">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h2 className="empty__title">{title}</h2>
      <p className="empty__text">{text}</p>
    </div>
  )
}
