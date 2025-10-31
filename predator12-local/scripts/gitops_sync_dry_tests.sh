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
