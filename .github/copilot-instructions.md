# Tondino AI Agent Instructions

## Project Context
- **Architecture**: Monorepo-style workspace with independent apps:
  - `tondino-backend/`: Express + TypeScript + Postgres (Direct SQL).
  - `tondino-frontend/`: Vite + React + TypeScript.
- **Authentication**: Zero-Trust Architecture. No tokens in `.env` or localStorage. Uses **httpOnly cookies** managed by `enhancedAPI.ts` and `cookie-parser`.
- **Database**: PostgreSQL with direct SQL queries (via `pg` pool). Single source of truth is `schema.sql` + `migrations/`. NO ORM.

## Critical Patterns & Conventions

### Backend (`tondino-backend`)
- **Logging & Observability**:
  - **Must** use `utils/logger.ts` for all logs. `console.log` is banned in production code.
  - **Must** pass `req.correlationId` to log functions to maintain trace context.
- **Error Handling**:
  - Throw subclasses of `StandardError` (e.g., `ValidationError`, `AuthenticationError`) from `utils/errorHandler.ts`.
  - Wrap async routes with `asyncHandler` to auto-catch errors.
- **Middleware Chain**: Order is strict: `correlation` -> `responseTime` -> `logging` -> `metrics` -> `cors` -> `routes` -> `errorHandler`.
- **Data Access**: Use `dbOperation` wrapper for DB calls to ensure connection release and logging.

### Frontend (`tondino-frontend`)
- **API Access**: 
  - **NEVER** use `fetch` directly. Use `enhancedAPI` services (`services/enhancedAPI.ts`), which handle `credentials: 'include'` for cookies and standardize errors.
- **State Management**:
  - **Split Contexts**: Use specific providers (`useAuth`, `useCourses`), NOT a monolithic global state.
  - **Actor Model**: Use `utils/actorSystem.ts` for complex, event-driven logic (e.g., Chat state machines) rather than complex `useEffect` chains.
- **Type Safety**:
  - Strict TypeScript. No `any`.
  - API responses often return numbers (IDs), but Forms use strings. Use explicit casting (`Number()`, `String()`) at the boundary (API calls).

### Database Schema
- **Authority**: `tondino-backend/schema.sql` is the definition.
- **Changes**: Create new SQL files in `migrations/`. Do not modify `schema.sql` manually for active deployments.

## Essential Workflows

### Verification
- **Frontend Strictness**: `npm run type-check` (in `tondino-frontend`) must pass. It catches strict type mismatches often missed by dev server.
- **Testing**:
  - Frontend: `npm run test` (Vitest). Config in `vitest.config.ts`.
  - Backend: `npm run test` (Jest). Fakes `uuid` imports locally if needed.

### Debugging
- **correlationId**: Trace a request from frontend (Network tab headers) to backend logs using this ID.
- **Health**: `/api/health/full` provides deep diagnostics (DB connectivity, memory).

## Do's and Don'ts
- **DO**: Use Persian text (`fa-IR`) for user-facing strings, English for code/comments.
- **DO NOT**: Store sensitive data in `localStorage`.
- **DO NOT**: Create tables at runtime in `server.ts`. Use migrations.
