#!/usr/bin/env bash
set -euo pipefail
MANIF_REPO="${MANIFESTS_REPO:-../predator-manifests}"
IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"

if [ ! -d "$MANIF_REPO" ]; then
  echo "[gitops_sync] manifests repo not found at $MANIF_REPO" >&2
  exit 2
fi

pushd "$MANIF_REPO" >/dev/null
if ! command -v yq >/dev/null 2>&1; then
  echo "[gitops_sync] yq not found - please install yq to edit YAMLs" >&2
else
  echo "[gitops_sync] bumping image tag to $IMAGE_TAG"
  yq -i ".image.tag = \"$IMAGE_TAG\"" charts/predator/values.yaml || true
fi

git add -A
git commit -S -m "auto: bump image tag to $IMAGE_TAG" || true

# push signed commit when creds available
git push origin main || { echo "[gitops_sync] git push failed (credentials?)" >&2; popd >/dev/null; exit 3; }
popd >/dev/null

# Optionally trigger ArgoCD sync if argocd CLI and token present
if command -v argocd >/dev/null 2>&1 && [ -n "${ARGO_AUTH_TOKEN:-}" ]; then
  echo "[gitops_sync] argocd sync"
  argocd login "${ARGO_SERVER:-}" --auth-token "${ARGO_AUTH_TOKEN}" --insecure || true
  argocd app sync predator || true
fi

echo "[gitops_sync] done"
