#!/usr/bin/env bash
set -euo pipefail

# dryrun_local.sh
# Build simulation: compute image tag, prepare manifests, create branch and commit artifacts locally.

TS=$(python -c 'import time; print(int(time.time()))')
IMAGE="local/predator12:dryrun-${TS}"
OUT_DIR="manifests-ready"
BRANCH="auto/manifests-ready-${TS}"

echo "Dry-run image: $IMAGE"

chmod +x ./scripts/deploy/prepare_manifests.sh || true
./scripts/deploy/prepare_manifests.sh "$IMAGE"

if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  echo "Branch $BRANCH already exists locally; using it"
else
  git checkout -b "$BRANCH"
fi

git add "$OUT_DIR" || true
if git diff --staged --quiet; then
  echo "No changes to commit"
else
  git commit -m "chore(dry-run): prepare manifests for $IMAGE" || true
fi

echo "Prepared manifests in branch $BRANCH"
echo "Files under $OUT_DIR/prod:"
ls -R "$OUT_DIR/prod" || true
