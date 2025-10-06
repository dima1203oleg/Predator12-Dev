# Predator12 GitOps/ArgoCD - Quick Start Guide

**Get production-grade GitOps running in 5 minutes**

## 🎯 What You Get

A complete, production-ready GitOps stack with:
- ArgoCD for declarative deployments
- Argo Rollouts for progressive delivery
- Sealed Secrets for secure secret management
- OPA/Gatekeeper for policy enforcement
- Full monitoring and observability
- Multi-environment support (dev/staging/prod)

## ⚡ Quick Start

### 1. Install Prerequisites

```bash
# macOS
brew install kubectl helm kustomize kubeseal argocd

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
# ... (install other tools)

# Verify
kubectl version --client
helm version
```

### 2. Deploy ArgoCD Stack

```bash
# Clone repo
git clone https://github.com/predator12-org/predator12-local.git
cd predator12-local

# One-command deployment
./scripts/deploy-argocd-full-stack.sh dev

# Wait ~2-3 minutes for all components to start
```

### 3. Access ArgoCD

```bash
# Get admin password
export ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d)

echo "Password: $ARGOCD_PASSWORD"

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open browser
open https://localhost:8080
# Login: admin / $ARGOCD_PASSWORD
```

### 4. Verify Installation

```bash
# Run acceptance tests
python3 scripts/test-argocd-acceptance.py

# Check components
kubectl get pods -n argocd
kubectl get application -n argocd

# Check ApplicationSets
kubectl get applicationset -n argocd
```

## 🎮 Try It Out

### Deploy Your First Application

```bash
# Sync a dev application
argocd app sync predator12-dev-backend

# Watch deployment
kubectl get pods -n predator12-dev -w

# Check health
argocd app get predator12-dev-backend
```

### Test Progressive Delivery

```bash
# Create a rollout
kubectl argo rollouts get rollout predator12-backend -n predator12-prod

# Promote canary
kubectl argo rollouts promote rollout predator12-backend -n predator12-prod

# Abort if needed
kubectl argo rollouts abort rollout predator12-backend -n predator12-prod
```

### Manage Secrets

```bash
# Setup sealed secrets
./scripts/setup-sealed-secrets.sh

# Create and seal a secret
echo -n "mysecret" | kubectl create secret generic my-secret \
  --dry-run=client --from-file=password=/dev/stdin -o yaml | \
  kubeseal -o yaml > infra/secrets/sealed/my-secret.yaml

# Commit to Git
git add infra/secrets/sealed/my-secret.yaml
git commit -m "Add sealed secret"
```

## 📚 Next Steps

1. **Configure Repository**: Add your Git repo to ArgoCD
2. **Set Up Notifications**: Configure Slack/GitHub webhooks
3. **Deploy Applications**: Use ApplicationSets for multi-env
4. **Enable Monitoring**: Connect Prometheus/Grafana
5. **Review Policies**: Customize OPA/Gatekeeper rules

## 📖 Documentation

- [Complete ArgoCD Guide](docs/ARGOCD_COMPLETE_GUIDE.md)
- [Deployment Runbook](docs/RUNBOOK_deployment.md)
- [Self-Improving Stack](docs/SELF_IMPROVING_STACK.md)

## 🔧 Troubleshooting

### ArgoCD UI Not Loading

```bash
# Check pods
kubectl get pods -n argocd

# Check service
kubectl get svc argocd-server -n argocd

# Restart port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Applications Not Syncing

```bash
# Check sync status
argocd app get <app-name>

# Force refresh
argocd app get <app-name> --refresh

# Manual sync
argocd app sync <app-name>
```

### Secrets Not Working

```bash
# Check sealed secrets controller
kubectl logs -n kube-system deployment/sealed-secrets-controller

# Verify secret created
kubectl get secret -n <namespace> <secret-name>
```

## 🎓 Learn More

- [ArgoCD Docs](https://argo-cd.readthedocs.io/)
- [Argo Rollouts Docs](https://argoproj.github.io/argo-rollouts/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [Gatekeeper](https://open-policy-agent.github.io/gatekeeper/)

---

**Questions?** Open an issue or join #predator12-deployments on Slack
