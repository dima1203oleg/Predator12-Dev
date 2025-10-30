#!/usr/bin/env bash
# Lightweight skeleton script to run an agent in dry-run mode, apply suggested patch in a sandbox,
# run tests, and print a report. It is intentionally conservative and does not push or merge.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKDIR="$ROOT_DIR/.auto_propose_workdir"
REPORT="$ROOT_DIR/.auto_propose_report.txt"
PATCH_DEST="$ROOT_DIR/suggested.patch"
GENERATOR_CMD="${AUTO_PROPOSE_GENERATOR:-python scripts/generate_patch_local.py}"
if [ "${AUTO_PROPOSE_TEST_CMD+x}" = "x" ]; then
  TEST_CMD="$AUTO_PROPOSE_TEST_CMD"
else
  TEST_CMD="pytest -q"
fi

echo "Starting auto-propose dry-run..." > "$REPORT"
echo "workspace: $ROOT_DIR" >> "$REPORT"
echo "generator: $GENERATOR_CMD" >> "$REPORT"

# Prepare sandbox
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
git archive --format=tar HEAD | tar -x -C "$WORKDIR"

echo "Sandbox prepared at $WORKDIR" >> "$REPORT"

(cd "$WORKDIR" && ROOT_REPO="$ROOT_DIR" bash -lc "$GENERATOR_CMD") >> "$REPORT" 2>&1 || {
  echo "Generator command failed" >> "$REPORT"
  cat "$REPORT"
  exit 1
}

if [ -f "$WORKDIR/suggested.patch" ]; then
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

# Run backend tests (isolated)
if [ -d "$WORKDIR/backend" ] && [ -n "$TEST_CMD" ]; then
  echo "Running backend tests in sandbox..." >> "$REPORT"
  set +e
  (cd "$WORKDIR" && bash -lc "$TEST_CMD") >> "$REPORT" 2>&1
  TEST_STATUS=$?
  set -e
  if [ "$TEST_STATUS" -ne 0 ]; then
    echo "Tests failed (exit code $TEST_STATUS)" >> "$REPORT"
  fi
fi

echo "Dry-run complete. Report saved to $REPORT" >> "$REPORT"
(cd "$WORKDIR" && cp suggested.patch "$PATCH_DEST")
cat "$REPORT"
