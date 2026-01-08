Migration: Replacing `useTondino()` with focused hooks
=====================================================

Overview
--------
This project split the large legacy `useTondino()` hook into several smaller, focused hooks to reduce re-render scope and improve single-responsibility. Replace `useTondino()` usages with the focused hooks below.

Focused hooks
-------------
- `useAuth()` — auth state, `isAuthenticated`, `profile`, `login()`, `logout()`
- `useUI()` — UI state: `activePage`, `setActivePage`, `modal` state, `theme`, `toggleTheme()`
- `useSelection()` — selected course/article/lesson and `lastLesson` persistence
- `useNotifications()` — notifications list and `unreadCount`
- `useChat()` — chat history and helpers
- `useStats()` — `userStats`, `updateTopSpeed()`, `addPoints()`, `purchaseCourse()`

Common replacement patterns
---------------------------

Example 1 — basic UI + auth

Before:

import { useTondino } from '@/context/TondinoContext';
const { activePage, setActivePage, isAuthenticated, profile } = useTondino();

After:

import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
const { activePage, setActivePage } = useUI();
const { isAuthenticated, profile } = useAuth();

Example 2 — toggling theme

Before:

const { theme, toggleTheme } = useTondino();

After:

const { theme, toggleTheme } = useUI();

Example 3 — updating user stats

Before:

const { userStats, updateTopSpeed } = useTondino();

After:

const { userStats, updateTopSpeed } = useStats();

Quick grep to validate no remaining code usages
------------------------------------------------

Run from repo root:

```bash
rg "useTondino" -n || true
```

Notes
-----
- The legacy `useTondino()` wrapper was removed from `src/context/TondinoContext.tsx`. Consumer code should now import focused hooks directly.
- If you hit missing-provider errors, ensure `AuthProvider` is placed above `TondinoProvider` in `src/main`/`App.tsx`.

Next steps
----------
1. Run a full type-check and production build. 2. Preview the app and test key routes. 3. Run tests and prepare a PR.
