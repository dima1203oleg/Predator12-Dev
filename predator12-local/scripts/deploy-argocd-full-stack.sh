#!/bin/bash
set -euo pipefail

# Predator12 Complete GitOps/ArgoCD Deployment Script
# This script deploys the full production-grade ArgoCD stack

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
NAMESPACE="argocd"
ENVIRONMENT="${1:-dev}"  # dev, staging, or prod

# Functions

print_header() {
    echo -e "\n${BOLD}${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${BLUE}║${NC}  ${BOLD}Predator12 GitOps/ArgoCD Full Stack Deployment${NC}          ${BOLD}${BLUE}║${NC}"
    echo -e "${BOLD}${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "\n${BOLD}${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_tools=()
    
    for tool in kubectl helm kustomize kubeseal argocd; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=($tool)
        else
            print_success "$tool is installed"
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing tools: ${missing_tools[*]}"
        echo -e "\nInstall missing tools:"
        echo "  brew install kubectl helm kustomize kubeseal argocd"
        exit 1
    fi
    
    # Check Kubernetes connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

create_namespaces() {
    print_step "Creating namespaces..."
    
    local namespaces=(
        "argocd"
        "argo-rollouts"
        "predator12-dev"
        "predator12-staging"
        "predator12-prod"
        "monitoring"
        "observability"
    )
    
    for ns in "${namespaces[@]}"; do
        if kubectl get namespace "$ns" &> /dev/null; then
            print_warning "Namespace $ns already exists"
        else
            kubectl create namespace "$ns"
            print_success "Created namespace: $ns"
        fi
    done
}

install_argocd() {
    print_step "Installing ArgoCD..."
    
    cd "$PROJECT_ROOT"
    
    if kubectl get deployment argocd-server -n argocd &> /dev/null; then
        print_warning "ArgoCD already installed"
    else
        # Apply kustomize overlay for environment
        kubectl apply -k "infra/argocd/overlays/$ENVIRONMENT"
        print_success "ArgoCD installed"
    fi
    
    # Wait for ArgoCD to be ready
    echo "Waiting for ArgoCD to be ready..."
    kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
    print_success "ArgoCD is ready"
}

install_argo_rollouts() {
    print_step "Installing Argo Rollouts..."
    
    if kubectl get deployment argo-rollouts -n argo-rollouts &> /dev/null; then
        print_warning "Argo Rollouts already installed"
    else
        kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
        print_success "Argo Rollouts installed"
    fi
    
    echo "Waiting for Argo Rollouts to be ready..."
    kubectl wait --for=condition=Ready pods --all -n argo-rollouts --timeout=300s
    print_success "Argo Rollouts is ready"
}

install_sealed_secrets() {
    print_step "Installing Sealed Secrets..."
    
    if kubectl get deployment sealed-secrets-controller -n kube-system &> /dev/null; then
        print_warning "Sealed Secrets already installed"
    else
        helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
        helm repo update
        
        helm install sealed-secrets sealed-secrets/sealed-secrets \
            --namespace kube-system \
            --set-string fullnameOverride=sealed-secrets-controller
        
        print_success "Sealed Secrets installed"
    fi
    
    echo "Waiting for Sealed Secrets to be ready..."
    kubectl wait --for=condition=Ready pods -l name=sealed-secrets-controller -n kube-system --timeout=300s
    print_success "Sealed Secrets is ready"
    
    # Setup sealed secrets
    if [ -f "$PROJECT_ROOT/scripts/setup-sealed-secrets.sh" ]; then
        bash "$PROJECT_ROOT/scripts/setup-sealed-secrets.sh"
    fi
}

install_gatekeeper() {
    print_step "Installing Gatekeeper (OPA)..."
    
    if kubectl get namespace gatekeeper-system &> /dev/null; then
        print_warning "Gatekeeper already installed"
    else
        kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml
        print_success "Gatekeeper installed"
    fi
    
    echo "Waiting for Gatekeeper to be ready..."
    kubectl wait --for=condition=Ready pods --all -n gatekeeper-system --timeout=300s
    print_success "Gatekeeper is ready"
    
    # Apply policies
    if [ -f "$PROJECT_ROOT/infra/policy/gatekeeper-policies.yaml" ]; then
        echo "Applying Gatekeeper policies..."
        kubectl apply -f "$PROJECT_ROOT/infra/policy/gatekeeper-policies.yaml"
        print_success "Gatekeeper policies applied"
    fi
}

configure_argocd() {
    print_step "Configuring ArgoCD..."
    
    # Get admin password
    ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret \
        -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "")
    
    if [ -z "$ARGOCD_PASSWORD" ]; then
        print_error "Could not retrieve ArgoCD admin password"
        return 1
    fi
    
    # Port forward in background
    kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
    PF_PID=$!
    sleep 5
    
    # Login to ArgoCD
    argocd login localhost:8080 \
        --username admin \
        --password "$ARGOCD_PASSWORD" \
        --insecure
    
    print_success "Logged in to ArgoCD"
    
    # Change admin password (optional)
    # argocd account update-password --current-password "$ARGOCD_PASSWORD" --new-password <new-password>
    
    # Kill port-forward
    kill $PF_PID 2>/dev/null || true
    
    print_success "ArgoCD configured"
}

deploy_applicationsets() {
    print_step "Deploying ApplicationSets..."
    
    cd "$PROJECT_ROOT"
    
    # Apply ApplicationSet and AppProject
    kubectl apply -f infra/argocd/base/applicationset.yaml
    kubectl apply -f infra/argocd/base/app-project.yaml
    
    print_success "ApplicationSets deployed"
    
    # Wait for applications to be created
    echo "Waiting for applications to be generated..."
    sleep 10
    
    # List generated applications
    kubectl get application -n argocd -l managed-by=applicationset
    
    print_success "Applications generated"
}

deploy_monitoring() {
    print_step "Deploying monitoring components..."
    
    cd "$PROJECT_ROOT"
    
    # Apply ServiceMonitors
    if [ -f "infra/argocd/base/servicemonitor.yaml" ]; then
        kubectl apply -f infra/argocd/base/servicemonitor.yaml
        print_success "ServiceMonitors applied"
    fi
    
    # Apply PrometheusRules
    if [ -f "infra/argocd/base/prometheusrule.yaml" ]; then
        kubectl apply -f infra/argocd/base/prometheusrule.yaml
        print_success "PrometheusRules applied"
    fi
}

run_acceptance_tests() {
    print_step "Running acceptance tests..."
    
    cd "$PROJECT_ROOT"
    
    if [ -f "scripts/test-argocd-acceptance.py" ]; then
        python3 scripts/test-argocd-acceptance.py
    else
        print_warning "Acceptance test script not found"
    fi
}

print_access_info() {
    print_step "Access Information"
    
    ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret \
        -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo "")
    
    echo -e "\n${BOLD}ArgoCD Web UI:${NC}"
    echo "  URL: https://localhost:8080"
    echo "  Username: admin"
    echo "  Password: $ARGOCD_PASSWORD"
    echo ""
    echo "  Port forward command:"
    echo "  ${BLUE}kubectl port-forward svc/argocd-server -n argocd 8080:443${NC}"
    echo ""
    
    echo -e "${BOLD}ArgoCD CLI:${NC}"
    echo "  Login command:"
    echo "  ${BLUE}argocd login localhost:8080${NC}"
    echo ""
    
    echo -e "${BOLD}Argo Rollouts Dashboard:${NC}"
    echo "  ${BLUE}kubectl argo rollouts dashboard${NC}"
    echo ""
    
    echo -e "${BOLD}Useful Commands:${NC}"
    echo "  List applications:"
    echo "  ${BLUE}kubectl get application -n argocd${NC}"
    echo ""
    echo "  Sync application:"
    echo "  ${BLUE}argocd app sync <app-name>${NC}"
    echo ""
    echo "  View application:"
    echo "  ${BLUE}argocd app get <app-name>${NC}"
    echo ""
}

print_next_steps() {
    print_step "Next Steps"
    
    echo ""
    echo "1. Access ArgoCD UI and explore the applications"
    echo "2. Review the ApplicationSets and generated applications"
    echo "3. Configure repository credentials if needed"
    echo "4. Set up notifications (Slack, GitHub, etc.)"
    echo "5. Deploy your first application using ArgoCD"
    echo ""
    echo "📚 Documentation:"
    echo "  - ArgoCD Guide:    docs/ARGOCD_COMPLETE_GUIDE.md"
    echo "  - Deployment Runbook: docs/RUNBOOK_deployment.md"
    echo "  - Self-Improving Stack: docs/SELF_IMPROVING_STACK.md"
    echo ""
}

main() {
    print_header
    
    echo "Environment: ${BOLD}$ENVIRONMENT${NC}"
    echo "Project Root: $PROJECT_ROOT"
    echo ""
    
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
    
    check_prerequisites
    create_namespaces
    install_argocd
    install_argo_rollouts
    install_sealed_secrets
    install_gatekeeper
    configure_argocd
    deploy_applicationsets
    deploy_monitoring
    
    print_success "Deployment completed successfully!"
    
    print_access_info
    print_next_steps
    
    # Run acceptance tests
    read -p "Run acceptance tests now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_acceptance_tests
    fi
    
    echo -e "\n${GREEN}${BOLD}🎉 Predator12 GitOps/ArgoCD stack is ready!${NC}\n"
}

# Trap errors
trap 'print_error "Deployment failed at line $LINENO"' ERR

# Run main
main "$@"
