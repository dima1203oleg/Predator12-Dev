#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/create_pr.sh <branch-name> "PR title" "PR body"
BRANCH=${1:-"auto/ops-bootstrap-$(date +%s)"}
TITLE=${2:-"ops: add automation manifests and scripts"}
BODY=${3:-"Bootstrap: add .assistant/permissions.yml, ops workflow, opsctl, RBAC, Vault policy, ArgoCD project"}

git checkout -b "$BRANCH"
git add .assistant/ .github/workflows/ops.yml scripts/opsctl scripts/validate_permissions.py rbac/ops-bot.yaml vault/policies/ops-bot.hcl argocd/project-predator.yaml
git commit -m "$TITLE" || true

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found — files staged locally on branch $BRANCH"
  echo "To create PR: gh pr create --fill --title \"$TITLE\" --body \"$BODY\" --base main --head $BRANCH"
  exit 0
fi

gh auth status || echo "Ensure gh is authenticated"
gh pr create --title "$TITLE" --body "$BODY" --base main --head "$BRANCH"
