// Dueable | Developed by Shaffron Wazny
import { TaskProvider, useTaskActions } from './context/TaskContext'
import { ToastProvider } from './context/ToastContext'
import { useHotkeys } from './hooks/useHotkeys'
import Footer from './components/Footer'
import FilterTabs from './components/FilterTabs'
import Header from './components/Header'
import SearchBox from './components/SearchBox'
import StatsBar from './components/StatsBar'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'

function Board() {
  const { add } = useTaskActions()
  useHotkeys()

  return (
    <div className="app">
      <Header />
      <main className="main">
        <TaskForm onSubmit={add} />
        <StatsBar />
        <div className="toolbar">
          <SearchBox />
          <FilterTabs />
        </div>
        <TaskList />
        <p className="hint">
          Press <kbd>N</kbd> for a new task · <kbd>/</kbd> to search
        </p>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <TaskProvider>
        <Board />
      </TaskProvider>
    </ToastProvider>
  )
}
