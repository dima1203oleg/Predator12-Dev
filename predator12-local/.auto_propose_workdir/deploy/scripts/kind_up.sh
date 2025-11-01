#!/usr/bin/env bash
set -euo pipefail

# Create a local kind cluster suitable for Predator11 monitoring stack

CLUSTER_NAME=${CLUSTER_NAME:-predator11}
K8S_VERSION=${K8S_VERSION:-v1.29.4}

cat > kind-config.yaml <<'YAML'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  image: kindest/node:v1.29.4
  kubeadmConfigPatches:
  - |
    kind: ClusterConfiguration
    apiServer:
      extraArgs:
        "service-node-port-range": "80-32767"
  extraPortMappings:
  - containerPort: 30000
    hostPort: 30000
    protocol: TCP
  - containerPort: 30001
    hostPort: 30001
    protocol: TCP
- role: worker
  image: kindest/node:v1.29.4
- role: worker
  image: kindest/node:v1.29.4
YAML

if ! command -v kind >/dev/null 2>&1; then
  echo "kind not found. Please install kind: https://kind.sigs.k8s.io/" >&2
  exit 1
fi

kind create cluster --name "$CLUSTER_NAME" --image "kindest/node:${K8S_VERSION#v}" --config kind-config.yaml

# Create monitoring namespace
kubectl create namespace monitoring || true

# Label namespace for monitoring
kubectl label namespace monitoring name=monitoring --overwrite

echo "Kind cluster '$CLUSTER_NAME' is ready."
