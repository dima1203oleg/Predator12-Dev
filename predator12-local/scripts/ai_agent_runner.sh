#!/usr/bin/env bash
set -euo pipefail

# Wrapper to run the AI dev loop with sane defaults
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${SCRIPT_DIR}/.."

cd "$ROOT"

PYTHON=${PYTHON:-python3}

# Defaults: dry-run off, 5 iterations
${PYTHON} scripts/ai_dev_loop.py --task "Automated iteration from ai_agent_runner" --iterations 5

echo "AI runner finished (dry-run). To run for real, re-run without --dry-run and with gh auth set up."
