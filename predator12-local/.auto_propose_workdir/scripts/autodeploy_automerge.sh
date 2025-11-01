#!/usr/bin/env bash
set -euo pipefail

# Full autonomous flow (if run on a machine with gh auth and sufficient permissions):
# 1) Set BOT_PAT secret and enable auto-merge
# 2) Create a test branch, push, create PR and add label `automerge`
# Usage example:
#   export GITHUB_REPOSITORY=owner/repo
#   export BOT_PAT="ghp_..."   # token for the bot that will approve
#   gh auth login --with-token < admin_token.txt   # authenticate gh as admin
#   ./scripts/autodeploy_automerge.sh

: "${GITHUB_REPOSITORY:?Set GITHUB_REPOSITORY env var (owner/repo)}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not installed. Install: https://cli.github.com/"
  exit 2
fi

# 1) Setup repo (secret + auto-merge)
./scripts/setup_automerge_repo.sh

# 2) Create and label PR
./scripts/auto_create_and_label_pr.sh

echo "Autodeploy sequence complete. Watch Actions for the auto-approve workflow run."
