#!/usr/bin/env bash
set -euo pipefail
CHART_DIR="./helm/predator-umbrella"
OUTPUT="./rendered.yaml"
VALUES="${1:-./helm/predator-umbrella/prod.yaml}"

echo "[render_and_sync] CHART_DIR=${CHART_DIR} VALUES=${VALUES}"

if [ -d "${CHART_DIR}" ]; then
  if command -v helm >/dev/null 2>&1; then
    helm dependency update "${CHART_DIR}" || true
    rm -rf ./rendered || true
    helm template predator "${CHART_DIR}" --values "${VALUES}" --output-dir ./rendered || :
    # merge rendered manifests
    find ./rendered -name '*.yaml' -exec cat {} \; > "${OUTPUT}" || true
    echo "[render_and_sync] rendered -> ${OUTPUT}"
  else
    echo "helm not installed — cannot render"
    exit 0
  fi
else
  echo "Chart dir ${CHART_DIR} not found"
  exit 0
fi
