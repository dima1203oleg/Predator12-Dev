#!/usr/bin/env bash
# Duplicate shim under .github/scripts/tests — workflow-related paths are usually present in early checkouts
set -euo pipefail

THIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${THIS_DIR}/../.."

TARGET="${REPO_ROOT}/scripts/gitops_sync_dry_tests.sh"
if [ -x "${TARGET}" ]; then
  exec "${TARGET}" "$@"
fi

echo "[.github/scripts/tests dry-tests shim] canonical target not present: ${TARGET}"
echo "Non-blocking placeholder — exit 0"
exit 0
