#!/usr/bin/env bash
set -euo pipefail

# Port-forward common Predator11 services for local access
# Usage: bash deploy/scripts/port_forward.sh [namespace]

NAMESPACE=${1:-monitoring}

# Kill existing port-forwards (optional)
if pgrep -f "kubectl port-forward svc/grafana" >/dev/null; then
  pkill -f "kubectl port-forward svc/grafana" || true
fi
if pgrep -f "kubectl port-forward svc/prometheus" >/dev/null; then
  pkill -f "kubectl port-forward svc/prometheus" || true
fi
if pgrep -f "kubectl port-forward svc/predator-orchestrator" >/dev/null; then
  pkill -f "kubectl port-forward svc/predator-orchestrator" || true
fi

# Start port-forwards in background
(
  kubectl port-forward svc/grafana -n "$NAMESPACE" 3000:3000
) >/dev/null 2>&1 &

echo "Grafana: http://localhost:3000 (ns=$NAMESPACE)"

(
  kubectl port-forward svc/prometheus -n "$NAMESPACE" 9090:9090
) >/dev/null 2>&1 &

echo "Prometheus: http://localhost:9090 (ns=$NAMESPACE)"

(
  kubectl port-forward svc/predator-orchestrator 8000:8000
) >/dev/null 2>&1 &

echo "Predator Orchestrator API: http://localhost:8000"

echo "Port-forwards started. Press 'pkill -f port-forward' to stop if needed."
