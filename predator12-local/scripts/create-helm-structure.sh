#!/usr/bin/env bash
# Create Helm chart structure for Predator12

set -Eeuo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🎨 Creating Helm Chart Structure...${NC}\n"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Create directories
mkdir -p "$PROJECT_ROOT/helm/charts/backend/templates"
mkdir -p "$PROJECT_ROOT/helm/charts/frontend/templates"
mkdir -p "$PROJECT_ROOT/helm/charts/dependencies"
mkdir -p "$PROJECT_ROOT/helm/overlays/dev"
mkdir -p "$PROJECT_ROOT/helm/overlays/staging"
mkdir -p "$PROJECT_ROOT/helm/overlays/prod"
mkdir -p "$PROJECT_ROOT/argo"

echo -e "${GREEN}✅ Created directory structure${NC}"

# Backend Chart.yaml
cat > "$PROJECT_ROOT/helm/charts/backend/Chart.yaml" <<EOF
apiVersion: v2
name: predator-backend
description: Predator12 Backend API (FastAPI + Celery)
version: 1.0.0
appVersion: "1.0"
keywords:
  - fastapi
  - celery
  - python
maintainers:
  - name: Predator12 Team
EOF

# Backend values.yaml
cat > "$PROJECT_ROOT/helm/charts/backend/values.yaml" <<EOF
replicaCount: 1

image:
  repository: predator-backend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000
  targetPort: 8000

ingress:
  enabled: false
  className: nginx
  hosts:
    - host: api.predator.local
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

celery:
  enabled: true
  workers: 2
  concurrency: 4

env:
  DATABASE_URL: postgresql://user:pass@postgres:5432/predator
  REDIS_URL: redis://redis:6379/0
  QDRANT_URL: http://qdrant:6333
  OPENSEARCH_URL: http://opensearch:9200
  LOG_LEVEL: INFO
EOF

# Frontend Chart.yaml
cat > "$PROJECT_ROOT/helm/charts/frontend/Chart.yaml" <<EOF
apiVersion: v2
name: predator-frontend
description: Predator12 Frontend (Next.js)
version: 1.0.0
appVersion: "1.0"
keywords:
  - nextjs
  - react
maintainers:
  - name: Predator12 Team
EOF

# Frontend values.yaml
cat > "$PROJECT_ROOT/helm/charts/frontend/values.yaml" <<EOF
replicaCount: 1

image:
  repository: predator-frontend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 3000
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: predator.local
      paths:
        - path: /
          pathType: Prefix

resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "200m"

env:
  NEXT_PUBLIC_API_URL: http://api.predator.local
EOF

# Dev overlays
cat > "$PROJECT_ROOT/helm/overlays/dev/backend-values.yaml" <<EOF
replicaCount: 1

image:
  tag: dev-latest

resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "250m"

env:
  LOG_LEVEL: DEBUG
  DEBUG: "true"
EOF

cat > "$PROJECT_ROOT/helm/overlays/dev/frontend-values.yaml" <<EOF
replicaCount: 1

image:
  tag: dev-latest

resources:
  requests:
    memory: "128Mi"
    cpu: "50m"
  limits:
    memory: "256Mi"
    cpu: "100m"
EOF

# Staging overlays
cat > "$PROJECT_ROOT/helm/overlays/staging/backend-values.yaml" <<EOF
replicaCount: 2

image:
  tag: staging-latest

resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

env:
  LOG_LEVEL: INFO
EOF

# Prod overlays
cat > "$PROJECT_ROOT/helm/overlays/prod/backend-values.yaml" <<EOF
replicaCount: 5

image:
  tag: v1.0.0

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"

celery:
  workers: 4
  concurrency: 8

env:
  LOG_LEVEL: WARNING
EOF

# ArgoCD Application
cat > "$PROJECT_ROOT/argo/app-backend-dev.yaml" <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: predator-backend-dev
  namespace: argocd
  labels:
    environment: dev
    component: backend
spec:
  project: default
  
  source:
    repoURL: https://github.com/your-org/predator12.git
    targetRevision: HEAD
    path: helm/charts/backend
    helm:
      valueFiles:
        - ../../overlays/dev/backend-values.yaml
  
  destination:
    server: https://kubernetes.default.svc
    namespace: dev
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF

# ArgoCD ApplicationSet
cat > "$PROJECT_ROOT/argo/applicationset.yaml" <<EOF
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: predator-backend-multienv
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: dev
            namespace: dev
            replicas: "1"
            autoSync: "true"
          - env: staging
            namespace: staging
            replicas: "2"
            autoSync: "true"
          - env: prod
            namespace: prod
            replicas: "5"
            autoSync: "false"
  
  template:
    metadata:
      name: 'predator-backend-{{env}}'
      labels:
        environment: '{{env}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/your-org/predator12.git
        targetRevision: HEAD
        path: helm/charts/backend
        helm:
          valueFiles:
            - ../../overlays/{{env}}/backend-values.yaml
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: '{{autoSync}}'
          selfHeal: '{{autoSync}}'
        syncOptions:
          - CreateNamespace=true
EOF

echo -e "${GREEN}✅ Created Helm charts and ArgoCD manifests${NC}\n"

echo -e "${BLUE}📋 Created files:${NC}"
echo "  • helm/charts/backend/"
echo "  • helm/charts/frontend/"
echo "  • helm/overlays/{dev,staging,prod}/"
echo "  • argo/app-backend-dev.yaml"
echo "  • argo/applicationset.yaml"
echo ""

echo -e "${BLUE}🧪 Test Helm charts:${NC}"
echo "  helm lint helm/charts/backend/"
echo "  helm template test helm/charts/backend/"
echo ""

echo -e "${BLUE}🚀 Deploy to ArgoCD:${NC}"
echo "  kubectl apply -f argo/app-backend-dev.yaml"
echo "  # Or for multi-env:"
echo "  kubectl apply -f argo/applicationset.yaml"
echo ""

echo -e "${GREEN}✨ Helm structure created successfully!${NC}"
