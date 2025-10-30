#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT_DIR/gitops_sync.sh"
TMP_DIR="/tmp/test-manifests"
LOGDIR="/tmp/gitops_sync_test_logs"
mkdir -p "$LOGDIR"

echo "=== TEST: bootstrap DRY_RUN ==="
rm -rf "$TMP_DIR" && mkdir -p "$TMP_DIR"
MANIF_REPO="$TMP_DIR" DRY_RUN=1 IMAGE_TAG=bootstrap-test "$SCRIPT" | tee "$LOGDIR/test-bootstrap.log"

echo
echo "=== TEST: MCP low DRY_RUN ==="
rm -rf "$TMP_DIR" && mkdir -p "$TMP_DIR/helm/predator-rendered"
cat > "$TMP_DIR/helm/predator-rendered/app.yaml" <<'YAML'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: predator-analytics
spec:
  template:
    spec:
      containers:
        - name: app
          image: docker.io/predator-analytics/service:latest
YAML
MANIF_REPO="$TMP_DIR" MCP_ANALYZE_CMD="bash -c 'echo risk=low'" DRY_RUN=1 IMAGE_TAG=low-001 "$SCRIPT" | tee "$LOGDIR/test-low.log"

echo
echo "=== TEST: MCP high DRY_RUN ==="
MANIF_REPO="$TMP_DIR" MCP_ANALYZE_CMD="bash -c 'echo risk=high'" DRY_RUN=1 IMAGE_TAG=high-999 "$SCRIPT" | tee "$LOGDIR/test-high.log"

echo
echo "Logs written to: $LOGDIR"
ls -l "$LOGDIR"
