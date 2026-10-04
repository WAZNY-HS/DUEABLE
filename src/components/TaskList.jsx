import { useTasks } from '../context/TaskContext'
import { todayISO } from '../utils/tasks'
import EmptyState from './EmptyState'
import TaskItem from './TaskItem'

export default function TaskList() {
  const { visibleTasks, filter, query, counts } = useTasks()

  if (visibleTasks.length === 0) {
    return <EmptyState filter={filter} hasTasks={counts.all > 0} query={query} />
  }

  const today = todayISO()
  return (
    <ul className="task-list" aria-label="Tasks">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} today={today} />
      ))}
    </ul>
  )
}
