#!/usr/bin/env bash
set -euo pipefail

# Usage: create-manifests-pr.sh <manifests-repo> <branch> <image>
MANIFESTS_REPO="${1:-}"
BRANCH="${2:-main}"
IMAGE="${3:-}"
AUTO_MERGE="${AUTO_MERGE:-0}"

if [ -z "$MANIFESTS_REPO" ] || [ -z "$IMAGE" ]; then
  echo "usage: $0 <manifests-repo> <branch> <image>" >&2
  exit 2
fi

TMPDIR=$(mktemp -d)
git clone --single-branch --branch "$BRANCH" "$MANIFESTS_REPO" "$TMPDIR/manifests"
cd "$TMPDIR/manifests"
git config user.email "ci-bot@example.com"
git config user.name "ci-bot"

# Update naive: replace image lines in values*.yaml
find . -type f -name "values*.yaml" -print0 | xargs -0 -n1 sed -i.bak "s|image: .*|image: '$IMAGE'|g" || true

git add .
if git commit -m "chore: update images to $IMAGE"; then
  if [ "$AUTO_MERGE" = "1" ]; then
    # Direct push to branch (auto-merge behavior). Ensure the CI/service account has push rights.
    echo "[create-manifests-pr] AUTO_MERGE=1 -> pushing directly to $BRANCH" >&2
    git push origin "$BRANCH" || { echo "[create-manifests-pr] push failed" >&2; exit 4; }
    echo "[create-manifests-pr] pushed update to $BRANCH in $MANIFESTS_REPO" >&2
  else
    git push origin "$BRANCH"
    # Create PR using gh if available
    if command -v gh >/dev/null 2>&1; then
      gh pr create --title "chore: update images to $IMAGE" --body "Automated image update: $IMAGE" --base "$BRANCH" --head "$BRANCH" || true
    else
      echo "Pushed update to $BRANCH in $MANIFESTS_REPO" >&2
    fi
  fi
else
  echo "No changes to commit" >&2
fi

rm -rf "$TMPDIR"
