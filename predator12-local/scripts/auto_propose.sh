#!/usr/bin/env bash
# Lightweight skeleton script to run an agent in dry-run mode, apply suggested patch in a sandbox,
# run tests, and print a report. It is intentionally conservative and does not push or merge.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKDIR="/tmp/auto_propose_workdir_$USER"
REPORT="$ROOT_DIR/.auto_propose_report.txt"
PATCH_DEST="$ROOT_DIR/suggested.patch"
GENERATOR_CMD="${AUTO_PROPOSE_GENERATOR:-python scripts/generate_patch_local.py}"
if [ "${AUTO_PROPOSE_TEST_CMD+x}" = "x" ]; then
  TEST_CMD="$AUTO_PROPOSE_TEST_CMD"
else
  TEST_CMD="pytest -q"
fi

# Clean up and create sandbox
if [ -d "$WORKDIR" ]; then
  rm -rf "$WORKDIR"
fi
mkdir -p "$WORKDIR"

echo "Starting auto-propose dry-run..." > "$REPORT"
echo "workspace: $ROOT_DIR" >> "$REPORT"
echo "generator: $GENERATOR_CMD" >> "$REPORT"


# Копіюємо весь репозиторій у sandbox (крім node_modules, .venv, .git, .auto_propose_workdir)
rsync -a --exclude 'node_modules' --exclude '.venv' --exclude '.git' --exclude '.auto_propose_workdir' "$ROOT_DIR/" "$WORKDIR/"

# Ініціалізуємо git репозиторій у sandbox
(cd "$WORKDIR" && git init && git add . && git commit -m "Initial sandbox commit" --allow-empty) >> "$REPORT" 2>&1 || {
  echo "Failed to initialize git repo in sandbox" >> "$REPORT"
  cat "$REPORT"
  exit 1
}

# Переконуємось, що dist скопійовано (на випадок, якщо rsync не скопіював через .gitignore)
if [ -d "$ROOT_DIR/frontend/dist" ]; then
  mkdir -p "$WORKDIR/frontend"
  cp -R "$ROOT_DIR/frontend/dist" "$WORKDIR/frontend/dist"
  echo "Copied frontend/dist -> sandbox/frontend/dist" >> "$REPORT"
else
  echo "No frontend/dist found, run npm run build first!" >> "$REPORT"
  cat "$REPORT"
  exit 1
fi

echo "Sandbox prepared at $WORKDIR" >> "$REPORT"

# Генеруємо патч у корені репозиторію
ROOT_REPO="$ROOT_DIR" bash -lc "$GENERATOR_CMD" >> "$REPORT" 2>&1 || {
  echo "Generator command failed" >> "$REPORT"
  cat "$REPORT"
  exit 1
}

# Копіюємо патч у sandbox і застосовуємо
if [ -f "$PATCH_DEST" ]; then
  cp "$PATCH_DEST" "$WORKDIR/suggested.patch"
  echo "Applying suggested.patch" >> "$REPORT"
  (cd "$WORKDIR" && git apply suggested.patch) >> "$REPORT" 2>&1 || {
    echo "Patch application failed" >> "$REPORT"
    exit 1
  }
else
  echo "No suggested.patch found — exiting with no changes." >> "$REPORT"
  rm -f "$PATCH_DEST"
  cat "$REPORT"
  exit 0
fi

# Clean up __pycache__ and .pyc files in sandbox before running tests
find "$WORKDIR" -name "__pycache__" -type d -exec rm -rf {} +
find "$WORKDIR" -name "*.pyc" -type f -delete

# Run backend tests (isolated)
if [ -d "$WORKDIR/backend" ] && [ -n "$TEST_CMD" ]; then
  echo "Running backend tests in sandbox (gtimeout 60s)..." >> "$REPORT"
  set +e
  (cd "$WORKDIR" && gtimeout 60s bash -lc "$TEST_CMD") >> "$REPORT" 2>&1
  TEST_STATUS=$?
  set -e
  if [ "$TEST_STATUS" -ne 0 ]; then
    echo "Tests failed (exit code $TEST_STATUS)" >> "$REPORT"
  fi
fi

echo "Dry-run complete. Report saved to $REPORT" >> "$REPORT"
if [ -f "$WORKDIR/suggested.patch" ]; then
  cp "$WORKDIR/suggested.patch" "$PATCH_DEST"
fi
cat "$REPORT"
