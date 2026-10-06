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
- **Subtasks** with a checklist and progress count (e.g. 1/2)
- **Recurring tasks** (daily / weekly / monthly): completing one creates the next
- **Subject colors**: each subject gets its own stable color; existing subjects are suggested as you type
- **Manual ordering**: turn on "Manual order", then drag the handle (mouse or touch) or use the up/down arrow keys
- **Calendar view**: month grid with task counts per day, tap a day to see its tasks
- **Due-date reminders**: opt in via the bell; one summary notification per day for tasks due today or overdue
- **Installable PWA** that works offline (manifest, icons and service worker; install button appears when the browser allows it)
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
├─ vite.config.js             # React, brand-html + PWA manifest/icons from brand.js, Vitest
├─ public/sw.js              # offline service worker
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
   ├─ hooks/                  # useLocalStorage, useTheme, useHotkeys, useDeleteTask,
   │                          # useDragReorder, useReminders, useInstallPrompt
   ├─ utils/tasks.js          # model helpers, validation, filter/sort, dates
   ├─ components/             # Header, Logo, TaskForm, TaskList, TaskItem, FilterTabs,
   │                          # EmptyState, StatsBar, SearchBox, Toast, ConfirmDialog,
   │                          # ThemeToggle, Footer, CalendarView, ViewControls,
   │                          # ReminderToggle, InstallButton
   ├─ styles/                 # layout.css, ui.css, tasks.css, features.css
   └─ test/setup.js, *.test.js(x)
```

## Architecture notes

- **State:** `useReducer` + two contexts (state, and a memoized actions object) so list items don't re-render when unrelated state changes. Actions: `ADD`, `UPDATE`, `DELETE`, `TOGGLE`, `SET_FILTER`, `CLEAR_COMPLETED`, plus `RESTORE` (undo), `SET_QUERY` (search), `TOGGLE_SUBTASK`, `REORDER`, `SET_VIEW` and `SET_SORT`. Completing a repeating task spawns the next one inside the reducer.
- **Persistence:** `useLocalStorage` (safe JSON parsing, try/catch, sanitizing) under the versioned key `dueable:tasks:v1`. `TaskProvider` is the only consumer, so swapping in an API means changing that one file.
- **Re-branding:** edit `src/config/brand.js` (name, tagline, colors, logo path, author). The page title, meta tags, favicon, and CSS palette all follow.

## Future enhancements

- Authentication and per-user accounts (planned: Firebase Auth)
- Cloud sync (planned: Firestore, replacing the persistence layer in `TaskProvider`)
- True push notifications that arrive when the app is closed (needs a backend, e.g. Firebase Cloud Messaging)
- PNG app icons for iOS home-screen installs (icons are currently SVG, generated from `brand.js`)
- Week view, drag tasks between calendar days

---

Developed by Shaffron Wazny
