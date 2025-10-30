#!/usr/bin/env bash
# ArgoCD Quick Setup Script

set -Eeuo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              🚀 ARGOCD QUICK SETUP FOR PREDATOR12             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ kubectl found${NC}"

if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ helm not found. Please install helm first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ helm found${NC}"

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    echo "Please ensure your cluster is running (e.g., minikube start)"
    exit 1
fi
echo -e "${GREEN}✅ Kubernetes cluster connected${NC}"

echo ""
echo -e "${BLUE}🔧 Installing ArgoCD...${NC}"

# Create namespace
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo -e "${GREEN}✅ ArgoCD installed${NC}"

# Wait for ArgoCD to be ready
echo -e "${BLUE}⏳ Waiting for ArgoCD to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

echo -e "${GREEN}✅ ArgoCD is ready${NC}"

# Get admin password
echo ""
echo -e "${BLUE}🔑 Retrieving admin password...${NC}"
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

echo -e "${GREEN}✅ Admin password retrieved${NC}"

# Setup port-forward in background
echo ""
echo -e "${BLUE}🌐 Setting up port-forward...${NC}"
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &
PORT_FORWARD_PID=$!

sleep 3

echo -e "${GREEN}✅ Port-forward started (PID: $PORT_FORWARD_PID)${NC}"

# Install ArgoCD CLI (optional)
echo ""
echo -e "${BLUE}💿 Installing ArgoCD CLI...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v brew &> /dev/null; then
        brew install argocd
        echo -e "${GREEN}✅ ArgoCD CLI installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Homebrew not found. Please install ArgoCD CLI manually:${NC}"
        echo "   brew install argocd"
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
    chmod +x /usr/local/bin/argocd
    echo -e "${GREEN}✅ ArgoCD CLI installed${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 ArgoCD Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 ArgoCD Credentials:${NC}"
echo "   URL:      https://localhost:8080"
echo "   Username: admin"
echo "   Password: $ARGOCD_PASSWORD"
echo ""
echo -e "${YELLOW}🔗 Quick Commands:${NC}"
echo "   # Open ArgoCD UI"
echo "   open https://localhost:8080"
echo ""
echo "   # Login via CLI"
echo "   argocd login localhost:8080 --username admin --password '$ARGOCD_PASSWORD' --insecure"
echo ""
echo "   # Add repository"
echo "   argocd repo add https://github.com/your-org/predator12.git"
echo ""
echo "   # Stop port-forward"
echo "   kill $PORT_FORWARD_PID"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo "   1. Create Helm charts (see GITOPS_ARGO_HELM.md)"
echo "   2. Apply ArgoCD Applications (kubectl apply -f argo/)"
echo "   3. Start developing with GitOps workflow!"
echo ""
echo -e "${GREEN}✨ Happy GitOps! 🚀${NC}"
