#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <pr-number> [label]"
  exit 2
fi

PR_NUMBER="$1"
LABEL="${2:-automerge}"

# Requires GitHub CLI (gh) authenticated. Example: gh auth login
gh pr edit "$PR_NUMBER" --add-label "$LABEL"
echo "Added label '$LABEL' to PR #$PR_NUMBER"
