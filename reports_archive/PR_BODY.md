PR: Split `TondinoContext` into focused contexts and migrate consumers
===================================================================

Summary
-------
This branch refactors the monolithic `TondinoContext` into focused contexts/hooks and migrates major consumers:

- **Split TondinoContext**: Removed the 300+ line monolithic context and replaced with 6 focused contexts.
- **Added focused contexts**: `UIContext`, `SelectionContext`, `NotificationsContext`, `ChatContext`, `StatsContext`.
- **Preserved single source of truth**: Kept `AuthContext` for auth/profile, `StatsContext` for user stats.
- **Migrated consumers**: Updated components to use focused hooks (`useUI`, `useSelection`, `useStats`, etc.).
- **Applied optimizations**: Route-level code-splitting, memoization, deferred third-party scripts.
- **Added testing**: Vitest framework with context boundary verification tests.
- **Added profiling**: Performance profiling script with production build metrics.
- **Fixed TypeScript issues**: Clean compilation and verified build + runtime.

Files changed (high-level)
-------------------------
**New contexts & components:**
- `src/context/UIContext.tsx`, `SelectionContext.tsx`, `NotificationsContext.tsx`, `ChatContext.tsx`, `StatsContext.tsx`
- `src/components/OptimizedImage.tsx` - Lazy-loading image wrapper
- `src/tests/contexts.test.tsx` - Context boundary unit tests

**Updated files:**
- `src/context/TondinoContext.tsx` - Composed providers, removed legacy wrapper
- `src/context/AuthContext.tsx` - Extended with on-demand Google Sign-In loader
- `src/App.tsx` - Route-level code-splitting with `React.lazy`
- `vite.config.ts` - Added `manualChunks` for vendor splitting
- Multiple components migrated to focused hooks

**Testing & tooling:**
- `tondino-frontend/vitest.config.ts`, `package.json` - Test framework setup
- `tondino-frontend/scripts/profile.mjs` - Performance profiling script
- `tondino-frontend/profile-output/` - Performance traces and metrics

**Documentation:**
- `tondino-frontend/docs/USE_TONDINO_MIGRATION.md` - Migration guide
- `tondino-frontend/CHANGELOG.md` - Change documentation

**Test Results**
✅ All tests passing (2/2):
- Cross-device sanity test  
- Context boundary verification test (UI changes don't re-render Stats consumers)

**Performance Metrics**
- Main bundle: 168 KB (40 KB gzipped) - reduced via code-splitting and memoization
- Route chunks: 3-12 KB each (lazy-loaded)
- Vendor chunks: React (61 KB), other vendors (54 KB gzipped)
- Runtime: DOM interactive ~2.5s, optimized script execution via memoization

How to import/apply this branch (if pushing to origin isn't possible from this machine)
----------------------------------------------------------------------------------
Option A — import the bundle into an existing clone:

```bash
# in your local clone of the remote repo
cp /path/to/refactor-contexts-split.bundle ./
git fetch ./refactor-contexts-split.bundle refactor/contexts-split:refs/heads/refactor/contexts-split
git checkout refactor/contexts-split
```

Option B — clone directly from the bundle into a new working directory:

```bash
git clone /path/to/refactor-contexts-split.bundle -b refactor/contexts-split tondino-refactor
cd tondino-refactor
```

Notes on pushing
----------------
- The local push failed due to SSH permission issues (`git@github.com` publickey). You can:
  - Configure SSH keys on this machine with GitHub, or
  - Push from another machine that has write access, or
  - Import the bundle into a machine/CI with credentials and push the branch and open a PR.

Suggested PR title
------------------
refactor(context): split TondinoContext into focused contexts and migrate consumers

Suggested PR body (short)
------------------------
This PR splits the monolithic `TondinoContext` into several smaller, focused React contexts and hooks to reduce re-render surface and give each responsibility a single owner. It migrates most consumers to the new hooks, removes the legacy `useTondino()` wrapper, and fixes related TypeScript issues. Includes a migration guide and changelog.

Checklist
---------
- [x] TypeScript check passes
- [x] Production build succeeds  
- [x] Preview smoke tests for key routes return 200
- [x] Context boundary tests added and passing
- [x] Performance profiling completed
- [x] Migration guide and documentation added
- [ ] Open PR and request review
