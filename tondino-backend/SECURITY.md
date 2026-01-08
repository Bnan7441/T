# Security & Secrets Checklist

This file documents minimal security steps and conventions for managing secrets in the Tondino backend.

1. Never commit secrets to the repository
   - Do not commit `.env` or any file containing real credentials.
   - Remove any accidental commits immediately and rotate affected secrets.

2. Use environment variables for all secrets
   - Required secrets: `DATABASE_URL`, `JWT_SECRET`, third-party API keys.
   - Use a secret manager for production (AWS Secrets Manager, Vault, etc.).

3. `.env.example` should contain placeholders only
   - Provide names and descriptions, not real values.

4. Boot-time checks
   - The server should warn and exit if critical secrets are missing in production.

5. Backup and cleanup
   - Remove local backup files that contain secrets (e.g. `*.env.bak*`).
   - Add `.env` and backup patterns to `.gitignore` (already present in `tondino-backend/.gitignore`).

6. Rotation and response
   - If a secret is leaked, rotate it immediately and invalidate sessions/tokens.
   - Document which secrets were rotated and when.

7. CI / Migrations
   - Do not hardcode secrets in migrations; use CI secrets for migration runs.
   - Gate migrations in CI with `RUN_MIGRATIONS` secret.

8. Minimal automated checks (suggested)
   - Add a CI check that scans for common secret patterns (JWT, AWS keys, emails/password patterns).
   - Fail the build if high-confidence secrets are found.

9. Developer guidance
   - Use `npm run dev` with a locally-provisioned `.env` not committed to git.
   - Use the `ensure_admin` scripts only with env vars set; avoid embedding credentials.

10. Next immediate actions performed in this change
    - Deleted two `.env.bak.*` files containing admin credentials.
    - Redacted an inline JWT secret in `docs/CLAUDE-backend.md`.

For questions or help integrating a secrets manager, open an issue or ask the maintainers.
