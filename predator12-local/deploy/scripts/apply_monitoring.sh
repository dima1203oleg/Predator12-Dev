#!/usr/bin/env bash
set -euo pipefail

# Apply Predator11 monitoring stack (Grafana, Prometheus, dashboards, alerts) and orchestrator
# Namespace: monitoring

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT_DIR"

NAMESPACE=${NAMESPACE:-monitoring}

# Ensure namespace exists
kubectl get ns "$NAMESPACE" >/dev/null 2>&1 || kubectl create namespace "$NAMESPACE"

# Create/update ConfigMaps for dashboards and alerts
kubectl create configmap grafana-dashboards-api \
  --from-file=observability/grafana/dashboards/api_latency_dashboard.json \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap grafana-dashboards-redis \
  --from-file=observability/grafana/dashboards/redis_health_dashboard.json \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap grafana-dashboards-model-router \
  --from-file=observability/grafana/dashboards/model_router_dashboard.json \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap prometheus-http-alerts \
  --from-file=observability/http_alerts.yml \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap prometheus-sdk-alerts \
  --from-file=observability/sdk_alerts.yml \
  -n "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Apply Grafana provisioning and deployment
kubectl apply -n "$NAMESPACE" -f deploy/k8s/grafana_provisioning.yaml
kubectl apply -n "$NAMESPACE" -f deploy/k8s/grafana.yaml
kubectl rollout status deploy/grafana -n "$NAMESPACE"

# Apply Prometheus deployment
kubectl apply -n "$NAMESPACE" -f deploy/k8s/prometheus.yaml
kubectl rollout status deploy/prometheus -n "$NAMESPACE"

# Apply orchestrator resources (in default namespace unless overridden)
ORCH_NAMESPACE=${ORCH_NAMESPACE:-default}
kubectl apply -n "$ORCH_NAMESPACE" -f deploy/k8s/orchestrator_deployment.yaml
kubectl apply -n "$ORCH_NAMESPACE" -f deploy/k8s/orchestrator_hpa.yaml
kubectl rollout restart deploy/predator-orchestrator -n "$ORCH_NAMESPACE"
kubectl rollout status deploy/predator-orchestrator -n "$ORCH_NAMESPACE"

echo "Monitoring stack and orchestrator applied successfully."
