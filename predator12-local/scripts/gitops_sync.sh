#!/usr/bin/env bash
set -euo pipefail
MANIF_REPO="${MANIFESTS_REPO:-../predator-manifests}"
IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"
DRY_RUN="${DRY_RUN:-0}"

if [ ! -d "$MANIF_REPO" ]; then
  echo "[gitops_sync] manifests repo not found at $MANIF_REPO" >&2
  exit 2
fi

pushd "$MANIF_REPO" >/dev/null

echo "[gitops_sync] target manifests repo: $MANIF_REPO"
echo "[gitops_sync] target image tag: $IMAGE_TAG"
if [ "$DRY_RUN" != "0" ]; then
  echo "[gitops_sync] running in DRY_RUN mode — no commits/pushes will be made"
fi

YQ_PRESENT=0
if command -v yq >/dev/null 2>&1; then
  YQ_PRESENT=1
fi

if [ -f "charts/predator/values.yaml" ]; then
  echo "[gitops_sync] found charts/predator/values.yaml — updating via yq (if available)"
  if [ "$YQ_PRESENT" -eq 1 ]; then
  echo "[gitops_sync] updating charts/predator/values.yaml -> .image.tag = $IMAGE_TAG"
  # make a backup
  cp -v charts/predator/values.yaml charts/predator/values.yaml.bak.$(date +%s)
  # shellcheck disable=SC2016
  yq eval -i '.image.tag = env(IMAGE_TAG)' charts/predator/values.yaml
  else
    echo "[gitops_sync] yq not found — attempting a conservative sed replace on charts/predator/values.yaml"
    cp -v charts/predator/values.yaml charts/predator/values.yaml.bak.$(date +%s)
    # replace a line like image:
    sed -E -i.bak "s/^(\s*tag:\s*).*/\1${IMAGE_TAG}/" charts/predator/values.yaml || true
  fi
else
  echo "[gitops_sync] charts/predator/values.yaml not found — falling back to editing rendered manifests"
  # Look for rendered manifests produced by render_and_sync.sh
  RENDERED_FILES=$(find helm -type f -name "*-rendered*.yaml" -o -path "helm/*-rendered/*.yaml" || true)
  if [ -z "$RENDERED_FILES" ]; then
    echo "[gitops_sync] no rendered files found under helm/*-rendered — scanning entire repo for YAML files"
    RENDERED_FILES=$(find . -type f -name "*.yaml" -o -name "*.yml" | sed 's|^./||')
  fi

  echo "[gitops_sync] files to examine:"
  echo "$RENDERED_FILES"

  for f in $RENDERED_FILES; do
    [ -f "$f" ] || continue
    echo "[gitops_sync] -> processing $f"
    # backup file
    cp -v "$f" "$f.bak.$(date +%s)" || true

    if [ "$YQ_PRESENT" -eq 1 ]; then
      # Try a structured yq update first. If it fails (yq variant differences), fall back to regex replacements.
      echo "[gitops_sync] attempting structured yq update on $f"
  # shellcheck disable=SC2016
  if yq eval -i '(. as $in | .. | select(type == "!!map") | select(has("image")) | .image) |= sub(":[^:@]+$"; ":" + env(IMAGE_TAG))' "$f" 2>/dev/null; then
        echo "[gitops_sync] structured yq update succeeded for $f"
        # best-effort: also replace explicit :latest scalars
  # shellcheck disable=SC2016
  yq eval -i '(. as $in | .. | scalars | select(test(":latest$"))) |= sub(":latest$"; ":" + env(IMAGE_TAG))' "$f" 2>/dev/null || true
      else
        echo "[gitops_sync] structured yq update failed for $f — falling back to regex replacements"
        perl -pi -e "s/(:latest)\\b/:$IMAGE_TAG/g" "$f" || true
        perl -pi -e "s|(your-docker-repo/[^:\\s]+):[^\\s\"']+|\\1:$IMAGE_TAG|g" "$f" || true
        # Also replace common predator image patterns (docker.io/predator-analytics/*:TAG)
        perl -pi -e "s|(docker.io/predator-analytics/[^:\\s]+):[^\\s\"']+|\\1:$IMAGE_TAG|g" "$f" || true
      fi
    else
      # best-effort regex replace for :latest or your-docker-repo patterns
      perl -pi -e "s/(:latest)\\b/:$IMAGE_TAG/g" "$f" || true
      perl -pi -e "s|(your-docker-repo/[^:\\s]+):[^\\s\"']+|\\1:$IMAGE_TAG|g" "$f" || true
      perl -pi -e "s|(docker.io/predator-analytics/[^:\\s]+):[^\\s\"']+|\\1:$IMAGE_TAG|g" "$f" || true
    fi
  done
fi

# show diff in dry-run
if [ "$DRY_RUN" != "0" ]; then
  echo "[gitops_sync] DRY_RUN enabled — showing git diff (unstaged)"
  git --no-pager diff || true
  popd >/dev/null
  echo "[gitops_sync] done (dry-run)"
  exit 0
fi

git add -A
git commit -m "auto: bump image tag to $IMAGE_TAG" || true

# push commit when creds available
if git push origin main; then
  echo "[gitops_sync] pushed changes to origin/main"
else
  echo "[gitops_sync] git push failed (credentials?)" >&2
  popd >/dev/null
  exit 3
fi
popd >/dev/null

# Optionally trigger ArgoCD sync if argocd CLI and token present
if command -v argocd >/dev/null 2>&1 && [ -n "${ARGO_AUTH_TOKEN:-}" ]; then
  echo "[gitops_sync] argocd sync"
  argocd login "${ARGO_SERVER:-}" --auth-token "${ARGO_AUTH_TOKEN}" --insecure || true
  argocd app sync predator || true
fi

echo "[gitops_sync] done"
