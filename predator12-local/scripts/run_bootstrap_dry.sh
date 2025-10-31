#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="predator-bootstrap:local"
DOCKERFILE_PATH="Dockerfile.bootstrap"

echo "run_bootstrap_dry: IMAGE_TAG=${IMAGE_TAG:-local-test}"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "Docker available -> building image ${IMAGE_NAME}"
  docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" .
  echo "Running container in DRY_RUN"
  docker run --rm -e DRY_RUN=1 -e IMAGE_TAG="${IMAGE_TAG:-local-test}" -v "$(pwd):/work" -w /work "$IMAGE_NAME"
else
  echo "Docker not available or not running -> falling back to local execution"
  DRY_RUN=1 IMAGE_TAG="${IMAGE_TAG:-local-test}" ./scripts/gitops_sync.sh
fi

echo "run_bootstrap_dry: complete"
