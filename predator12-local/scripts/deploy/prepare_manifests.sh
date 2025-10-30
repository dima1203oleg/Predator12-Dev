#!/usr/bin/env bash
set -euo pipefail

# prepare_manifests.sh
# Substitute image placeholder in kustomize overlays and output to ./manifests-ready

IMAGE=${1:-}
if [ -z "$IMAGE" ]; then
  echo "Usage: $0 <image:tag>" >&2
  exit 2
fi

OUT_DIR="manifests-ready"
rm -rf "$OUT_DIR" && mkdir -p "$OUT_DIR"

echo "Preparing manifests with image=$IMAGE"

cp -r k8s/overlays/prod "$OUT_DIR/"

# Replace placeholder in all yaml files under the output overlay
find "$OUT_DIR/prod" -type f -name "*.yaml" -o -name "*.yml" | while read -r f; do
  sed -i.bak "s|REPLACE_IMAGE|$IMAGE|g" "$f" || true
  rm -f "$f.bak" || true
done

echo "Manifests prepared at $OUT_DIR/prod"
