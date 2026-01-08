#!/usr/bin/env bash
set -euo pipefail

# Securely rotate the admin password for the local admin user created by the migration.
# Usage:
#   export DATABASE_URL="postgres://user:pass@host:5432/dbname"
#   ./scripts/secure_admin.sh

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set. Example: export DATABASE_URL=postgres://user:pass@localhost:5432/tondino"
  exit 1
fi

# Generate a reasonably complex password (20 chars)
if command -v openssl >/dev/null 2>&1; then
  NEW_PASS=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9!@#$%&*' | cut -c1-20)
else
  NEW_PASS=$(date +%s%N | sha256sum | base64 | tr -dc 'A-Za-z0-9' | cut -c1-20)
fi

echo "Rotating admin password for admin@local.tondino..."

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
-- Ensure pgcrypto is available for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
UPDATE users
SET password_hash = crypt('${NEW_PASS}', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@local.tondino';
-- Show result
SELECT id, email, is_admin, created_at, updated_at FROM users WHERE email = 'admin@local.tondino';
SQL

echo
echo "New admin password (store securely):"
echo "${NEW_PASS}"
echo
echo "Recommendation: store this in a password manager and then delete this script or keep it outside the repo."
