#!/usr/bin/env bash
set -euo pipefail

# auto_bump_and_pr.sh
# Prepares a branch with updated manifests (image replaced) and opens a PR against manifests repo.
# Requires: MANIFESTS_REPO (ssh or https), GH_TOKEN (for gh cli) and IMAGE

IMAGE=${1:-}
MANIFESTS_REPO=${MANIFESTS_REPO:-}
BRANCH=${2:-auto/bump-manifests-$(date +%s)}

if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image:tag> [branch]" >&2
  exit 2
fi

if [ -z "$MANIFESTS_REPO" ]; then
  echo "MANIFESTS_REPO not set, aborting (dry-run)" >&2
  exit 0
fi

tmpdir=$(mktemp -d)
echo "Cloning manifests repo into $tmpdir"
git clone "$MANIFESTS_REPO" "$tmpdir"
cd "$tmpdir"
git checkout -b "$BRANCH"

mkdir -p updates
cp -r ../manifests-ready/prod/* updates/ || true
git add updates || true
git commit -m "chore: bump manifests -> $IMAGE" || true
git push origin "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  gh pr create --title "Bump manifests: $IMAGE" --body "Automated bump" --base main
else
  echo "gh cli not installed; created branch $BRANCH in $MANIFESTS_REPO";
fi
