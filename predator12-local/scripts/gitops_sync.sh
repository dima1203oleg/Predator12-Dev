#!/usr/bin/env bash
set -euo pipefail
MANIFESTS_REPO="${MANIFESTS_REPO:-../predator-manifests}"
IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"
DRY_RUN="${DRY_RUN:-0}"

echo "[gitops_sync] start: MANIFESTS_REPO=${MANIFESTS_REPO} IMAGE_TAG=${IMAGE_TAG} DRY_RUN=${DRY_RUN}"

# 1) Init repo (idempotent)
if [ ! -d "${MANIFESTS_REPO}" ]; then
  git clone git@github.com:dima1203oleg/predator-manifests.git "${MANIFESTS_REPO}"
fi

# 2) Run MCP analyzer (node/mcpOrchestrator.js expected to return exit code 2 for high-risk)
if command -v node >/dev/null 2>&1 && [ -f ./mcp/mcpOrchestrator.js ]; then
  node ./mcp/mcpOrchestrator.js --repo "${PWD}" --image-tag "${IMAGE_TAG}" || true
fi

# 3) Bump image tag in values.yaml (idempotent via yq)
if [ -f "${MANIFESTS_REPO}/helm/predator-umbrella/values.yaml" ]; then
  if command -v yq >/dev/null 2>&1; then
    yq eval -i ".global.image.tag = \"${IMAGE_TAG}\"" "${MANIFESTS_REPO}/helm/predator-umbrella/values.yaml"
  else
    echo "yq not found — skipping values.yaml bump"
  fi
else
  echo "Values file not found in manifests repo — skipping bump"
fi

# 4) Commit changes
if [ -d "${MANIFESTS_REPO}/.git" ]; then
  cd "${MANIFESTS_REPO}"
  git add -A || true
  if git diff --cached --quiet; then
    echo "[gitops_sync] no changes to commit"
  else
    git commit -m "chore: update image tag ${IMAGE_TAG} [auto]" || true
    if [ "${DRY_RUN}" != "1" ]; then
      git push origin main || true
    else
      git --no-pager show --name-only --pretty="" HEAD > ../test-rendered-change.log || true
    fi
  fi
  cd - >/dev/null || true
else
  echo "Manifests repo not initialized — skipping commit/push"
fi

# 5) Optionally trigger ArgoCD sync via its API (requires ARGO_AUTH_TOKEN)
if [ "${DRY_RUN}" != "1" ] && [ -n "${ARGO_SERVER:-}" ] && [ -n "${ARGO_AUTH_TOKEN:-}" ]; then
  curl -sS -X POST "${ARGO_SERVER}/api/v1/applications/predator/sync" -H "Authorization: Bearer ${ARGO_AUTH_TOKEN}" || true
fi

echo "[gitops_sync] cycle completed"
#!/usr/bin/env bash
set -euo pipefail

# Helm-first GitOps sync script — robust bootstrap, MCP decision, DRY_RUN, HTTPS fallback, PR flow, ArgoCD sync
MANIF_REPO="${MANIF_REPO:-${MANIFESTS_REPO:-../predator-manifests}}"
IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"
DRY_RUN="${DRY_RUN:-0}"
MANIFESTS_TEMPLATE="${MANIFESTS_TEMPLATE:-../predator-base-manifests}"
MANIFESTS_REMOTE="${MANIFESTS_REMOTE:-}"    # optional HTTPS remote
GH_TOKEN="${GH_TOKEN:-}"
MCP_ANALYZE_CMD="${MCP_ANALYZE_CMD:-}"      # optional simple command returning 'low' or 'high'
MCP_BIN="${MCP_BIN:-node}"
MCP_SCRIPT="${MCP_SCRIPT:-./core/mcpOrchestrator.js}"

echo "[gitops_sync] target manifests repo: $MANIF_REPO"
echo "[gitops_sync] target image tag: $IMAGE_TAG"
if [ "$DRY_RUN" != "0" ]; then
  echo "[gitops_sync] running in DRY_RUN mode — no commits/pushes will be made"
fi

# Ensure manifests dir exists
if [ ! -d "$MANIF_REPO" ]; then
  echo "[gitops_sync] manifests path $MANIF_REPO does not exist — creating"
  mkdir -p "$MANIF_REPO"
fi

# Detect if repo is empty / has no git metadata
EMPTY_REMOTE=0
if [ -d "$MANIF_REPO/.git" ]; then
  pushd "$MANIF_REPO" >/dev/null
  REMOTE_STATE=$(git ls-remote --heads origin 2>/dev/null || true)
  if [ -z "$REMOTE_STATE" ]; then
    EMPTY_REMOTE=1
  fi
  popd >/dev/null
else
  EMPTY_REMOTE=1
fi

if [ "$EMPTY_REMOTE" -eq 1 ]; then
  echo "[gitops_sync] manifests repo appears EMPTY or uninitialized — initializing base template"
  # Copy template if available, else create minimal skeleton
  if [ -d "$MANIFESTS_TEMPLATE" ]; then
    echo "[gitops_sync] copying template from $MANIFESTS_TEMPLATE"
    # protect against empty $MANIF_REPO expansion
    rm -rf "${MANIF_REPO:?}/"* || true
    cp -a "$MANIFESTS_TEMPLATE/." "$MANIF_REPO/" 2>/dev/null || true
  else
    echo "[gitops_sync] no template found at $MANIFESTS_TEMPLATE — creating minimal structure"
    mkdir -p "$MANIF_REPO/helm/predator-rendered"
    echo "# Predator Manifests Repo (bootstrap)" > "$MANIF_REPO/README.md"
  fi

  pushd "$MANIF_REPO" >/dev/null
    if [ ! -d .git ]; then
      git init -b main || git init || true
      [ -n "${GIT_AUTHOR_NAME:-}" ] && git config user.name "${GIT_AUTHOR_NAME}"
      [ -n "${GIT_AUTHOR_EMAIL:-}" ] && git config user.email "${GIT_AUTHOR_EMAIL}"
      if [ -n "$MANIFESTS_REMOTE" ]; then
        git remote add origin "$MANIFESTS_REMOTE" || true
      fi
    fi
  git add -A || true
  git commit -m "init: bootstrap manifests $(date -u +%Y-%m-%dT%H:%M:%SZ)" || true
  git tag -f init-$(date +%Y%m%d) || true
  if [ -n "$MANIFESTS_REMOTE" ] && [ -n "$GH_TOKEN" ]; then
    # push via HTTPS using token (temporary remote URL)
    AUTH_REMOTE="${MANIFESTS_REMOTE/https:\/\/github.com/https://x-access-token:$GH_TOKEN@github.com}"
    git remote set-url origin "$AUTH_REMOTE" || git remote add origin "$AUTH_REMOTE" || true
    git push -u origin main || true
    git push origin --tags || true
  fi
  popd >/dev/null
fi

pushd "$MANIF_REPO" >/dev/null

# detect yq
YQ_PRESENT=0
if command -v yq >/dev/null 2>&1; then
  YQ_PRESENT=1
fi

# Helm-first update logic
if [ -f "charts/predator/values.yaml" ]; then
  echo "[gitops_sync] found charts/predator/values.yaml — updating .image.tag"
  cp -v charts/predator/values.yaml charts/predator/values.yaml.bak.$(date +%s) || true
  if [ "$YQ_PRESENT" -eq 1 ]; then
    # shellcheck disable=SC2016
    yq eval -i '.image.tag = env(IMAGE_TAG)' charts/predator/values.yaml || true
  else
    sed -E -i.bak "s/^(\s*tag:\s*).*/\1${IMAGE_TAG}/" charts/predator/values.yaml || true
  fi
else
  echo "[gitops_sync] charts/predator/values.yaml not found — scanning rendered YAMLs"
  RENDERED_FILES=$(find helm -type f -name "*-rendered*.yaml" -o -path "helm/*-rendered/*.yaml" || true)
  if [ -z "$RENDERED_FILES" ]; then
    RENDERED_FILES=$(find . -type f -name "*.yaml" -o -name "*.yml" | sed 's|^./||')
  fi

  echo "[gitops_sync] files to examine:"
  echo "$RENDERED_FILES"

  for f in $RENDERED_FILES; do
    [ -f "$f" ] || continue
    echo "[gitops_sync] -> processing $f"
    cp -v "$f" "$f.bak.$(date +%s)" || true
    if [ "$YQ_PRESENT" -eq 1 ]; then
      echo "[gitops_sync] attempting structured yq update on $f"
      # shellcheck disable=SC2016
      if yq eval -i '(. as $in | .. | select(type == "!!map") | select(has("image")) | .image) |= sub(":[^:@]+$"; ":" + env(IMAGE_TAG))' "$f" 2>/dev/null; then
        echo "[gitops_sync] structured yq update succeeded for $f"
        # shellcheck disable=SC2016
        yq eval -i '(. as $in | .. | scalars | select(test(":latest$"))) |= sub(":latest$"; ":" + env(IMAGE_TAG))' "$f" 2>/dev/null || true
      else
        echo "[gitops_sync] structured yq update failed for $f — fallback to regex"
        perl -pi -e "s/(:latest)\\b/:$IMAGE_TAG/g" "$f" || true
        perl -pi -e "s|(docker.io/predator-analytics/[^:\\s]+):[^\\s\"']+|\\1:$IMAGE_TAG|g" "$f" || true
      fi
    else
      perl -pi -e "s/(:latest)\\b/:$IMAGE_TAG/g" "$f" || true
      perl -pi -e "s|(docker.io/predator-analytics/[^:\\s]+):[^\\s\"']+|\\1:$IMAGE_TAG|g" "$f" || true
    fi
  done
fi

# ------------------------------------------------------------------
# MCP risk gate (simple mode: MCP_ANALYZE_CMD returns 'low' or 'high')
# ------------------------------------------------------------------
RISK_DECISION="low"
if [ -n "$MCP_ANALYZE_CMD" ]; then
  echo "[gitops_sync] running MCP_ANALYZE_CMD..."
  set +e
  MCP_OUT=$($MCP_ANALYZE_CMD 2>/dev/null || true)
  MCP_EXIT=$?
  set -e
  echo "[gitops_sync] MCP response: $MCP_OUT (exit $MCP_EXIT)"
  echo "$MCP_OUT" | grep -qi 'risk=high' && RISK_DECISION="high"
  echo "$MCP_OUT" | grep -qi 'risk=low' && RISK_DECISION="low"
elif [ -x "$MCP_BIN" ] && [ -f "$MCP_SCRIPT" ]; then
  echo "[gitops_sync] running MCP script via $MCP_BIN $MCP_SCRIPT"
  set +e
  MCP_OUT=$($MCP_BIN "$MCP_SCRIPT" --analyze --context "{\"changes\":[]}" 2>/dev/null || true)
  set -e
  echo "[gitops_sync] MCP response: $MCP_OUT"
  echo "$MCP_OUT" | grep -qi 'risk=high' && RISK_DECISION="high"
fi

git add -A || true
# commit only if changes present
if ! git diff --quiet --staged; then
  git commit -m "auto: bump image tag to $IMAGE_TAG" || true
else
  echo "[gitops_sync] no changes to commit"
fi

if [ "$DRY_RUN" != "0" ]; then
  echo "[gitops_sync] DRY_RUN enabled — showing git diff (unstaged)"
  git --no-pager diff || true
  popd >/dev/null
  echo "[gitops_sync] done (dry-run)"
  exit 0
fi

# Push or PR depending on MCP decision
if [ "$RISK_DECISION" = "low" ]; then
  echo "[gitops_sync] low-risk -> attempting push to origin/main"
  if git rev-parse --abbrev-ref origin >/dev/null 2>&1; then
    if git push origin main; then
      echo "[gitops_sync] pushed changes to origin/main"
    else
      echo "[gitops_sync] git push failed (credentials?)" >&2
      popd >/dev/null
      exit 3
    fi
  else
    if [ -n "$MANIFESTS_REMOTE" ] && [ -n "$GH_TOKEN" ]; then
      echo "[gitops_sync] adding remote and pushing via GH_TOKEN"
      AUTH_REMOTE="${MANIFESTS_REMOTE/https:\/\/github.com/https://x-access-token:$GH_TOKEN@github.com}"
      git remote remove origin 2>/dev/null || true
      git remote add origin "$AUTH_REMOTE" || true
      if git push -u origin main; then
        echo "[gitops_sync] pushed to MANIFESTS_REMOTE via token"
      else
        echo "[gitops_sync] push to MANIFESTS_REMOTE failed" >&2
        popd >/dev/null
        exit 3
      fi
    else
      echo "[gitops_sync] no origin and no MANIFESTS_REMOTE/GH_TOKEN — cannot push automatically" >&2
      popd >/dev/null
      exit 4
    fi
  fi
else
  echo "[gitops_sync] high-risk detected — creating PR branch"
  if command -v gh >/dev/null 2>&1; then
    CURR_BRANCH="autonomous/$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$CURR_BRANCH"
    git push -u origin "$CURR_BRANCH" || true
    gh pr create -B main -H "$CURR_BRANCH" -t "Autonomous update: $IMAGE_TAG" -b "MCP: risk=high" -l "autonomous/review-needed" || true
  else
    echo "[gitops_sync] gh CLI not found — please create PR manually or install gh" >&2
    popd >/dev/null
    exit 7
  fi
fi

# Optional ArgoCD sync
if command -v argocd >/dev/null 2>&1 && [ -n "${ARGO_AUTH_TOKEN:-}" ]; then
  echo "[gitops_sync] triggering ArgoCD sync..."
  argocd login "${ARGO_SERVER:-argocd.example.com}" --auth-token "${ARGO_AUTH_TOKEN}" --insecure || true
  argocd app sync predator-production --prune || true
fi

popd >/dev/null
echo "[gitops_sync] cycle completed (exit 0)"
exit 0
