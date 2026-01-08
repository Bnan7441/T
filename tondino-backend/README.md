# Tondino Backend — Local Development

Secret-scan workflow status: ![Secret Scan](https://github.com/<OWNER>/<REPO>/actions/workflows/secret-scan.yml/badge.svg)

Quick notes for running and migrating the backend locally.

Prerequisites
- Node.js >= 18
- A Postgres database and a `DATABASE_URL` connection string

Install

```bash
cd tondino-backend
npm install
```

Environment variables
- `DATABASE_URL` — Postgres connection string (required for migrations)
- `JWT_SECRET` — JWT signing secret
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — optional bootstrap admin credentials
- `FRONTEND_URL` — allowed CORS origins (comma-separated)

Local env file
- Use `tondino-backend/.env.example` as a template for local development. Do not commit real secrets — `.env` is gitignored.

CI safety
- To prevent accidental migrations in CI, the workflow requires the repository secret `RUN_MIGRATIONS` set to `true` to actually apply migrations.

Run migrations

Run migrations

```bash
# Run all up migrations
npm run migrate:up

# Rollback (down)
npm run migrate:down

Note: A reversible down migration `migrations/001_initial.down.sql` is included to allow rollback of the initial schema.

# Create a new migration (node-pg-migrate)
npm run migrate:create -- <migration_name>
```

Bootstrap (migrate + seed)

```bash
# Runs all migrations, then seeds `user_stats` for existing users
npm run migrate:bootstrap
```

CI recommendation

Add the repository secret `RUN_MIGRATIONS=true` and `DATABASE_URL` in CI only when you want merges to run migrations automatically. See `.github/workflows/migrations.yml` for an example gated workflow.

Start the app

```bash
npm run dev
```

Notes
- The canonical schema is in `migrations/001_initial.sql` (created from `schema.sql`).
- Ensure `DATABASE_URL` is set before running migrations. In production, use a proper migration strategy and backups.

Security note:
- A temporary migration that inserted a generated admin user was applied locally during setup and has been removed from the repository to avoid storing plaintext credentials.
- To rotate the admin password or apply a secure password change, run the helper script `./scripts/secure_admin.sh` (ensure `DATABASE_URL` is set). The script will print a generated password — store it safely in a password manager.

