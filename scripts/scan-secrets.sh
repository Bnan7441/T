#!/usr/bin/env bash
set -euo pipefail

echo "Running simple secret scan..."

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$ROOT_DIR"

EXCLUDE_DIRS=(node_modules dist .git scripts)
EXCLUDE_ARGS=()
for d in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_ARGS+=(--exclude-dir="$d")
done

# Files / patterns to exclude from scanning (help reduce false positives in docs/examples)
EXCLUDE_FILES=("*.md" "docs/*" ".github/*" "**/.env.example" "*.env.bak*" "*.env" "jest.setup.js" "vitest.setup.ts")
EXCLUDE_FILE_ARGS=()
for f in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_FILE_ARGS+=(--exclude="$f")
done

declare -a PATTERNS
PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  'aws_secret_access_key'
  '-----BEGIN (RSA |)PRIVATE KEY-----'
  '\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b'
  'JWT_SECRET\s*=\s*[^\s#]+'
  'ADMIN_PASSWORD=.*[^ ]+'
  'PASSWORD=.*[^ ]+'
)

FOUND=0
for p in "${PATTERNS[@]}"; do
  # shellcheck disable=SC2086
  matches=$(grep -RInE ${EXCLUDE_ARGS[*]} ${EXCLUDE_FILE_ARGS[*]} -e "$p" . || true)
  if [ -n "$matches" ]; then
    echo "=== Matches for pattern: $p ==="
    echo "$matches"
    echo
    FOUND=1
  fi
done

if [ "$FOUND" -ne 0 ]; then
  echo "Secret scan failed: potential secrets found. Inspect and remove/rotate before merging."
  exit 1
fi

echo "Secret scan passed (no high-confidence patterns found)."
