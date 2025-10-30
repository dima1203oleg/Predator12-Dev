#!/usr/bin/env bash
set -euo pipefail
IMAGE="${IMAGE:-predator/app:dev}"
echo "[ci_local] build image: $IMAGE"
if command -v docker >/dev/null 2>&1; then
  docker buildx build . -t "$IMAGE" --load
else
  echo "[ci_local] warning: docker not found, skipping build" >&2
fi

echo "[ci_local] run tests"
pytest -q || { echo "[ci_local] tests failed" >&2; exit 2; }

if command -v trivy >/dev/null 2>&1; then
  echo "[ci_local] trivy scan"
  trivy image --exit-code 1 --severity CRITICAL,HIGH "$IMAGE" || { echo "[ci_local] trivy detected critical issues" >&2; exit 3; }
else
  echo "[ci_local] trivy not installed, skipping scan" >&2
fi

echo "[ci_local] done"
