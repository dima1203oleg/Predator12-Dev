#!/usr/bin/env bash
set -euo pipefail

HOST="${1:-localhost}"

pass() { echo "[OK] $1"; }
fail() { echo "[FAIL] $1"; exit 1; }

# MCP server
if curl -fsS "http://${HOST}:3010/ready" >/dev/null; then pass "MCP server ready"; else fail "MCP server not ready"; fi

# Prometheus
if curl -fsS "http://${HOST}:9090/-/healthy" >/dev/null; then pass "Prometheus healthy"; else fail "Prometheus not healthy"; fi

# Keycloak metrics
if curl -fsS "http://${HOST}:8080/metrics" | head -n 1 >/dev/null; then pass "Keycloak metrics exposed"; else echo "[WARN] Keycloak metrics not available"; fi

# MinIO live
if curl -fsS "http://${HOST}:9000/minio/health/live" >/dev/null; then pass "MinIO live"; else echo "[WARN] MinIO not live"; fi

# OpenSearch
if curl -fsS "http://${HOST}:5601/api/status" | grep -q 'overall'; then pass "OpenSearch Dashboards up"; else echo "[WARN] OpenSearch Dashboards not responding"; fi

exit 0
