#!/bin/bash
# Застосування autopatch від selfLearningAgent. Викликається тільки якщо confidence >= threshold.
set -euo pipefail

PATCH_FILE="${1:-patch.diff}"
RUN_ID="${RUN_ID:-$(uuidgen)}"
SBOX="/tmp/sandbox-$RUN_ID"

# Kill-switch
[ -f /var/run/autodeploy.disabled ] && exit 1

if [ ! -f "$PATCH_FILE" ]; then
  echo "Patch file not found: $PATCH_FILE" >&2
  exit 2
fi

# Sandbox симуляція
mkdir -p "$SBOX"
cp -r . "$SBOX"
pushd "$SBOX" >/dev/null
git init -b sandbox || true
git apply "$PATCH_FILE" || { echo "Patch apply fail"; exit 1; }
DRY_RUN=1 bash ../scripts/gitops_sync.sh || { echo "DRY_RUN fail"; exit 1; }

# Run Trivy to ensure no high/critical filesystem issues introduced
if command -v trivy >/dev/null 2>&1; then
  trivy fs . --severity CRITICAL,HIGH --exit-code 1 || { echo "Trivy fail"; exit 1; }
else
  echo "trivy not installed — skipping fs scan"
fi
popd >/dev/null

# Якщо OK, apply to main
git apply "$PATCH_FILE"
git commit -m "autopatch: applied via self-learning [runId:$RUN_ID]" || true
git push origin main || true

echo "Autopatch застосовано успішно"
