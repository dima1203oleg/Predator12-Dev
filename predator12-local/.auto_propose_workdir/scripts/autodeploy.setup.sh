#!/usr/bin/env bash
set -euo pipefail

echo "[setup] Start Predator Autodeploy local bootstrap"

command -v kubectl >/dev/null 2>&1 || { echo "kubectl required"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "helm required"; exit 1; }
command -v argocd >/dev/null 2>&1 || echo "Please install argocd CLI: https://argo-cd.readthedocs.io"

echo "[setup] adding helm repos"
helm repo add argo https://argoproj.github.io/argo-helm || true
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo update

echo "[setup] install argocd (namespace: argocd)"
kubectl create ns argocd || true
helm upgrade --install argocd argo/argo-cd -n argocd --wait

echo "[setup] install prometheus (namespace: monitoring)"
kubectl create ns monitoring || true
helm upgrade --install prometheus prometheus-community/prometheus -n monitoring --wait

echo "[setup] install argo-rollouts"
helm upgrade --install argo-rollouts argo/argo-rollouts -n argocd --wait

echo "[setup] Please ensure Trivy and Cosign are installed locally or in CI runners"
if ! command -v trivy >/dev/null 2>&1; then
  echo "Trivy not found — install: https://aquasecurity.github.io/trivy/"
fi
if ! command -v cosign >/dev/null 2>&1; then
  echo "Cosign not found — install: https://github.com/sigstore/cosign"
fi

echo "[setup] Done. Configure GH_TOKEN and ARGO_AUTH_TOKEN in CI/secrets."
