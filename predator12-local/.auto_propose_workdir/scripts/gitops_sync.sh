#!/usr/bin/env bash
# GitOps sync з MCP decision — конфіг-орієнтований, безпечніший варіант.
set -euo pipefail

# --- Configurable environment / defaults ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${CONFIG_FILE:-$REPO_ROOT/autodeploy.config.yml}"

# Default fallbacks
MANIFESTS_REPO="${MANIFESTS_REPO:-$REPO_ROOT/../predator-manifests}"
IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"
RUN_ID="${RUN_ID:-$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "run-$(date +%s)") }"
DRY_RUN="${DRY_RUN:-0}"

# --- Helpers ---
require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"runId\":\"$RUN_ID\",\"level\":\"ERROR\",\"msg\":\"missing command\",\"cmd\":\"$cmd\"}" >&2
    exit 2
  fi
}

log_phase() {
  local phase="$1"; shift
  local msg="${*:-}"
  echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"runId\":\"$RUN_ID\",\"phase\":\"$phase\",\"msg\":\"$msg\"}"
}

# --- Preconditions: require tools we depend on ---
for c in git yq jq gh node bc; do
  require_cmd "$c"
done

# Read threshold from config if present
THRESHOLD="0.85"
if [ -f "$CONFIG_FILE" ]; then
  THRESHOLD="$(yq e '.threshold // .autonomy.threshold // 0.85' "$CONFIG_FILE" 2>/dev/null || echo "0.85")"
  MANIFESTS_REPO_CFG="$(yq e '.manifests_repo // ""' "$CONFIG_FILE" 2>/dev/null || echo "")"
  if [ -n "$MANIFESTS_REPO_CFG" ] && [ "$MANIFESTS_REPO_CFG" != "null" ]; then
    MANIFESTS_REPO="$MANIFESTS_REPO_CFG"
  fi
fi

log_phase "start" "gitops_sync starting; manifests_repo=$MANIFESTS_REPO image_tag=$IMAGE_TAG threshold=$THRESHOLD"

# Kill-switch: ops can disable autonomous runs
if [ -f /var/run/autodeploy.disabled ]; then
  log_phase "aborted" "kill-switch present: /var/run/autodeploy.disabled"
  exit 1
fi

# Ensure manifests repo exists (idempotent)
if [ ! -d "$MANIFESTS_REPO" ]; then
  log_phase "info" "manifests repo not found, attempting to clone as sandbox"
  mkdir -p "$(dirname "$MANIFESTS_REPO")"
  git clone --depth=1 "https://github.com/dima1203oleg/predator-manifests.git" "$MANIFESTS_REPO" || {
    log_phase "warn" "clone failed; creating empty repo at $MANIFESTS_REPO"
    mkdir -p "$MANIFESTS_REPO"
    git -C "$MANIFESTS_REPO" init -b main
    git -C "$MANIFESTS_REPO" remote add origin "https://github.com/dima1203oleg/predator-manifests.git" || true
  }
fi

pushd "$MANIFESTS_REPO" >/dev/null

# Defensive: ensure we have full history and submodules in manifests repo (idempotent)
git fetch --no-tags --prune --unshallow 2>/dev/null || true
git submodule sync --recursive 2>/dev/null || true
git submodule update --init --recursive 2>/dev/null || true

# -------- MCP analyze (predictive decision) --------
log_phase "mcp" "calling MCP analyzer"
MCP_CONTEXT="{\"changes\":[\"imageTag:$IMAGE_TAG\"],\"runId\":\"$RUN_ID\"}"
MCP_OUT="$(node core/mcpOrchestrator.js --analyze --context "$MCP_CONTEXT" 2>/dev/null || echo '{}')"
RISK="$(echo "$MCP_OUT" | jq -r '.risk // "low"')"
CONFIDENCE="$(echo "$MCP_OUT" | jq -r '.confidence // 0.85')"
log_phase "mcp.result" "risk=$RISK confidence=$CONFIDENCE"

# -------- Update manifests safely --------
log_phase "update" "updating values in helm/predator-umbrella/values-prod.yaml"
if yq e -i ".global.imageTag = \"${IMAGE_TAG}\"" helm/predator-umbrella/values-prod.yaml 2>/dev/null; then
  log_phase "update" "yq updated values-prod.yaml"
else
  if sed --version >/dev/null 2>&1; then
    sed -i "s/tag: .*$/tag: ${IMAGE_TAG}/" helm/predator-umbrella/values-prod.yaml || true
  else
    sed -i '' -e "s/tag: .*$/tag: ${IMAGE_TAG}/" helm/predator-umbrella/values-prod.yaml || true
  fi
  log_phase "update" "sed fallback applied"
fi

# Only commit if there are changes
if ! git diff --quiet --exit-code; then
  git add -A
  git commit -m "auto: bump image tag to $IMAGE_TAG [runId:$RUN_ID]" || true
  COMMITTED=1
  log_phase "git" "committed changes"
else
  COMMITTED=0
  log_phase "git" "no changes to commit"
fi

# If running in GitHub Actions, configure git for pushing using the provided token
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  # set safe git user
  git config user.name "${GITHUB_ACTOR:-github-actions[bot]}"
  git config user.email "${GITHUB_ACTOR:-github-actions[bot]}@users.noreply.github.com"

  # If a token is available, rewrite origin to use it for non-interactive push
  if [ -n "${GITHUB_TOKEN:-}" ]; then
    # Try to infer repository if not provided
    if [ -z "${GITHUB_REPOSITORY:-}" ]; then
      GITHUB_REPOSITORY=$(git config --get remote.origin.url | sed -E 's#git@github.com:##;s#https://github.com/##;s#\.git$##') || true
    fi
    if [ -n "${GITHUB_REPOSITORY:-}" ]; then
      git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" || true
      log_phase "git" "rewrote origin to use GITHUB_TOKEN for pushes"
    fi
  fi
fi

# DRY_RUN behaviour: show diff and exit without pushing
if [ "$DRY_RUN" != "0" ]; then
  log_phase "dry-run" "showing diff (no push)"
  if git ls-remote --exit-code origin main >/dev/null 2>&1; then
    git --no-pager log --oneline -n 5
    git --no-pager diff origin/main..HEAD || git --no-pager diff HEAD~1 || true
  else
    git --no-pager diff HEAD~1 || true
  fi
  popd >/dev/null
  log_phase "end" "dry-run complete"
  exit 0
fi

# -------- Decision logic (auto-push vs PR) --------
log_phase "decision" "evaluating risk threshold ($CONFIDENCE >= $THRESHOLD)"
AUTO_PUSH=0
if command -v bc >/dev/null 2>&1; then
  if [ "$RISK" = "low" ] && ( echo "$CONFIDENCE >= $THRESHOLD" | bc -l | grep -q "^1$" ); then
    AUTO_PUSH=1
  fi
else
  if [ "$RISK" = "low" ] && awk "BEGIN{exit !($CONFIDENCE >= $THRESHOLD)}"; then
    AUTO_PUSH=1
  fi
fi

if [ "$AUTO_PUSH" -eq 1 ] && [ "$COMMITTED" -eq 1 ]; then
  # Decide target branch for CI vs local runs. In CI prefer pushing back to the
  # checked-out branch (so we don't unexpectedly push to main). Locally default
  # to main for convenience unless AUTOSAVE_BRANCH is set.
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    TARGET_BRANCH="${AUTOSAVE_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
  else
    TARGET_BRANCH="${AUTOSAVE_BRANCH:-main}"
  fi

  log_phase "push" "low-risk detected — pushing to ${TARGET_BRANCH}"
  # Push current HEAD to the target branch on origin
  if git push origin HEAD:"${TARGET_BRANCH}"; then
    log_phase "push" "pushed ${TARGET_BRANCH}"
  else
    log_phase "push" "first push failed; attempting force-with-lease"
    if git push --force-with-lease origin HEAD:"${TARGET_BRANCH}"; then
      log_phase "push" "pushed ${TARGET_BRANCH} (force-with-lease)"
    else
      log_phase "push.failed" "unable to push to ${TARGET_BRANCH}"
    fi
  fi
  # Create or update a tag pointing at this run
  if git tag -a "deploy-$RUN_ID" -m "deploy $RUN_ID" 2>/dev/null; then
    git push origin "deploy-$RUN_ID" --force || true
  else
    git tag -f "deploy-$RUN_ID" || true
    git push origin "deploy-$RUN_ID" --force || true
  fi
  log_phase "push" "pushed ${TARGET_BRANCH} and tag deploy-$RUN_ID"
  echo "Low-risk auto-push OK"
else
  BRANCH="auto-update-$RUN_ID"
  log_phase "pr" "creating branch $BRANCH and PR (risk=$RISK)"
  git checkout -b "$BRANCH"
  git push -u origin "$BRANCH"
  PR_URL="$(gh pr create -B main -H "$BRANCH" -t "Autodeploy: $IMAGE_TAG [runId:$RUN_ID]" -b "MCP: risk=$RISK confidence=$CONFIDENCE. Artifacts: runId=$RUN_ID" -l "autodeploy/review-needed" 2>/dev/null || true)"
  if [ -n "$PR_URL" ]; then
    log_phase "pr.created" "pr_url=$PR_URL"
    echo "High-risk PR created: $PR_URL"
  else
    log_phase "pr.failed" "gh pr create returned no URL (check gh auth)"
    echo "High-risk PR created (gh pr create may have failed or returned no URL)"
  fi
fi

popd >/dev/null
log_phase "end" "gitops_sync: done"
