#!/bin/bash

# ============================================================================
#                    PREDATOR11 PRODUCTION DEPLOYMENT SCRIPT
#           Automated deployment script for RKE2 Kubernetes cluster
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="predator11-prod"
NAMESPACE="predator11"
HELM_CHART_PATH="./k8s/helm/predator11"
VALUES_FILE="./k8s/helm/predator11/values.yaml"
ARGOCD_NAMESPACE="argocd"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed or not in PATH"
        exit 1
    fi
}

# Function to wait for deployment to be ready
wait_for_deployment() {
    local namespace=$1
    local deployment=$2
    local timeout=${3:-300}

    print_status "Waiting for deployment $deployment in namespace $namespace to be ready..."

    if kubectl wait --for=condition=available --timeout=${timeout}s deployment/$deployment -n $namespace; then
        print_success "Deployment $deployment is ready"
    else
        print_error "Deployment $deployment failed to become ready within ${timeout}s"
        return 1
    fi
}

# Function to install RKE2 cluster
install_rke2_cluster() {
    print_status "Setting up RKE2 Kubernetes cluster..."

    # Check if RKE2 is already installed
    if systemctl is-active --quiet rke2-server 2>/dev/null; then
        print_warning "RKE2 server is already running"
        return 0
    fi

    # Install RKE2
    curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="server" sh -

    # Create RKE2 config directory
    sudo mkdir -p /etc/rancher/rke2

    # Create RKE2 config file
    sudo tee /etc/rancher/rke2/config.yaml > /dev/null <<EOF
# RKE2 Server Configuration for Predator11
write-kubeconfig-mode: "0644"
tls-san:
  - "predator11-api.local"
  - "localhost"
  - "127.0.0.1"

# Cluster configuration
cluster-name: ${CLUSTER_NAME}

# Security hardening
profile: "cis-1.6"
selinux: true
secrets-encryption: true

# Networking
cluster-cidr: "10.42.0.0/16"
service-cidr: "10.43.0.0/16"
cluster-dns: "10.43.0.10"

# Data directory
data-dir: "/var/lib/rancher/rke2"

# Node labels and taints
node-label:
  - "predator11.com/node-type=control-plane"
  - "predator11.com/environment=production"

# Disable unnecessary components
disable:
  - rke2-snapshot-controller
  - rke2-snapshot-controller-crd
  - rke2-snapshot-validation-webhook

# Enable audit logging
audit-policy-file: "/etc/rancher/rke2/audit-policy.yaml"
audit-log-path: "/var/lib/rancher/rke2/logs/audit.log"
audit-log-maxage: 30
audit-log-maxbackup: 10
audit-log-maxsize: 100

# Kubelet configuration
kubelet-arg:
  - "max-pods=110"
  - "cluster-dns=10.43.0.10"
  - "cluster-domain=cluster.local"
  - "resolv-conf=/run/systemd/resolve/resolv.conf"

# Kube-apiserver configuration
kube-apiserver-arg:
  - "default-not-ready-toleration-seconds=300"
  - "default-unreachable-toleration-seconds=300"
  - "max-mutating-requests-inflight=400"
  - "max-requests-inflight=800"
  - "request-timeout=60s"

# Controller manager configuration
kube-controller-manager-arg:
  - "bind-address=0.0.0.0"
  - "secure-port=10257"
  - "node-monitor-period=5s"
  - "node-monitor-grace-period=40s"
  - "pod-eviction-timeout=5m0s"

# Scheduler configuration
kube-scheduler-arg:
  - "bind-address=0.0.0.0"
  - "secure-port=10259"
EOF

    # Create audit policy
    sudo tee /etc/rancher/rke2/audit-policy.yaml > /dev/null <<EOF
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  # Log admin activities
  - level: RequestResponse
    namespaces: ["predator11", "predator11-monitoring", "predator11-security"]
    verbs: ["create", "update", "patch", "delete"]
    resources:
    - group: ""
      resources: ["secrets", "configmaps"]
    - group: "apps"
      resources: ["deployments", "statefulsets"]

  # Log authentication and authorization
  - level: Metadata
    verbs: ["create", "update", "patch", "delete"]
    resources:
    - group: "rbac.authorization.k8s.io"
      resources: ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]

  # Log access to sensitive resources
  - level: Request
    verbs: ["get", "list", "watch"]
    resources:
    - group: ""
      resources: ["secrets"]
EOF

    # Enable and start RKE2
    sudo systemctl enable rke2-server.service
    sudo systemctl start rke2-server.service

    # Wait for RKE2 to be ready
    print_status "Waiting for RKE2 to be ready..."
    sleep 30

    # Set up kubectl access
    export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
    sudo chmod 644 /etc/rancher/rke2/rke2.yaml

    print_success "RKE2 cluster installed and configured"
}

# Function to install essential cluster components
install_cluster_components() {
    print_status "Installing essential cluster components..."

    # Install cert-manager
    print_status "Installing cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
    wait_for_deployment cert-manager cert-manager
    wait_for_deployment cert-manager cert-manager-cainjector
    wait_for_deployment cert-manager cert-manager-webhook

    # Install NGINX Ingress Controller
    print_status "Installing NGINX Ingress Controller..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
    wait_for_deployment ingress-nginx ingress-nginx-controller

    # Install ArgoCD
    print_status "Installing ArgoCD..."
    kubectl create namespace $ARGOCD_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    kubectl apply -n $ARGOCD_NAMESPACE -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    wait_for_deployment $ARGOCD_NAMESPACE argocd-server

    # Install Prometheus Operator
    print_status "Installing Prometheus Operator..."
    kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

    print_success "Essential cluster components installed"
}

# Function to setup security components
setup_security() {
    print_status "Setting up security components..."

    # Create security namespace
    kubectl create namespace predator11-security --dry-run=client -o yaml | kubectl apply -f -

    # Apply Vault configuration
    kubectl apply -f k8s/security/vault-config.yaml

    # Install HashiCorp Vault
    helm repo add hashicorp https://helm.releases.hashicorp.com
    helm repo update

    helm upgrade --install vault hashicorp/vault \
        --namespace predator11-security \
        --set="server.ha.enabled=true" \
        --set="server.ha.replicas=3" \
        --set="server.dataStorage.storageClass=rke2-csi-cinder-sc" \
        --set="server.auditStorage.enabled=true" \
        --wait

    print_success "Security components configured"
}

# Function to deploy Predator11 application
deploy_predator11() {
    print_status "Deploying Predator11 application..."

    # Create application namespace
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

    # Apply namespace configurations
    kubectl apply -f k8s/namespace.yaml

    # Install Helm chart dependencies
    helm dependency update $HELM_CHART_PATH

    # Deploy Predator11
    helm upgrade --install predator11 $HELM_CHART_PATH \
        --namespace $NAMESPACE \
        --values $VALUES_FILE \
        --wait \
        --timeout=15m

    # Apply ArgoCD applications
    kubectl apply -f argocd/predator11-applications.yaml

    print_success "Predator11 application deployed"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Check all pods are running
    kubectl get pods -n $NAMESPACE
    kubectl get pods -n predator11-monitoring
    kubectl get pods -n predator11-security

    # Check services
    kubectl get services -n $NAMESPACE

    # Check ingress
    kubectl get ingress -n $NAMESPACE

    # Run basic health checks
    print_status "Running health checks..."

    # Wait for all deployments to be ready
    for deployment in $(kubectl get deployments -n $NAMESPACE -o name); do
        deployment_name=$(echo $deployment | cut -d'/' -f2)
        wait_for_deployment $NAMESPACE $deployment_name
    done

    print_success "Deployment verification completed"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring and observability..."

    # Create monitoring namespace
    kubectl create namespace predator11-monitoring --dry-run=client -o yaml | kubectl apply -f -

    # Add Prometheus Helm repository
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update

    # Install Prometheus stack
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace predator11-monitoring \
        --set="prometheus.prometheusSpec.retention=30d" \
        --set="prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.storageClassName=rke2-csi-cinder-sc" \
        --set="prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi" \
        --set="grafana.persistence.enabled=true" \
        --set="grafana.persistence.storageClassName=rke2-csi-cinder-sc" \
        --set="grafana.persistence.size=10Gi" \
        --wait

    print_success "Monitoring setup completed"
}

# Main deployment function
main() {
    print_status "Starting Predator11 production deployment..."

    # Check prerequisites
    print_status "Checking prerequisites..."
    check_command "curl"
    check_command "kubectl"
    check_command "helm"

    # Deployment steps
    install_rke2_cluster
    install_cluster_components
    setup_security
    setup_monitoring
    deploy_predator11
    verify_deployment

    print_success "Predator11 production deployment completed successfully!"

    # Display access information
    echo
    print_status "Access Information:"
    echo "  - Application: https://app.predator11.com"
    echo "  - API: https://api.predator11.com"
    echo "  - Monitoring: https://monitoring.predator11.com"
    echo "  - Logs: https://logs.predator11.com"
    echo "  - Authentication: https://auth.predator11.com"
    echo
    print_status "ArgoCD Admin Password:"
    kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
    echo
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "verify")
        verify_deployment
        ;;
    "monitoring")
        setup_monitoring
        ;;
    "security")
        setup_security
        ;;
    *)
        echo "Usage: $0 {deploy|verify|monitoring|security}"
        exit 1
        ;;
esac
