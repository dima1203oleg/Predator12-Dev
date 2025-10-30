#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <pr-number> [label]"
  exit 2
fi

PR_NUMBER="$1"
LABEL="${2:-automerge}"

if [ -z "${BOT_PAT:-}" ]; then
  echo "Error: BOT_PAT environment variable is not set. Export your bot PAT into BOT_PAT." >&2
  exit 3
fi

# Determine repository (owner/repo)
REPO="${GITHUB_REPOSITORY:-}"
if [ -z "$REPO" ]; then
  # Try to infer from git remote
  remote_url=$(git config --get remote.origin.url || true)
  if [[ "$remote_url" =~ github.com[:/](.+)\.git ]]; then
    REPO="${BASH_REMATCH[1]}"
  fi
fi

if [ -z "$REPO" ]; then
  echo "Could not determine repository. Set GITHUB_REPOSITORY or run from a git repo with origin pointing to GitHub." >&2
  exit 4
fi

API_URL="https://api.github.com/repos/$REPO/issues/$PR_NUMBER/labels"

payload=$(printf '{"labels": ["%s"]}' "$LABEL")

resp=$(curl -sS -o /dev/stderr -w "%{http_code}" -X POST -H "Authorization: token $BOT_PAT" -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" "$API_URL" -d "$payload")

if [ "$resp" -ge 200 ] && [ "$resp" -lt 300 ]; then
  echo "Label '$LABEL' added to PR #$PR_NUMBER in $REPO"
  exit 0
else
  echo "GitHub API returned status $resp" >&2
  exit 5
fi
