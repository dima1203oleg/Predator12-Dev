#!/usr/bin/env bash
# Lightweight skeleton script to run an agent in dry-run mode, apply suggested patch in a sandbox,
# run tests, and print a report. It is intentionally conservative and does not push or merge.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKDIR="$ROOT_DIR/.auto_propose_workdir"
REPORT="$ROOT_DIR/.auto_propose_report.txt"

echo "Starting auto-propose dry-run..." > "$REPORT"
echo "workspace: $ROOT_DIR" >> "$REPORT"

# Prepare sandbox
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
git archive --format=tar HEAD | tar -x -C "$WORKDIR"

echo "Sandbox prepared at $WORKDIR" >> "$REPORT"

# Placeholder: call local agent or external tool to generate patch
echo "[INFO] Generating suggestions (placeholder)..." >> "$REPORT"
# Example: run a local script or CLI for the agent here and write patch to $WORKDIR/suggested.patch

if [ -f "$WORKDIR/suggested.patch" ]; then
  echo "Applying suggested.patch" >> "$REPORT"
  (cd "$WORKDIR" && git apply suggested.patch) >> "$REPORT" 2>&1 || {
    echo "Patch application failed" >> "$REPORT"
    exit 1
  }
else
  echo "No suggested.patch found — exiting with no changes." >> "$REPORT"
  cat "$REPORT"
  exit 0
fi

# Run backend tests (isolated)
if [ -d "$WORKDIR/backend" ]; then
  echo "Running backend tests in sandbox..." >> "$REPORT"
  (cd "$WORKDIR" && pytest -q || echo "Tests failed" >> "$REPORT")
fi

echo "Dry-run complete. Report saved to $REPORT" >> "$REPORT"
cat "$REPORT"
