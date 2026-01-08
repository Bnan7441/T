## Unreleased

- Split monolithic `TondinoContext` into focused contexts and hooks: `useAuth`, `useUI`, `useSelection`, `useNotifications`, `useChat`, `useStats`.
- Removed legacy `useTondino()` wrapper and updated provider composition (`TondinoProvider` now composes focused providers).
- Migrated major consumers to focused hooks and added `tondino-frontend/docs/USE_TONDINO_MIGRATION.md` with replacement examples.
- Fixed TypeScript errors introduced during refactor and added `test` script to run a type-check.
- Verified production build and preview smoke tests for key routes (`/`, `/courses`, `/dashboard`, `/course-detail/1`, `/blog`).

### Notes

- Remaining tasks: profile re-renders and targeted optimizations, finalize PR and changelog, add unit/e2e tests where desired.
