import { dueSummary, nextDueDate, sanitizeTasks, subjectHue } from './tasks'

describe('task utils', () => {
  it('advances repeat dates, clamping month ends', () => {
    expect(nextDueDate('2026-12-31', 'daily')).toBe('2027-01-01')
    expect(nextDueDate('2026-10-05', 'weekly')).toBe('2026-10-12')
    expect(nextDueDate('2026-01-31', 'monthly')).toBe('2026-02-28')
    expect(nextDueDate('2026-12-15', 'monthly')).toBe('2027-01-15')
  })

  it('gives each subject a stable hue regardless of case', () => {
    expect(subjectHue('Biology')).toBe(subjectHue('biology'))
    expect(subjectHue('Biology')).not.toBe(subjectHue('History'))
  })

  it('summarises due-today and overdue pending tasks only', () => {
    const task = (dueDate, completed = false) => ({ dueDate, completed })
    const tasks = [task('2026-10-05'), task('2026-10-01'), task('2026-10-01', true), task('2026-10-09')]
    expect(dueSummary(tasks, '2026-10-05')).toBe('1 due today · 1 overdue')
    expect(dueSummary([task('2026-10-09')], '2026-10-05')).toBeNull()
  })

  it('upgrades tasks saved before subtasks/repeat existed and drops corrupt entries', () => {
    const [task, ...rest] = sanitizeTasks([
      { id: '1', title: 'Old task', completed: false, createdAt: 1 },
      { id: 2, title: 'bad id' },
      null,
    ])
    expect(rest).toHaveLength(0)
    expect(task).toMatchObject({ repeat: 'none', subtasks: [], priority: 'medium' })
  })
})
