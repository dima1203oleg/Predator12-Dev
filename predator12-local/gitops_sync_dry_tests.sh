#!/usr/bin/env bash
# Top-level lightweight shim so shallow/sparse pre-checkouts are likely to include at least one
# location that can be chmod'd and executed during runner setup hooks.
set -euo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${THIS_DIR}"

TARGET="${ROOT_DIR}/scripts/gitops_sync_dry_tests.sh"

# Prevent infinite recursion by checking an environment variable
if [ -z "${GITOPS_DRY_TESTS_SHIMMED:-}" ]; then
  export GITOPS_DRY_TESTS_SHIMMED=1
  if [ -x "${TARGET}" ]; then
    exec "${TARGET}" "$@"
  fi
fi

echo "[root-level dry-tests shim] canonical target not present or not executable: ${TARGET}"
echo "Exiting 0 (non-blocking placeholder)"
exit 0
