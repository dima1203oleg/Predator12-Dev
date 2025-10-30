# GitOps з ArgoCD + Helm Workflow для Predator12

## 🎯 Мета

Забезпечити повний, стабільний і продакшн-ready workflow від локальної розробки (Run & Debug у VS Code) до автоматизованого деплойменту через GitOps з ArgoCD та Helm. Це включає локальний дебаг бекенду (FastAPI + Celery), фронтенду (Next.js) і тестів (Pytest), а також GitOps для multi-environment promotion (dev → staging → prod). Вся конфігурація — у Git як source of truth, з автоматизацією синхронізації, моніторингом і відновленням.

---

## 📋 Умови

### Структура Проєкту

```
predator12-local/
  backend/          # Python код (FastAPI, Celery, ETL)
    app/           # Основний код додатку
    tests/         # Pytest тести
    requirements-311-modern.txt
  frontend/         # Next.js код
  helm/             # Helm charts для деплойменту (створимо)
    charts/         # Базові charts (backend, frontend, db тощо)
      backend/
      frontend/
      dependencies/
    overlays/       # Environment-specific overrides
      dev/
      staging/
      prod/
  argo/            # ArgoCD manifests (створимо)
    applicationset.yaml
    app-backend-dev.yaml
    app-frontend-dev.yaml
  scripts/          # Скрипти (start-all.sh з підтримкою DEBUG_PY=1)
  .vscode/          # Конфіги для VS Code (вже налаштовано)
    settings.json
    launch.json
  .gitignore        # Ігнорувати venv, node_modules тощо
  README.md         # Документація
```

### Технології

- ✅ Python 3.11 з venv
- ✅ Node.js для фронтенду
- 🔄 Kubernetes кластер (Minikube для dev, EKS/GKE для prod)
- 🔄 ArgoCD інстальований у кластері
- 🔄 Helm 3+
- ✅ Git репозиторій (GitHub/GitLab)
- 🔄 Observability: Prometheus/Grafana, OpenTelemetry

**Легенда:** ✅ = Готово | 🔄 = Потрібно налаштувати

---

## 🚀 Вимоги

### 1. Локальна Розробка та Дебаг (VS Code Integration)

#### ✅ Вже Налаштовано:

- **`.vscode/settings.json`**:
  - Python interpreter: `.venv/bin/python`
  - `python.analysis.extraPaths` для Pylance
  - Formatters: Black, Prettier

- **`.vscode/launch.json`**:
  - 🐍 Python: FastAPI Backend Debug (`type: debugpy`)
  - 🌐 Node: Frontend Debug (`type: node`)
  - 🧪 Python: Run Tests (`type: debugpy`)
  - 🚀 Full Stack Debug (compound)
  - 🤖 Python: Agent Debug
  - 📊 Python: Database Migration

#### 🔄 Інтеграція з GitOps:

**Workflow:**
1. Розробка локально з VS Code debugging (F5)
2. Тестування з pytest
3. Commit змін до Git
4. ArgoCD автоматично синхронізує зміни з кластером
5. Моніторинг через ArgoCD UI + Grafana

**Скрипти з DEBUG_PY=1:**
```bash
# Локальний debug
DEBUG_PY=1 ./scripts/start-all.sh

# Для remote debug у кластері (attach до pod)
kubectl port-forward pod/backend-xxx 5678:5678
# Потім використати "Attach to Remote Python" у launch.json
```

#### Документація:
- ✅ `VSCODE_README.md` - Головний файл
- ✅ `VSCODE_QUICKSTART.md` - Швидкий старт
- ✅ `VSCODE_COMPLETE_REPORT.md` - Повний звіт

---

### 2. GitOps Workflow з ArgoCD + Helm

#### Типовий Цикл:

```mermaid
graph LR
    A[Dev Changes] --> B[Git Commit]
    B --> C[ArgoCD Watcher]
    C --> D[Helm Render]
    D --> E[K8s Apply]
    E --> F[Health Check]
    F --> G[Monitoring]
    G --> H{Success?}
    H -->|Yes| I[Done]
    H -->|No| J[Rollback]
```

#### Деталі Кроків:

##### 1. Dev Зміни

**Backend Helm Chart:**
```yaml
# helm/charts/backend/values.yaml
replicaCount: 1
image:
  repository: predator-backend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000

resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

celery:
  enabled: true
  workers: 2

env:
  DATABASE_URL: postgresql://user:pass@postgres:5432/predator
  REDIS_URL: redis://redis:6379/0
  QDRANT_URL: http://qdrant:6333
  OPENSEARCH_URL: http://opensearch:9200
```

**Frontend Helm Chart:**
```yaml
# helm/charts/frontend/values.yaml
replicaCount: 1
image:
  repository: predator-frontend
  tag: latest

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: predator.local
      paths:
        - path: /
          pathType: Prefix
```

**Environment Overrides:**
```yaml
# helm/overlays/dev/backend-values.yaml
replicaCount: 1
debug: true
env:
  LOG_LEVEL: DEBUG

# helm/overlays/prod/backend-values.yaml
replicaCount: 5
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
env:
  LOG_LEVEL: INFO
```

##### 2. Git Commit + Push

**Workflow:**
```bash
# Feature branch
git checkout -b feature/new-api
# Внесення змін
git add helm/charts/backend/
git commit -m "feat: add new API endpoint"
git push origin feature/new-api

# Pull Request → Code Review → CI Checks
# - helm lint
# - kubeval для manifests
# - pytest для backend
# - eslint для frontend

# Merge to main → Auto-deploy to dev
# Merge to release/staging → Auto-deploy to staging
# Tag v1.x.x → Manual approval → Deploy to prod
```

**CI Checks (.github/workflows/helm-lint.yml):**
```yaml
name: Helm Lint
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/setup-helm@v3
      - run: helm lint helm/charts/backend/
      - run: helm lint helm/charts/frontend/
      - run: helm template test helm/charts/backend/ | kubeval
```

##### 3. ArgoCD Watcher

**Конфігурація:**
- Poll interval: 3 хвилини (або webhook для instant sync)
- Спостереження за `helm/charts/` та `helm/overlays/`
- Multi-branch support (dev/staging/prod)

##### 4. Sync / Apply Змін

**Auto-Sync Налаштування:**
```yaml
syncPolicy:
  automated:
    prune: true      # Видаляти застарілі ресурси
    selfHeal: true   # Автоматично виправляти drift
  syncOptions:
    - CreateNamespace=true
    - ApplyOutOfSyncOnly=true
  retry:
    limit: 5
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m
```

**Health Checks:**
```yaml
# Custom health check для PostgreSQL
health:
  checks:
    - kind: StatefulSet
      name: postgres
      jsonPointers:
        - /status/readyReplicas
      expectedValue: "1"
```

##### 5. Моніторинг / Dashboard

**ArgoCD UI:**
- Status sync: OutOfSync / Synced / Progressing
- Diffs: Покрокові зміни між Git та кластером
- History: Rollback до попередніх версій
- Events: Логи sync операцій

**Observability Stack:**
```yaml
# Prometheus метрики
- argocd_app_sync_total
- argocd_app_health_status
- predator_backend_requests_total
- predator_celery_tasks_total

# Grafana Dashboards
- ArgoCD Application Status
- Predator Backend Performance
- Predator Celery Queue Metrics
- Kubernetes Cluster Overview

# OpenTelemetry Tracing
# Інструментація FastAPI для distributed tracing
```

**Notifications:**
```yaml
# ArgoCD Notifications (Slack/Email)
triggers:
  - when: app.status.operationState.phase == 'Failed'
    send: [slack-failure]
  - when: app.status.sync.status == 'OutOfSync'
    send: [slack-outofsync]

templates:
  slack-failure: |
    message: ":red_circle: Application {{.app.metadata.name}} sync failed!"
    webhook: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

### 3. Потужні Компоненти для Продакшн

#### ApplicationSet (Multi-Env)

**Переваги:**
- Один YAML для всіх environments
- Автоматична генерація Applications
- DRY principle для конфігурацій

**Приклад:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: predator-apps
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
            autoSync: "false"  # Manual approval для prod
  template:
    metadata:
      name: 'predator-backend-{{env}}'
      labels:
        environment: '{{env}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/your-org/predator12.git
        targetRevision: '{{#if eq env "prod"}}v1.0.0{{else}}HEAD{{/if}}'
        path: helm/charts/backend
        helm:
          valueFiles:
            - ../../overlays/{{env}}/backend-values.yaml
          parameters:
            - name: replicaCount
              value: '{{replicas}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: '{{autoSync}}'
          selfHeal: '{{autoSync}}'
        syncOptions:
          - CreateNamespace=true
```

#### Sync Waves / Ordering

**Використання:**
Забезпечує правильний порядок розгортання залежностей.

**Приклад:**
```yaml
# Wave 1: CRDs та Databases
apiVersion: v1
kind: ConfigMap
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"

# Wave 2: Application Dependencies
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  annotations:
    argocd.argoproj.io/sync-wave: "2"

# Wave 3: Backend Services
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  annotations:
    argocd.argoproj.io/sync-wave: "3"

# Wave 4: Frontend
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  annotations:
    argocd.argoproj.io/sync-wave: "4"
```

#### Hooks

**Pre-Sync Hook (Database Migrations):**
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: alembic
        image: predator-backend:latest
        command: ["alembic", "upgrade", "head"]
        env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: db-secret
                key: url
      restartPolicy: Never
```

**Post-Sync Hook (Smoke Tests):**
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: smoke-tests
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: pytest
        image: predator-backend:latest
        command: ["pytest", "smoke_tests/"]
      restartPolicy: Never
```

#### Rollbacks

**Auto-Rollback:**
```yaml
syncPolicy:
  automated:
    selfHeal: true
  rollback:
    limit: 3  # Кількість версій для rollback
```

**Manual Rollback:**
```bash
# Via CLI
argocd app rollback predator-backend-prod <revision>

# Via UI
ArgoCD → Application → History → Select Revision → Rollback
```

#### RBAC

**Roles:**
```yaml
# argocd-rbac-cm ConfigMap
policy.csv: |
  # Developers: read-only для prod
  p, role:developer, applications, get, */*, allow
  p, role:developer, applications, sync, dev/*, allow
  p, role:developer, applications, sync, staging/*, allow

  # DevOps: full access
  p, role:devops, applications, *, */*, allow

  # Bind roles to groups
  g, developers-team, role:developer
  g, devops-team, role:devops
```

#### Multi-Env Promotion

**GitHub Actions Pipeline:**
```yaml
name: Multi-Env Promotion
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Update dev values
        run: |
          yq e '.image.tag = "${{ github.sha }}"' -i helm/overlays/dev/backend-values.yaml
          git commit -am "chore: update dev image tag"
          git push

  deploy-staging:
    needs: deploy-dev
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Merge to staging
        run: |
          git checkout staging
          git merge main
          git push

  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production
    steps:
      - name: Update prod values
        run: |
          yq e '.image.tag = "${{ github.ref_name }}"' -i helm/overlays/prod/backend-values.yaml
          git commit -am "chore: release ${{ github.ref_name }}"
          git push
```

#### Secrets Management

**External Secrets Operator + Vault:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-secret
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: secret/data/predator/db
        property: url
```

**SOPS для Git-Encrypted Secrets:**
```yaml
# helm/overlays/prod/secrets.yaml (encrypted)
apiVersion: v1
kind: Secret
metadata:
  name: api-keys
data:
  openai-key: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
```

---

## 📁 Структура Папок для Helm + Overlays

```
predator12-local/
├── helm/
│   ├── charts/
│   │   ├── backend/
│   │   │   ├── templates/
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   ├── configmap.yaml
│   │   │   │   ├── hpa.yaml
│   │   │   │   └── ingress.yaml
│   │   │   ├── values.yaml
│   │   │   └── Chart.yaml
│   │   ├── frontend/
│   │   │   ├── templates/
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   └── ingress.yaml
│   │   │   ├── values.yaml
│   │   │   └── Chart.yaml
│   │   └── dependencies/
│   │       ├── postgresql/
│   │       ├── redis/
│   │       ├── qdrant/
│   │       └── opensearch/
│   └── overlays/
│       ├── dev/
│       │   ├── backend-values.yaml
│       │   ├── frontend-values.yaml
│       │   └── dependencies-values.yaml
│       ├── staging/
│       │   ├── backend-values.yaml
│       │   └── frontend-values.yaml
│       └── prod/
│           ├── backend-values.yaml
│           ├── frontend-values.yaml
│           └── secrets.yaml (SOPS encrypted)
├── argo/
│   ├── applicationset.yaml
│   ├── app-backend-dev.yaml
│   ├── app-frontend-dev.yaml
│   └── notifications.yaml
└── scripts/
    ├── helm-deploy.sh
    └── argocd-setup.sh
```

---

## 📝 Приклади YAML Шаблонів

### ArgoCD Application (Backend Dev)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: predator-backend-dev
  namespace: argocd
  labels:
    environment: dev
    component: backend
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default

  source:
    repoURL: https://github.com/your-org/predator12.git
    targetRevision: HEAD
    path: helm/charts/backend
    helm:
      valueFiles:
        - ../../overlays/dev/backend-values.yaml
      parameters:
        - name: image.tag
          value: latest
        - name: replicaCount
          value: "1"
      releaseName: predator-backend

  destination:
    server: https://kubernetes.default.svc
    namespace: dev

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - ApplyOutOfSyncOnly=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

  revisionHistoryLimit: 10

  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas  # Якщо HPA керує replicas
```

### ArgoCD ApplicationSet (Multi-Env)

```yaml
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
            branch: main
            resources:
              requests:
                cpu: "250m"
                memory: "512Mi"
              limits:
                cpu: "500m"
                memory: "1Gi"

          - env: staging
            namespace: staging
            replicas: "2"
            autoSync: "true"
            branch: release/staging
            resources:
              requests:
                cpu: "500m"
                memory: "1Gi"
              limits:
                cpu: "1000m"
                memory: "2Gi"

          - env: prod
            namespace: prod
            replicas: "5"
            autoSync: "false"  # Manual approval
            branch: release/prod
            resources:
              requests:
                cpu: "1000m"
                memory: "2Gi"
              limits:
                cpu: "2000m"
                memory: "4Gi"

  template:
    metadata:
      name: 'predator-backend-{{env}}'
      labels:
        environment: '{{env}}'
        managed-by: argocd
      annotations:
        notifications.argoproj.io/subscribe.on-sync-failed.slack: predator-alerts

    spec:
      project: default

      source:
        repoURL: https://github.com/your-org/predator12.git
        targetRevision: '{{branch}}'
        path: helm/charts/backend
        helm:
          valueFiles:
            - ../../overlays/{{env}}/backend-values.yaml
          parameters:
            - name: replicaCount
              value: '{{replicas}}'
            - name: resources.requests.cpu
              value: '{{resources.requests.cpu}}'
            - name: resources.requests.memory
              value: '{{resources.requests.memory}}'
            - name: resources.limits.cpu
              value: '{{resources.limits.cpu}}'
            - name: resources.limits.memory
              value: '{{resources.limits.memory}}'

      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'

      syncPolicy:
        automated:
          prune: '{{autoSync}}'
          selfHeal: '{{autoSync}}'
        syncOptions:
          - CreateNamespace=true
          - ApplyOutOfSyncOnly=true

      revisionHistoryLimit: 10
```

### Frontend Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: predator-frontend-dev
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/your-org/predator12.git
    targetRevision: HEAD
    path: helm/charts/frontend
    helm:
      valueFiles:
        - ../../overlays/dev/frontend-values.yaml

  destination:
    server: https://kubernetes.default.svc
    namespace: dev

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

---

## 🔧 Кроки Впровадження

### 1. Встановити ArgoCD

```bash
# Створити namespace
kubectl create namespace argocd

# Встановити ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Або через Helm
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd -n argocd

# Отримати initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port-forward для доступу до UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Відкрити https://localhost:8080
# Login: admin / <password from above>
```

### 2. Налаштувати Git Repository

```bash
# Via CLI
argocd repo add https://github.com/your-org/predator12.git \
  --username your-username \
  --password your-token

# Або via UI:
# Settings → Repositories → Connect Repo
```

### 3. Створити Helm Charts

```bash
# Backend chart
mkdir -p helm/charts/backend/templates
cat > helm/charts/backend/Chart.yaml <<EOF
apiVersion: v2
name: predator-backend
description: Predator12 Backend API
version: 1.0.0
appVersion: "1.0"
EOF

cat > helm/charts/backend/values.yaml <<EOF
replicaCount: 1

image:
  repository: predator-backend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000

env:
  DATABASE_URL: postgresql://user:pass@postgres:5432/predator
  REDIS_URL: redis://redis:6379/0
EOF

# Аналогічно для frontend
```

### 4. Створити ArgoCD Applications

```bash
# Apply ApplicationSet
kubectl apply -f argo/applicationset.yaml

# Або окремі Applications
kubectl apply -f argo/app-backend-dev.yaml
kubectl apply -f argo/app-frontend-dev.yaml
```

### 5. Моніторити Sync

```bash
# Via CLI
argocd app list
argocd app get predator-backend-dev
argocd app sync predator-backend-dev  # Manual sync

# Via UI
# https://localhost:8080
# Applications → predator-backend-dev → Sync Status
```

### 6. Тестувати Workflow

```bash
# 1. Внести зміну в Helm values
echo "replicaCount: 2" >> helm/overlays/dev/backend-values.yaml

# 2. Commit та push
git add helm/overlays/dev/backend-values.yaml
git commit -m "scale: increase dev replicas to 2"
git push

# 3. Перевірити ArgoCD (3 хвилини або instant з webhook)
argocd app get predator-backend-dev

# 4. Перевірити pods
kubectl get pods -n dev
```

---

## ✅ Критерії Якості

### Автоматизація
- ✅ 100% Git-based, no manual kubectl
- ✅ Auto-sync для dev/staging
- ✅ Manual approval для prod
- ✅ CI/CD pipeline для build + deploy

### Стабільність
- ✅ Health checks для всіх компонентів
- ✅ Auto-rollback на failures
- ✅ Sync waves для dependencies
- ✅ Pre/Post-sync hooks для migrations/tests

### Безпека
- ✅ RBAC для різних ролей
- ✅ Secrets management (Vault/SOPS)
- ✅ Network policies для ізоляції
- ✅ Image scanning у CI

### Масштабованість
- ✅ Multi-env support (dev/staging/prod)
- ✅ HPA для автоскейлингу
- ✅ Resource limits налаштовані
- ✅ ApplicationSet для DRY configs

### Уніфікація
- ✅ Вся команда використовує Git workflow
- ✅ Єдиний source of truth
- ✅ Versioned infrastructure
- ✅ Audit trail через Git history

---

## 📊 Observability Stack

### Prometheus Metrics

```yaml
# ServiceMonitor для Backend
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: predator-backend
spec:
  selector:
    matchLabels:
      app: predator-backend
  endpoints:
    - port: metrics
      path: /metrics
      interval: 30s
```

**Key Metrics:**
- `predator_requests_total` - HTTP requests
- `predator_request_duration_seconds` - Latency
- `predator_celery_tasks_total` - Background tasks
- `argocd_app_sync_total` - Sync operations
- `argocd_app_health_status` - App health

### Grafana Dashboards

**Dashboard 1: ArgoCD Overview**
- Applications health status
- Sync success rate
- Out of sync applications
- Sync duration

**Dashboard 2: Predator Backend**
- Request rate / Error rate / Duration (RED metrics)
- Celery queue length
- Database connections
- Memory / CPU usage

**Dashboard 3: Kubernetes Cluster**
- Node resources
- Pod status
- Network traffic
- Storage usage

### OpenTelemetry Tracing

```python
# backend/app/main.py
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# Setup tracing
trace.set_tracer_provider(TracerProvider())
otlp_exporter = OTLPSpanExporter(endpoint="http://otel-collector:4317")
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(otlp_exporter))

# Instrument FastAPI
FastAPIInstrumentor.instrument_app(app)
```

---

## 🔗 Інтеграція з Існуючою Документацією

### VS Code Integration
- ✅ `VSCODE_README.md` - Локальний debug setup
- ✅ `VSCODE_QUICKSTART.md` - F5 для debug
- 🔄 Додати конфігурацію для remote debug (attach до K8s pod)

### Migration Guides
- ✅ `MIGRATION_GUIDE_PYTHON311.md` - Python 3.11 міграція
- 🔄 Додати секцію про containerization для K8s

### Project Overview
- ✅ `README.md` - Загальна документація
- 🔄 Оновити з секцією GitOps/ArgoCD

---

## 🚀 Наступні Кроки

### Для Локальної Розробки:
1. ✅ Використовувати VS Code debug (F5)
2. ✅ Запускати тести локально (pytest)
3. 🔄 Commit змін до Git
4. 🔄 ArgoCD auto-sync до dev кластеру

### Для Production Deployment:
1. 🔄 Створити Helm charts для всіх компонентів
2. 🔄 Налаштувати ArgoCD ApplicationSet
3. 🔄 Налаштувати CI/CD pipeline
4. 🔄 Налаштувати monitoring stack
5. 🔄 Провести smoke tests на staging
6. 🔄 Manual approval для prod deploy

### Для Team Onboarding:
1. ✅ Документація готова (цей файл)
2. 🔄 Training session по GitOps workflow
3. 🔄 Setup developer access (RBAC)
4. 🔄 Create runbook для common scenarios

---

## 📚 Корисні Посилання

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Helm Charts Guide](https://helm.sh/docs/topics/charts/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [GitOps Principles](https://opengitops.dev/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [OpenTelemetry](https://opentelemetry.io/docs/)

---

## 🎯 Summary

Цей документ описує повний GitOps workflow для Predator12:

1. **Локальна розробка** з VS Code debugging (✅ готово)
2. **Git-based deployments** через ArgoCD + Helm
3. **Multi-environment** promotion (dev → staging → prod)
4. **Автоматизація** з health checks, rollbacks, notifications
5. **Observability** з Prometheus, Grafana, OpenTelemetry
6. **Безпека** з RBAC, secrets management
7. **Масштабованість** з HPA, resource limits

**Статус:**
- ✅ Локальний dev environment готовий
- 🔄 GitOps infrastructure потрібно налаштувати
- 📝 Документація повна

**Готово до впровадження!** 🚀

---

**Версія:** 1.0  
**Дата:** 6 січня 2025  
**Автор:** Predator12 Dev Team  
**Статус:** 📋 SPECIFICATION READY
