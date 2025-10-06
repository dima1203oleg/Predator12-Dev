# ArgoCD GitOps Complete Guide for Predator12

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Application Management](#application-management)
6. [Progressive Delivery](#progressive-delivery)
7. [Security](#security)
8. [Monitoring & Observability](#monitoring--observability)
9. [Disaster Recovery](#disaster-recovery)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is ArgoCD?

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It:
- Monitors Git repositories for changes
- Automatically syncs desired state to clusters
- Provides drift detection and self-healing
- Supports multiple environments and clusters
- Enables progressive delivery with Argo Rollouts

### Why ArgoCD for Predator12?

- **GitOps Workflow**: All infrastructure as code in Git
- **Multi-Environment**: Separate dev/staging/prod with overlays
- **Progressive Delivery**: Canary deployments with automatic rollback
- **Self-Healing**: Automatic drift correction
- **RBAC**: Role-based access control for teams
- **Audit Trail**: Complete history of all deployments

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                        ArgoCD Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  API Server  │  │ Application  │  │    Repo      │    │
│  │  (UI/CLI)    │  │  Controller  │  │   Server     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │            │
│         └──────────────────┴──────────────────┘            │
│                           │                                │
│                    ┌──────▼──────┐                        │
│                    │    Redis    │                        │
│                    └─────────────┘                        │
│                                                            │
├─────────────────────────────────────────────────────────────┤
│                     ApplicationSets                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  predator12-dev-*     predator12-staging-*    predator12-prod-*│
│  ├─ backend           ├─ backend              ├─ backend   │
│  ├─ frontend          ├─ frontend             ├─ frontend  │
│  ├─ agents            ├─ agents               ├─ agents    │
│  └─ observability     └─ observability        └─ observability│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Repository Structure

```
predator12-local/
├── infra/
│   ├── argocd/
│   │   ├── base/                    # Base ArgoCD config
│   │   │   ├── kustomization.yaml
│   │   │   ├── argocd-cm.yaml
│   │   │   ├── argocd-rbac-cm.yaml
│   │   │   ├── applicationset.yaml
│   │   │   └── app-project.yaml
│   │   ├── overlays/
│   │   │   ├── dev/                 # Dev environment
│   │   │   └── prod/                # Prod environment
│   │   └── hooks/                   # Sync hooks
│   │       ├── presync-db-migrate.yaml
│   │       ├── postsync-tests.yaml
│   │       └── syncfail-cleanup.yaml
│   │
│   ├── argo-rollouts/               # Progressive delivery
│   │   ├── rollout-backend.yaml
│   │   ├── analysis-templates.yaml
│   │   └── services-ingress.yaml
│   │
│   ├── policy/                      # OPA/Gatekeeper
│   │   └── gatekeeper-policies.yaml
│   │
│   └── secrets/                     # Sealed Secrets
│       └── sealed/
│           └── argocd-sealed-secrets.yaml
│
└── helm/                            # Helm charts
    └── predator12-umbrella/
        ├── charts/
        │   ├── api/
        │   ├── frontend/
        │   ├── agents/
        │   └── observability/
        └── values/
            ├── dev.yaml
            ├── staging.yaml
            └── prod.yaml
```

---

## Installation

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3.x
- kubeseal (for Sealed Secrets)

### 1. Install ArgoCD

#### Option A: Quick Install (Dev)

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
```

#### Option B: Production Install with Kustomize

```bash
# Apply dev overlay
kubectl apply -k infra/argocd/overlays/dev

# Or prod overlay
kubectl apply -k infra/argocd/overlays/prod
```

### 2. Access ArgoCD UI

```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

Open: https://localhost:8080
- Username: `admin`
- Password: (from above command)

### 3. Install ArgoCD CLI

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd

# Login
argocd login localhost:8080
```

### 4. Install Argo Rollouts

```bash
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install kubectl plugin
brew install argoproj/tap/kubectl-argo-rollouts
```

### 5. Install Sealed Secrets

```bash
# Install controller
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets \
  --namespace kube-system

# Install kubeseal CLI
brew install kubeseal

# Setup sealed secrets
./scripts/setup-sealed-secrets.sh
```

### 6. Install Gatekeeper

```bash
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml

# Apply policies
kubectl apply -f infra/policy/gatekeeper-policies.yaml
```

---

## Configuration

### RBAC Configuration

ArgoCD RBAC is configured in `argocd-rbac-cm.yaml`:

```yaml
# Example: Developer role
p, role:developer, applications, get, */*, allow
p, role:developer, applications, sync, dev-*, allow
g, predator12-developers, role:developer
```

#### Roles

| Role | Permissions | Users |
|------|-------------|-------|
| **admin** | Full access | predator12-admins |
| **developer** | View all, sync dev/staging | predator12-developers |
| **operator** | View all, sync all | predator12-operators |
| **readonly** | View only | predator12-viewers |
| **ci-deployer** | Create/sync apps (automation) | ci-deployer account |

### SSO Integration (Keycloak)

Configure in `argocd-cm.yaml`:

```yaml
dex.config: |
  connectors:
    - type: oidc
      id: keycloak
      name: Keycloak
      config:
        issuer: https://keycloak.predator12.local/realms/predator12
        clientID: argocd
        clientSecret: $keycloak-client-secret
```

### Notifications

Configured in `argocd-notifications-cm.yaml`:

- **Slack**: Deployment notifications
- **GitHub**: Commit status updates
- **Prometheus**: Metrics export

---

## Application Management

### ApplicationSets

ApplicationSets automatically create Applications across environments:

```yaml
# Creates:
# - predator12-dev-backend
# - predator12-dev-frontend
# - predator12-staging-backend
# - predator12-staging-frontend
# - predator12-prod-backend
# - predator12-prod-frontend
```

### Sync Policies

#### Auto-Sync (Dev/Staging)

```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources not in Git
    selfHeal: true   # Automatically sync on drift
```

#### Manual Sync (Production)

```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: false  # Requires manual approval
```

### Sync Waves

Resources are deployed in order using annotations:

```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "0"  # Database migrations
    argocd.argoproj.io/sync-wave: "10" # Backend
    argocd.argoproj.io/sync-wave: "20" # Frontend
```

### Sync Hooks

#### PreSync: Database Migration

```yaml
metadata:
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/sync-wave: "0"
```

#### PostSync: Smoke Tests

```yaml
metadata:
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/sync-wave: "10"
```

#### SyncFail: Cleanup

```yaml
metadata:
  annotations:
    argocd.argoproj.io/hook: SyncFail
```

---

## Progressive Delivery

### Argo Rollouts

Canary deployment strategy:

```yaml
strategy:
  canary:
    steps:
      - setWeight: 10    # 10% traffic to canary
      - pause: 2m        # Wait 2 minutes
      - analysis: {...}  # Run analysis
      - setWeight: 25    # 25% traffic
      - pause: 5m
      - analysis: {...}
      - setWeight: 50
      - pause: 5m
      - analysis: {...}
      - setWeight: 100   # Full rollout
```

### Analysis Templates

Automated quality gates:

1. **Success Rate**: ≥95% success rate
2. **Latency**: ≤500ms P95 latency
3. **Error Rate**: ≤5% error rate
4. **CPU Usage**: ≤80% CPU
5. **Memory Usage**: ≤85% memory
6. **Agent Health**: ≥90% agents healthy

### Rollback

Automatic rollback on failure:

```bash
# Manual rollback
kubectl argo rollouts undo rollout predator12-backend -n predator12-prod

# Abort ongoing rollout
kubectl argo rollouts abort rollout predator12-backend -n predator12-prod
```

---

## Security

### Sealed Secrets

Never commit plain secrets to Git:

```bash
# Create secret
echo -n "mysecret" | kubectl create secret generic my-secret \
  --dry-run=client --from-file=password=/dev/stdin -o yaml | \
  kubeseal -o yaml > my-sealed-secret.yaml

# Commit sealed secret to Git
git add my-sealed-secret.yaml
git commit -m "Add sealed secret"
```

### OPA/Gatekeeper Policies

Enforce security policies:

1. **Required Labels**: All resources must have labels
2. **Resource Limits**: All containers must have limits
3. **No Default Namespace**: Block default namespace
4. **Image Registry**: Only approved registries
5. **No Privileged**: No privileged containers

### RBAC

Least privilege access:

- Developers: View all, sync dev/staging only
- Operators: View all, sync all
- CI/CD: Limited automation access

---

## Monitoring & Observability

### Prometheus Metrics

ArgoCD exports metrics to Prometheus:

```promql
# Application sync status
argocd_app_info{sync_status="Synced"}

# Sync duration
histogram_quantile(0.95, rate(argocd_app_sync_duration_seconds_bucket[5m]))

# Failed syncs
rate(argocd_app_sync_total{phase="Failed"}[5m])
```

### Grafana Dashboards

Import ArgoCD dashboards:
- Dashboard ID: 14584 (ArgoCD Overview)
- Dashboard ID: 14391 (ArgoCD Notifications)

### Alerts

Configured in `prometheusrule.yaml`:

- Application sync failed
- Application health degraded
- Repository connection failed
- High sync duration
- Controller errors

---

## Disaster Recovery

### Backup

Backup ArgoCD configuration:

```bash
# Backup all applications
argocd app list -o yaml > backup/applications.yaml

# Backup all projects
argocd proj list -o yaml > backup/projects.yaml

# Backup settings
kubectl get cm argocd-cm -n argocd -o yaml > backup/argocd-cm.yaml
kubectl get cm argocd-rbac-cm -n argocd -o yaml > backup/argocd-rbac-cm.yaml
```

### Restore

Restore from backup:

```bash
# Restore applications
kubectl apply -f backup/applications.yaml

# Restore projects
kubectl apply -f backup/projects.yaml

# Restore settings
kubectl apply -f backup/argocd-cm.yaml
kubectl apply -f backup/argocd-rbac-cm.yaml
```

### Database Backup

ArgoCD uses Redis for caching (ephemeral) and doesn't store critical state.
All state is derived from Git and Kubernetes.

---

## Troubleshooting

### Application Not Syncing

```bash
# Check application status
argocd app get predator12-prod-backend

# Check sync status
argocd app sync predator12-prod-backend --dry-run

# Force refresh
argocd app get predator12-prod-backend --refresh
```

### Sync Errors

```bash
# View logs
kubectl logs -n argocd deployment/argocd-application-controller

# Check events
kubectl get events -n predator12-prod --sort-by='.lastTimestamp'

# Validate manifests
kubectl apply --dry-run=client -f manifests/
```

### Drift Detection

```bash
# Check drift
argocd app diff predator12-prod-backend

# Sync to fix drift
argocd app sync predator12-prod-backend
```

### Repository Connection Issues

```bash
# Test repository
argocd repo get https://github.com/predator12-org/predator12-local.git

# Update credentials
argocd repo add https://github.com/predator12-org/predator12-local.git \
  --username <user> --password <token>
```

### Performance Issues

```bash
# Scale up repo server
kubectl scale deployment argocd-repo-server -n argocd --replicas=3

# Increase resources
kubectl edit deployment argocd-repo-server -n argocd
```

---

## CLI Reference

### Common Commands

```bash
# List applications
argocd app list

# Get application details
argocd app get <app-name>

# Sync application
argocd app sync <app-name>

# Delete application
argocd app delete <app-name>

# Rollback application
argocd app rollback <app-name> <revision>

# View application history
argocd app history <app-name>

# View application manifests
argocd app manifests <app-name>

# View application diff
argocd app diff <app-name>

# Set application parameter
argocd app set <app-name> --parameter key=value
```

### Project Management

```bash
# List projects
argocd proj list

# Create project
argocd proj create <project-name>

# Add source repo
argocd proj add-source <project-name> <repo-url>

# Add destination
argocd proj add-destination <project-name> <server> <namespace>
```

---

## Best Practices

### 1. Git Workflow

- **Main Branch**: Production-ready code
- **Develop Branch**: Staging deployments
- **Feature Branches**: Development deployments
- **Pull Requests**: Required for production changes

### 2. Environment Strategy

- **Dev**: Auto-sync, self-heal enabled
- **Staging**: Auto-sync, manual approval for sensitive changes
- **Production**: Manual sync, full approval process

### 3. Secrets Management

- Use Sealed Secrets or Vault
- Never commit plain secrets to Git
- Rotate secrets regularly
- Use separate secrets per environment

### 4. Monitoring

- Set up alerts for sync failures
- Monitor drift detection
- Track deployment frequency
- Measure lead time for changes

### 5. Security

- Enable RBAC
- Use SSO integration
- Enforce policy with Gatekeeper
- Audit all changes

---

## Integration with CI/CD

### GitHub Actions

```yaml
name: Deploy to ArgoCD

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Update image tag
        run: |
          yq e '.image.tag = "${{ github.sha }}"' -i helm/values.yaml
      
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add helm/values.yaml
          git commit -m "Update image tag to ${{ github.sha }}"
          git push
      
      - name: Sync ArgoCD
        run: |
          argocd app sync predator12-prod-backend --grpc-web
```

---

## Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Argo Rollouts Documentation](https://argoproj.github.io/argo-rollouts/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [Gatekeeper](https://open-policy-agent.github.io/gatekeeper/)
- [GitOps Principles](https://opengitops.dev/)

---

## Support

For issues or questions:
- GitHub Issues: [predator12-local/issues](https://github.com/predator12-org/predator12-local/issues)
- Slack: #predator12-deployments
- Email: devops@predator12.com
