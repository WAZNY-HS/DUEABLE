# Dueable

**Every deadline, doable.** A fast, mobile-first task manager for students, built with React 18 and Vite.

## Features

- Add, edit, delete, and complete/uncomplete tasks
- Filter by All / Pending / Completed, with live counts
- Delete with a 5-second **Undo** toast (no blocking confirm)
- Inline editing (Save / Cancel / `Esc`)
- Optional subject, priority, due date, and notes
- Overdue and due-today badges, priority chips
- Progress bar ("5 of 12 done"), search, "Clear completed"
- Light/dark theme (follows system, remembers your choice)
- Keyboard shortcuts: `N` new task, `/` search
- Accessible: semantic HTML, labels, visible focus, `aria-live` toasts, WCAG AA colors, reduced-motion support
- Resilient: corrupted `localStorage` is ignored, long titles wrap, 500+ tasks stay smooth

## Setup

```bash
npm install && npm run dev
```

```bash
npm run build     # production build in dist/
npm run preview   # serve the production build
npm test          # Vitest + React Testing Library
```

## Folder structure

```
dueable/
├─ index.html                 # brand tokens injected from brand.js at build time
├─ vite.config.js             # React plugin, brand-html plugin, Vitest config
└─ src/
   ├─ main.jsx, App.jsx
   ├─ index.css               # design tokens (light + dark), base styles
   ├─ config/
   │  ├─ brand.js             # name, tagline, colors, author (single re-brand file)
   │  └─ applyBrand.js        # applies brand.js colors as CSS variables
   ├─ context/
   │  ├─ taskReducer.js       # pure reducer
   │  ├─ TaskContext.jsx      # state + stable actions, persistence seam
   │  └─ ToastContext.jsx
   ├─ hooks/                  # useLocalStorage, useTheme, useHotkeys, useDeleteTask
   ├─ utils/tasks.js          # model helpers, validation, filter/sort, dates
   ├─ components/             # Header, Logo, TaskForm, TaskList, TaskItem, FilterTabs,
   │                          # EmptyState, StatsBar, SearchBox, Toast, ConfirmDialog,
   │                          # ThemeToggle, Footer
   ├─ styles/                 # layout.css, ui.css, tasks.css
   └─ test/setup.js, App.test.jsx
```

## Architecture notes

- **State:** `useReducer` + two contexts (state, and a memoized actions object) so list items don't re-render when unrelated state changes. Actions: `ADD`, `UPDATE`, `DELETE`, `TOGGLE`, `SET_FILTER`, `CLEAR_COMPLETED`, plus `RESTORE` (undo) and `SET_QUERY` (search).
- **Persistence:** `useLocalStorage` (safe JSON parsing, try/catch, sanitizing) under the versioned key `dueable:tasks:v1`. `TaskProvider` is the only consumer, so swapping in an API means changing that one file.
- **Re-branding:** edit `src/config/brand.js` (name, tagline, colors, logo path, author). The page title, meta tags, favicon, and CSS palette all follow.

## Future enhancements

- Authentication and per-user accounts
- Cloud sync (replace the persistence layer in `TaskProvider`) with offline support
- Due-date reminders and push notifications
- Recurring tasks, subtasks, and subject color-coding
- Drag-and-drop ordering, calendar view, PWA install

---

Developed by Shaffron Wazny
