#!/usr/bin/env bash
set -euo pipefail

# Auto merge condition check skeleton
# Exits 0 if conditions pass, non-zero otherwise.

PR_NUMBER="${PR_NUMBER:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO="${GITHUB_REPOSITORY:-$(git config --get remote.origin.url || true)}"
# control flags (set workflow env to override)
SKIP_MCP="${SKIP_MCP:-true}"
SKIP_SUPPLYCHAIN="${SKIP_SUPPLYCHAIN:-true}"
MCP_THRESHOLD="${MCP_THRESHOLD:-0.9}"
IMAGES_TO_VERIFY="${IMAGES_TO_VERIFY:-}"

if [ -z "$PR_NUMBER" ]; then
  echo "[auto-merge] PR_NUMBER not set. If running manually, pass PR_NUMBER env or use workflow_dispatch input." >&2
  exit 2
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "[auto-merge] GITHUB_TOKEN not provided. Provide via env GITHUB_TOKEN or set secret AUTO_MERGE_BOT_TOKEN." >&2
  exit 3
fi

# Normalize REPO to owner/repo if URL provided
if [[ "$REPO" == *"git@"* || "$REPO" == *"https://"* ]]; then
  # try parse remote URL
  RURL="$REPO"
  # convert git@github.com:owner/repo.git to owner/repo
  if [[ "$RURL" =~ git@github.com:(.+)\.git ]]; then
    REPO="${BASH_REMATCH[1]}"
  elif [[ "$RURL" =~ https://[^/]+/(.+)\.git ]]; then
    REPO="${BASH_REMATCH[1]}"
  fi
fi

OWNER=$(echo "$REPO" | cut -d'/' -f1)
NAME=$(echo "$REPO" | cut -d'/' -f2-)

echo "[auto-merge] Repo: $OWNER/$NAME PR: $PR_NUMBER"

API=https://api.github.com

echo "[auto-merge] Fetching PR info..."
PR_JSON=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/repos/$OWNER/$NAME/pulls/$PR_NUMBER")
HEAD_SHA=$(echo "$PR_JSON" | jq -r .head.sha)
if [ -z "$HEAD_SHA" ] || [ "$HEAD_SHA" = "null" ]; then
  echo "[auto-merge] Failed to determine head SHA for PR $PR_NUMBER" >&2
  exit 4
fi
echo "[auto-merge] Head SHA: $HEAD_SHA"

# 1) Check runs
echo "[auto-merge] Checking check-runs for commit $HEAD_SHA..."
CHECKS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/repos/$OWNER/$NAME/commits/$HEAD_SHA/check-runs" | jq -r '.check_runs[] | [.name, .status, .conclusion] | @tsv' || true)
if [ -z "$CHECKS" ]; then
  echo "[auto-merge] No check-runs found for commit. Will inspect combined status..."
  COMBINED=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$API/repos/$OWNER/$NAME/commits/$HEAD_SHA/status")
  state=$(echo "$COMBINED" | jq -r .state)
  echo "[auto-merge] Combined state: $state"
  if [ "$state" != "success" ]; then
    echo "[auto-merge] Combined status not successful: $state" >&2
    exit 5
  fi
else
  echo "$CHECKS" | while IFS=$'\t' read -r name status conclusion; do
    echo "[auto-merge] check: $name status=$status conclusion=$conclusion"
    if [ "$status" != "completed" ]; then
      echo "[auto-merge] Check $name not completed (status=$status)" >&2
      exit 6
    fi
    if [ "$conclusion" != "success" ]; then
      echo "[auto-merge] Check $name conclusion != success (conclusion=$conclusion)" >&2
      exit 7
    fi
  done
fi

# 2) MCP - optional (skipped by default)
if [ "$SKIP_MCP" = "true" ] || [ "$SKIP_MCP" = "1" ]; then
  echo "[auto-merge] SKIP_MCP is true — skipping MCP analysis (ensure you understand the risk)"
else
  if [ -x ./core/mcpOrchestrator.js ] || [ -f ./core/mcpOrchestrator.js ]; then
    echo "[auto-merge] Running MCP analyzer..."
    MCP_OUT=$(node ./core/mcpOrchestrator.js --analyze --context "{\"changes\":[\"$HEAD_SHA\"]}" 2>/dev/null || true)
    echo "[auto-merge] MCP output: $MCP_OUT"
    # Expect MCP_OUT to contain 'risk=low|high' and optionally 'confidence=0.92'
    if echo "$MCP_OUT" | grep -qi 'risk=high'; then
      echo "[auto-merge] MCP reported high risk" >&2
      exit 8
    fi
    CONF=$(echo "$MCP_OUT" | grep -oE 'confidence=[0-9.]+' | sed 's/confidence=//g' || true)
    if [ -n "$CONF" ]; then
      echo "[auto-merge] MCP confidence: $CONF (threshold: $MCP_THRESHOLD)"
      awk "BEGIN{exit !($CONF >= $MCP_THRESHOLD)}" || (echo "[auto-merge] MCP confidence below threshold" >&2; exit 9)
    else
      echo "[auto-merge] MCP did not return confidence — failing safe" >&2
      exit 9
    fi
  else
    echo "[auto-merge] MCP script not found — failing safe" >&2
    exit 9
  fi
fi

# 3) Supply chain (optional)
if [ "$SKIP_SUPPLYCHAIN" = "true" ] || [ "$SKIP_SUPPLYCHAIN" = "1" ]; then
  echo "[auto-merge] SKIP_SUPPLYCHAIN is true — skipping Trivy/Cosign checks"
else
  echo "[auto-merge] Running Cosign verification for images: $IMAGES_TO_VERIFY"
  if [ -n "$IMAGES_TO_VERIFY" ]; then
    for img in $(echo "$IMAGES_TO_VERIFY" | tr ',' ' '); do
      echo "[auto-merge] verifying $img"
      if [ -n "${COSIGN_PUB:-}" ]; then
        echo "$COSIGN_PUB" > /tmp/cosign.pub
        cosign verify --key /tmp/cosign.pub "$img" || (echo "[auto-merge] cosign verify failed for $img" >&2; exit 10)
      else
        cosign verify "$img" || (echo "[auto-merge] cosign verify failed for $img" >&2; exit 10)
      fi
    done
  else
    echo "[auto-merge] No IMAGES_TO_VERIFY provided — supplychain verification skipped" >&2
    exit 10
  fi
fi

# If we reached here — success
RUN_ID="auto-merge-$(date +%Y%m%d%H%M%S)-$PR_NUMBER"
AUDIT_DIR="./.auto_merge_audit"
mkdir -p "$AUDIT_DIR"
cat > "$AUDIT_DIR/${RUN_ID}.json" <<EOF
{
  "runId": "$RUN_ID",
  "repo": "$OWNER/$NAME",
  "pr": $PR_NUMBER,
  "head_sha": "$HEAD_SHA",
  "checks": "ok",
  "mcp_skipped": "$SKIP_MCP",
  "supplychain_skipped": "$SKIP_SUPPLYCHAIN",
  "timestamp": "$(date --iso-8601=seconds)"
}
EOF

echo "[auto-merge] All checks passed — audit created at $AUDIT_DIR/${RUN_ID}.json"
exit 0
