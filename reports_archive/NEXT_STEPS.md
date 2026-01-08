Next steps to publish the refactor branch
=======================================

You have a ready branch bundle and PR draft. The remote push failed due to access/SSH restrictions. Follow one of these options on a machine with proper GitHub access.

Option A — import the bundle into an existing clone and push

```bash
# Copy the bundle to your machine (or work from this repo root)
cp /path/to/refactor-contexts-split.bundle ./
# Fetch the branch from the bundle into your local clone
git fetch ./refactor-contexts-split.bundle refactor/contexts-split:refs/heads/refactor/contexts-split
git checkout refactor/contexts-split
# Verify changes
git status
git log --oneline -n 5
# Push to origin (HTTPS or SSH as configured)
git push -u origin refactor/contexts-split
```

Option B — import bundle into a fresh clone

```bash
git clone /path/to/refactor-contexts-split.bundle -b refactor/contexts-split tondino-refactor
cd tondino-refactor
# push to remote
git remote add origin git@github.com:<your-org>/<repo>.git
git push -u origin refactor/contexts-split
```

Option C — use the zip artifacts

Unzip `refactor-contexts-split.zip` and copy files into your working branch manually, then commit and push.

Create PR using GitHub CLI (recommended)

```bash
# after pushing the branch to origin
gh pr create --base main --head refactor/contexts-split --title "refactor(context): split TondinoContext" --body-file PR_BODY.md
```

If you don't have `gh`, open a PR on GitHub and paste the contents of `PR_BODY.md` into the description.

Local verification commands (already run here)

```bash
# from repo root
cd tondino-frontend
npm install
npm run type-check     # TypeScript check
npm run build          # production build
npm run preview -- --port 5173
# then open http://localhost:5173 in a browser and inspect
```

Profiling guidance (optional)

1. Run the app locally (`npm run dev` or `npm run preview`).
2. Open Chrome + React DevTools Profiler.
3. Record interactions that trigger major UI updates (e.g., selecting courses, opening modals).
4. Identify components with high render counts and memoize where appropriate (`React.memo`, `useMemo`, `useCallback`).

If you want, I can attempt to run an automated profiling session and capture a trace, but that requires a headful browser and will increase runtime complexity; tell me if you'd like me to do that.
