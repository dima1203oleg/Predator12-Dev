#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/auto_create_and_label_pr.sh
# Creates a test branch, pushes it, creates a PR, and adds label `automerge` using gh CLI.

REPO_DIR="$(pwd)"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BRANCH="auto-approve-test-${TIMESTAMP}"
PR_TITLE="Auto-approve E2E test ${TIMESTAMP}"
PR_BODY="Automated test PR for auto-approve workflow. Generated at ${TIMESTAMP}."
BASE_BRANCH="main"

echo "Working in: ${REPO_DIR}"

auth_ok=true
if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: 'gh' CLI not found. Install and authenticate: https://cli.github.com/"
  auth_ok=false
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: Not a git repository."
  auth_ok=false
fi

# Check remote
if [ "$auth_ok" = true ]; then
  if ! git ls-remote origin >/dev/null 2>&1; then
    echo "ERROR: Cannot access remote 'origin'. Ensure you have push rights and remote is configured."
    auth_ok=false
  fi
fi

if [ "$auth_ok" != true ]; then
  echo "Aborting E2E. See errors above."
  exit 2
fi

# Create branch and push
git checkout -b "$BRANCH"
# Create an empty commit to avoid modifying files
git commit --allow-empty -m "chore: automated test for auto-approve (timestamp ${TIMESTAMP})" --no-verify

# Push branch
git push -u origin "$BRANCH"

# Create PR via gh
PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base "$BASE_BRANCH" --head "$BRANCH" --assignee @me --label "automerge" --repo "$(git remote get-url origin)" --json url -q .url 2>/dev/null || true)

if [ -z "$PR_URL" ]; then
  echo "gh pr create failed; attempting fallback without labels/assignee"
  PR_URL=$(gh pr create --title "$PR_TITLE" --body "$PR_BODY" --base "$BASE_BRANCH" --head "$BRANCH" --repo "$(git remote get-url origin)" --json url -q .url)
fi

if [ -z "$PR_URL" ]; then
  echo "Failed to create PR via gh CLI." >&2
  exit 3
fi

echo "PR created: $PR_URL"

# Ensure label exists, then add label
# Create label if not exists
if ! gh label list --repo "$(git remote get-url origin)" | jq -r '.[].name' 2>/dev/null | grep -x "automerge" >/dev/null 2>&1; then
  echo "Label 'automerge' not found — creating it."
  gh label create automerge --color 0e8a16 --description "Allow auto-approve/merge by bot" --repo "$(git remote get-url origin)" || true
fi

# Add label to PR
PR_NUMBER=$(basename "$PR_URL")
# gh pr view accepts URL
gh pr edit "$PR_URL" --add-label automerge --repo "$(git remote get-url origin)"

echo "Label 'automerge' added to PR. E2E flow triggered."

echo "Done. PR: $PR_URL"
