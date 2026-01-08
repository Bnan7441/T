#!/usr/bin/env bash
set -euo pipefail

# Scans migration files for obvious plaintext secrets or risky patterns.
# Exits with non-zero status if matches are found.

MIGRATIONS_DIR="tondino-backend/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR — skipping check."
  exit 0
fi

echo "Scanning $MIGRATIONS_DIR for suspicious plaintext secrets..."

# Patterns we consider suspicious: literal crypt(...) uses, explicit PASSWORD '...', and assignments with single-quoted literals
MATCHES=$(grep -nE "crypt\(|PASSWORD\s+'|password\s*[:=]\s*'|password_hash\s*=\s*'" "$MIGRATIONS_DIR"/* || true)

if [ -n "$MATCHES" ]; then
  echo "Potential plaintext secrets or risky patterns found in migration files:"
  echo "$MATCHES"
  echo
  echo "If these are false positives (e.g. using pgcrypto functions with parameters), inspect and adjust the migration. Otherwise, remove secrets from migration files and use env-driven or out-of-repo secret provisioning." 
  exit 1
fi

echo "No obvious plaintext secrets found in migrations."
exit 0
