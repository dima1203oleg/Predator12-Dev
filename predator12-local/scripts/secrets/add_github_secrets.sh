#!/usr/bin/env bash
# Convenience wrapper for add_github_secrets.py
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$(which python3 || which python)"

if [ -z "$PY" ]; then
  echo "Python not found on PATH. Install Python 3." >&2
  exit 2
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install and run 'gh auth login' first." >&2
  exit 2
fi

# Default secrets file (local, not checked in)
SECRETS_FILE=".secrets.env"

if [ -f "$SECRETS_FILE" ]; then
  echo "Using secrets file: $SECRETS_FILE"
  exec "$PY" "$SCRIPT_DIR/add_github_secrets.py" --secrets-file "$SECRETS_FILE" "$@"
else
  echo "No $SECRETS_FILE found. Running interactive prompt (you can create $SECRETS_FILE to run non-interactively)."
  exec "$PY" "$SCRIPT_DIR/add_github_secrets.py" "$@"
fi
