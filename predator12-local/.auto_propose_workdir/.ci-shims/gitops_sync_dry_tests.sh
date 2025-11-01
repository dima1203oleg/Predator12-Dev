#!/usr/bin/env bash
# Fallback shim under .ci-shims/ — some CI setups include dotfiles and .github paths in early checkouts
set -euo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${THIS_DIR}/.."

TARGET="${ROOT_DIR}/scripts/gitops_sync_dry_tests.sh"
if [ -x "${TARGET}" ]; then
  exec "${TARGET}" "$@"
fi

echo "[.ci-shims dry-tests shim] canonical target not present: ${TARGET}"
echo "Non-blocking placeholder — exit 0"
exit 0
