#!/usr/bin/env bash
set -euo pipefail

# Usage: BOT_PAT="ghp_..." GITHUB_REPOSITORY=owner/repo ./scripts/setup_automerge_repo.sh
# Requires: `gh` CLI installed and authenticated as a user that can set repo secrets and change repo settings.

: "${GITHUB_REPOSITORY:?Set GITHUB_REPOSITORY env var (owner/repo)}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: 'gh' CLI not found. Install it first: https://cli.github.com/"
  exit 2
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh CLI not authenticated. Run 'gh auth login' first or export GITHUB_TOKEN for non-interactive use."
  exit 2
fi

if [ -z "${BOT_PAT-}" ]; then
  echo "ERROR: BOT_PAT environment variable not set. This should contain the bot personal access token to be stored as a repo secret."
  exit 2
fi

echo "Setting repository secret BOT_PAT..."
# Create/update secret using gh
printf '%s' "$BOT_PAT" | gh secret set BOT_PAT --repo "$GITHUB_REPOSITORY"

if [ $? -ne 0 ]; then
  echo "Failed to set secret via gh CLI." >&2
  exit 3
fi

echo "Enabling repository auto-merge setting..."
# Try to enable auto-merge via GH API using gh api
# Note: API accepts allow_auto_merge on repo PATCH
gh api -X PATCH "/repos/$GITHUB_REPOSITORY" -f allow_auto_merge=true >/dev/null

if [ $? -ne 0 ]; then
  echo "Warning: failed to toggle allow_auto_merge via API. You may need to enable Auto-merge in repo Settings manually." >&2
else
  echo "Auto-merge enabled for repository (if supported by account permissions)."
fi

echo "Setting branch protection rules to allow auto-merge without approvals..."
gh api -X PUT "/repos/$GITHUB_REPOSITORY/branches/main/protection" \
  -f required_status_checks=null \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count": 0}' \
  -f restrictions=null \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f block_creations=false \
  -f lock_branch=false \
  -f allow_fork_syncing=true >/dev/null

if [ $? -ne 0 ]; then
  echo "Warning: failed to set branch protection rules. You may need to adjust them manually in repo Settings." >&2
else
  echo "Branch protection rules updated to allow auto-merge without approvals."
fi

echo "Setup complete. Ensure branch-protection rules and merge button settings allow auto-merge."
