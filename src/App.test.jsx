import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

async function addTask(user, title) {
  await user.type(screen.getByLabelText('New task title'), `${title}{Enter}`)
}

describe('Dueable core flows', () => {
  it('adds a task and rejects whitespace-only titles', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, '   ')
    expect(screen.getByRole('alert')).toHaveTextContent('Give your task a name.')

    await user.clear(screen.getByLabelText('New task title'))
    await addTask(user, 'Read chapter 4')
    expect(screen.getByText('Read chapter 4')).toBeInTheDocument()
    expect(screen.getByLabelText('New task title')).toHaveValue('')
  })

  it('edits a task with Save and discards changes with Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Draft essay')

    await user.click(screen.getByRole('button', { name: 'Edit "Draft essay"' }))
    const input = screen.getByLabelText('Edit task title')
    await user.clear(input)
    await user.type(input, 'Draft essay outline')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Draft essay outline')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit "Draft essay outline"' }))
    await user.type(screen.getByLabelText('Edit task title'), ' typo{Escape}')
    expect(screen.getByText('Draft essay outline')).toBeInTheDocument()
    expect(screen.queryByLabelText('Edit task title')).not.toBeInTheDocument()
  })

  it('deletes a task and restores it with Undo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Lab report')

    await user.click(screen.getByRole('button', { name: 'Delete "Lab report"' }))
    expect(screen.queryByText('Lab report')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Deleted "Lab report"')

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByText('Lab report')).toBeInTheDocument()
  })

  it('toggles a task between completed and pending', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Flashcards')

    const checkbox = screen.getByRole('checkbox', { name: /Flashcards/ })
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(screen.getByText(/of/, { selector: '.stats__label' })).toHaveTextContent('1 of 1 done')

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText(/of/, { selector: '.stats__label' })).toHaveTextContent('0 of 1 done')
  })

  it('filters by All / Pending / Completed with live counts', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Math homework')
    await addTask(user, 'History quiz')
    await user.click(screen.getByRole('checkbox', { name: /Math homework/ }))

    const tabs = screen.getByRole('group', { name: 'Filter tasks' })
    expect(within(tabs).getByRole('button', { name: /All/ })).toHaveTextContent('2')
    expect(within(tabs).getByRole('button', { name: /Pending/ })).toHaveTextContent('1')
    expect(within(tabs).getByRole('button', { name: /Completed/ })).toHaveTextContent('1')

    await user.click(within(tabs).getByRole('button', { name: /Pending/ }))
    expect(screen.getByText('History quiz')).toBeInTheDocument()
    expect(screen.queryByText('Math homework')).not.toBeInTheDocument()

    await user.click(within(tabs).getByRole('button', { name: /Completed/ }))
    expect(screen.getByText('Math homework')).toBeInTheDocument()
    expect(screen.queryByText('History quiz')).not.toBeInTheDocument()
  })

  it('adds subtasks, ticks them off, and shows the task on the calendar', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('New task title'), 'Group project')
    await user.click(screen.getByRole('button', { name: /More options/ }))
    await user.type(screen.getByLabelText('Subtasks'), 'Slides{Enter}')
    await user.type(screen.getByLabelText('Due date'), '2026-10-12')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    await user.click(screen.getByRole('checkbox', { name: 'Slides' }))
    expect(screen.getByRole('checkbox', { name: 'Slides' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Calendar' }))
    expect(screen.getByRole('region', { name: 'Calendar' })).toBeInTheDocument()
  })
})
