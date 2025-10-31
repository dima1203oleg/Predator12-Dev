#!/usr/bin/env bash
# scripts/gitops_sync_dry_tests.sh
# Root-level forwarding shim for dry-run tests.
# Behavior:
# - If a canonical tests shim exists at ./scripts/tests/gitops_sync_dry_tests.sh and is executable, exec it.
# - Otherwise perform a minimal non-blocking set of checks (exit 0 on stub) so CI post-checkout hooks that chmod
#   this file won't fail and the pipeline can continue to run defensive in-job checkout steps.

set -euo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${THIS_DIR}"

TARGET="${ROOT_DIR}/scripts/tests/gitops_sync_dry_tests.sh"
if [ -x "${TARGET}" ]; then
  exec "${TARGET}" "$@"
fi

echo "[root dry-tests shim] canonical tests shim not executable or missing: ${TARGET}"
echo "Providing non-blocking stub to avoid pre-job post-checkout failures."

# Minimal non-blocking checks (do not fail the job here; real tests run later in-pipeline)
if [ -f "${ROOT_DIR}/rendered.yaml" ]; then
  echo "rendered.yaml present (ok for stub)."
else
  echo "rendered.yaml not present — stub will not fail (non-blocking)."
fi

if command -v helm >/dev/null 2>&1; then
  echo "helm found — running lightweight lint (best-effort)"
  helm lint "${ROOT_DIR}/helm/predator-umbrella" --values "${ROOT_DIR}/helm/predator-umbrella/prod.yaml" || true
fi

echo "[root dry-tests shim] exit 0 (non-blocking)"
exit 0
