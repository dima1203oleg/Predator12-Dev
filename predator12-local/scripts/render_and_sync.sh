#!/usr/bin/env bash
set -euo pipefail

# Render Helm chart(s) and produce a merged rendered.yaml
# Usage: ./scripts/render_and_sync.sh [values.yaml]

CHART_DIR="./helm/predator-umbrella"
VALUES_FILE="${1:-${CHART_DIR}/prod.yaml}"
OUTPUT="./rendered.yaml"
MANIFESTS_REPO="${MANIFESTS_REPO:-../predator-manifests}"

RUN_ID="run-$(date +%s)-$RANDOM"
echo "[render_and_sync] runId=${RUN_ID} chart_dir=${CHART_DIR} values=${VALUES_FILE} output=${OUTPUT}"

if [ ! -d "${CHART_DIR}" ]; then
  echo "[render_and_sync] chart directory not found: ${CHART_DIR}" >&2
  exit 2
fi

if ! command -v helm >/dev/null 2>&1; then
  echo "helm not found in PATH" >&2
  exit 3
fi

helm dependency update "${CHART_DIR}" || true

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

echo "[render_and_sync] rendering to ${TMP_DIR}"
helm template predator "${CHART_DIR}" --values "${VALUES_FILE}" --output-dir "${TMP_DIR}/rendered" --include-crds || true

# Concatenate all yaml manifests into single rendered.yaml
find "${TMP_DIR}/rendered" -type f -name '*.yaml' -print0 | xargs -0 cat > "${OUTPUT}"

echo "[render_and_sync] rendered -> ${OUTPUT}"

# Append run metadata to manifests repo if available
if [ -d "${MANIFESTS_REPO}" ]; then
  mkdir -p "${MANIFESTS_REPO}/.autodeploy"
  echo "{\"runId\":\"${RUN_ID}\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> "${MANIFESTS_REPO}/.autodeploy/runs.log" || true
  # copy rendered file as artifact inside manifests repo for traceability
  mkdir -p "${MANIFESTS_REPO}/helm/predator-rendered"
  cp -f "${OUTPUT}" "${MANIFESTS_REPO}/helm/predator-rendered/rendered-${RUN_ID}.yaml" || true
fi

echo "[render_and_sync] done runId=${RUN_ID}"
exit 0
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
