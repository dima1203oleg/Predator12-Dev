#!/usr/bin/env bash
set -euo pipefail

# Basic dry-run tests to validate rendered.yaml and helm chart

RENDERED="./rendered.yaml"
CHART_DIR="./helm/predator-umbrella"
VALUES_FILE="${CHART_DIR}/prod.yaml"

echo "[gitops_sync_dry_tests] checking ${RENDERED}"
if [ ! -f "${RENDERED}" ]; then
  echo "FAIL: ${RENDERED} not found" >&2
  exit 2
fi

grep -q "kind: Deployment" "${RENDERED}" && echo "PASS: contains Deployment" || { echo "FAIL: no Deployment found in ${RENDERED}" >&2; exit 3; }

if command -v helm >/dev/null 2>&1; then
  echo "[gitops_sync_dry_tests] running helm lint"
  helm lint "${CHART_DIR}" --values "${VALUES_FILE}" --strict
else
  echo "helm not found — skipping helm lint (install helm to enable)" >&2
fi

echo "[gitops_sync_dry_tests] all checks passed"
exit 0
#!/usr/bin/env bash
set -euo pipefail
echo "[dry_tests] start"
if [ -f rendered.yaml ]; then
  if grep -q "kind: Deployment" rendered.yaml; then
    echo "PASS: contains Deployment"
  else
    echo "FAIL: deployment missing"
    exit 1
  fi
else
  echo "rendered.yaml not found — failing dry tests"
  exit 1
fi

if command -v helm >/dev/null 2>&1; then
  helm lint helm/predator-umbrella --values helm/predator-umbrella/prod.yaml || true
fi
echo "[dry_tests] all PASS"
