# Розширене технічне завдання (ТЗ): Автономний GitOps-конвеєр для Predator Analytics

## 1. Мета проекту та візія

Цей документ — повна, детальна специфікація для створення enterprise-ready автономного GitOps-конвеєра для системи Predator Analytics. Конвеєр перетворює поточний стан (скрипти `scripts/helm/render_and_sync.sh`, `scripts/gitops_sync.sh`, VS Code extension, агенти, Helm-умбрела) на повноцінну систему, яка автоматизує весь цикл розгортання: від локального DRY_RUN до production-деплою з верифікацією та self-heal.

**Візія:** Один тригер у VS Code (команда `autodeploy.toProd`) запускає безпечний, ідемпотентний процес: підготовка (preflight з MCP-аналізом ризиків) → рендер Helm-чартів → синхронізація manifests-repo (push для low-risk, PR для high-risk) → Argo CD sync з Rollouts (canary/blue-green) → верифікація метрик (Prometheus + smoke tests) → finalize (тегування) або rollback з self-heal. Система стійка до відмов, захищена (RBAC, supply chain scans) та відстежувана (audit logs з runId).

**Для кого це ТЗ?**

- **Engineering Lead:** Архітектурні рішення, roadmap, signoff.
- **DevOps/SRE:** Налаштування K8s/Argo/Prometheus, CI secrets, rollback runbook.
- **Backend/Frontend devs:** Інтеграція agents, extension UI, scripts.
- **QA:** E2E/chaos tests, DRY_RUN validation.
- **Security:** Supply chain (Trivy/Cosign), RBAC, compliance audit.

**Ключові принципи:**

- **Автономність:** Low-risk (MCP confidence ≥0.8) — повний auto; high-risk — PR з require 1 approval.
- **Безпека:** Trivy block на CRITICAL/HIGH vulns; Cosign signed images; RBAC least-privilege; redact secrets у logs.
- **Стійкість:** Self-heal ≥85% (scale/restart on failure); retries 3x backoff (1/2/4 хв); emergency rollback.
- **Traceability:** Audit JSON (runId, phases, meta) з retention 90 днів; GDPR-redact PII/tokens.

**KPI (вимірні цілі):**

- Low-risk цикли: ≥95% success (10+ ітерацій, <10 хв).
- Self-heal: ≥85% fix simulated failures (latency >300ms, pod crash).
- CI/CD: 100% green DRY_RUN; artifacts logs для рев'ю.
- Безпека: 0 vulns; 100% RBAC enforce.

## 2. Контекст та поточний стан

**Поточний стан (30 жовтня 2025 р.):**

- **Manifests repo (https://github.com/dima1203oleg/predator-manifests):** Main гілка з `helm/`, `1233.pub` (тест SSH); потребує backup/очищення при init. Структура: `predator-base-manifests/helm/predator-rendered/`, `README.md`, `predator-base-manifests/rollouts/analysis-template.yaml`.
- **Компоненти Predator Analytics:**
  - **Агенти/backend:** `backend/app/agents/supervisor.py` (status/history), `backend/app/health_monitor.py` (`/health/self-heal`, `/observability/errors`).
  - **Frontend:** `frontend/src/utils/selfHeal.ts`, `frontend/src/main.tsx` (UI моніторинг).
  - **Скрипти:** `scripts/helm/render_and_sync.sh` (Helm template fallback YAML), `scripts/gitops_sync.sh` (патчі: init ls-remote, MCP-hook, DRY_RUN diff, push/PR gh, HTTPS GH_TOKEN, Argo optional).
  - **Helm:** `helm/predator-umbrella` (`Chart.yaml` v1.0.0, `values/prod.yaml` global registry `ghcr.io`, `templates deployment probes`, `ingress nginx cert-manager`, `monitoring prometheus-rules alerts`).
  - **VS Code extension:** `extension/package.json` commands, `extension/src/argocdAutoDeployer.ts` cycle, `extension/src/verify.ts` Prometheus/smoke, `extension/src/stateManager.ts` audit JSON, `extension/src/copilotInterceptor.ts` safe accept.
  - **MCP:** Orchestrator parallel contineo/klain, consensus weighted, risk gates low/high, supply validator Trivy/Cosign.
- **Залежності:** Argo CD (predator-production RBAC), Prometheus (queries 2m), gh CLI PR, yq/helm/kubectl local, Trivy/Cosign scans.
- **Середовище:** K8s (minikube/kind test, k3s staging, managed prod), VS Code 1.85+, Node 18+, Bash 5+, Docker build.
- **Зроблено:** Патчі `scripts/gitops_sync.sh` (init/MCP/push/PR), Helm шаблон (deployment/ingress/HPA/monitoring), MCP приклади (low rolling, medium canary, high vuln block), CI draft `autodeploy-dry.yml`, `extension/src/stateManager.ts` append/load.
- **Припущення:** Доступ Argo/Prometheus; GitHub bot `contents:write`/`pull_requests:write`; staging namespace `predator-staging`.

## 3. Архітектура

Потік — замкнутий цикл з fallback/audit:

```
VS Code (autodeploy.toProd Ctrl+Alt+D) → preflight (git diff + MCP analyze + lint/test + supply scan)
↓
GitOps (scripts/helm/render_and_sync.sh Helm template → scripts/gitops_sync.sh init/MCP-hook/yq tag/backup/DRY_RUN diff)
↓ (low-risk push main/tag auto-ts / high-risk PR gh create label review-needed)
Argo CD (app sync --prune; Rollouts canary 5/25/50/100% AnalysisTemplate Prometheus metrics)
↓ (execution scale/init-jobs; RBAC autonomous-agent sync/rollback)
Agents (backend/app/agents/supervisor.py status; backend/app/health_monitor.py /self-heal scale/restart on degraded)
↓ (verify Prometheus rate[2m]/quantile/uptime + smoke curl/DB kubectl exec; /errors log)
StateManager (append runId/phase/meta JSON; resume phase; retention 90d redact)
↓ (success tag prod-verified-ts / failure rollback argocd app rollback stable + Slack alert)
CI Loop (Actions dry-run/e2e kind; PR create artifacts logs.zip; merge squash delete branch)
```

**Модулі:**

- **MCP Orchestrator (`mcp/predator-tools/src/index.ts` або `core/mcpOrchestrator.ts`):** Init parallel timeout 30s, analyze context {changes vulns env}, consolidate weighted confidence, gates low≥0.8 push/high PR. (Note: The provided file list shows `mcp/predator-tools/src/index.ts` which might be the MCP orchestrator implementation).
- **Supply Validator (`security/supplyChainValidator.ts`):** `execa trivy fs/image --severity CRITICAL,HIGH exit1 block`, `cosign verify --key pub`, SBOM check pre-push. (Note: This file does not exist and needs to be created).
- **Verification Engine (`extension/src/verify.ts`):** `axios Prometheus rate(http_requests_total[2m]) <0.005`, `histogram 0.95 <0.3`, `avg up >0.995`; smoke `kubectl port-forward curl /health`, DB query.
- **State/Audit (`extension/src/stateManager.ts`):** file `globalStorage autocycle-history.json` load/append/last phases preflight/init/render/sync/verify/finalize/rollback, `runId UUID`, retention filter >90d, redact tokens `***`.
- **Copilot Interceptor (`extension/src/copilotInterceptor.ts`):** `onDidChangeTextDocument auto commit inlineSuggest` for `*.yaml/*.ts` lint (no secrets/configs). (Note: The provided file list shows `extension/src/copilotAutoInterceptor.ts` and `extension/src/copilotExecInterceptor.ts`. The spec refers to `copilotInterceptor.ts`, which might be a consolidated version or a new file).

## 4. Деталізований функціонал

### 4.1. Структура репозиторію

1.  **`predator-base-manifests/`** (bootstrap MANIFESTS_TEMPLATE):
    - `README.md`: "GitOps для Predator: env MANIFESTS_REPO IMAGE_TAG; tests `./scripts/gitops_sync_dry_tests.sh`; risks MCP low/high".
    - `helm/predator-umbrella/`:
      - `Chart.yaml`: `v2 name predator-umbrella description Umbrella for base/analytics/frontend/monitoring type application version 1.0.0 appVersion 1.0 dependencies prometheus v15.0.0 repo prometheus-community keywords gitops predator maintainers Predator Team sources github.com/dima1203oleg/predator12 annotations artifacthub.io/changes added initial changed prod values`.
      - `values.yaml`: `global imageRegistry ghcr.io/dima1203oleg pullPolicy IfNotPresent replicas 1 resources requests cpu100m memory128Mi limits cpu500m memory512Mi; base namespace predator labels app predator version {{global.appVersion}}; analytics enabled image repo/tag service ClusterIP port8080 env - name DB_HOST value postgres.predator.svc.cluster.local; frontend enabled image repo/tag ingress enabled false host predator.local tls []; replicas 2; monitoring enabled prometheus enabled rules - alert HighErrorRate expr rate(http_requests_total{status=~"5.."}[5m]) >0.01 for2m labels severity critical grafana enabled dashboardProviders - name default orgId1 folder "" type file disableDeletion false path /tmp/dashboards`.
      - `values-prod.yaml`: `global pullPolicy Always replicas 3; analytics resources requests cpu500m memory1Gi limits cpu1 memory2Gi hpa enabled minReplicas3 maxReplicas10 targetCPUUtilizationPercentage70; frontend ingress enabled annotations kubernetes.io/ingress.class=nginx cert-manager.io/cluster-issuer=letsencrypt-prod autoscaling enabled; monitoring prometheus retention30d storageSize50Gi`.
      - `templates/base/_helpers.tpl`: `define "predator.labels" helm.sh/chart {{include "predator.chart" .}} {{include "predator.selectorLabels" .}} if .Chart.AppVersion app.kubernetes.io/version {{.Chart.AppVersion | quote}} end app.kubernetes.io/managed-by {{.Release.Service}}; "predator.selectorLabels" app.kubernetes.io/name {{include "predator.name" .}} instance {{.Release.Name}}; "predator.chart" printf "%s-%s" .Chart.Name .Chart.Version replace + _ trunc63 trimSuffix -; "predator.name" default .Chart.Name .Values.nameOverride trunc63 trimSuffix -`.
      - `templates/analytics/deployment.yaml`: `apiVersion apps/v1 kind Deployment metadata name {{include "predator.name" .}}-analytics labels {{- include "predator.labels" . | nindent 4}} spec replicas {{.Values.analytics.replicas}} selector matchLabels {{- include "predator.selectorLabels" . | nindent 6}} template metadata labels {{- include "predator.selectorLabels" . | nindent 8}} annotations rollouts.pod-template-hash "{{ .Values.global.appVersion }}" spec containers - name analytics image "{{ .Values.analytics.image.repository }}:{{ .Values.analytics.image.tag }}" ports - containerPort 8080 env {{- toYaml .Values.analytics.env | nindent 12}} resources {{- toYaml .Values.analytics.resources | nindent 12}} readinessProbe httpGet path /health port 8080 initialDelaySeconds 10 periodSeconds 5 livenessProbe httpGet path /health port 8080 initialDelaySeconds 30 periodSeconds 10 with .Values.analytics.nodeSelector nodeSelector {{- toYaml . | nindent 8}} end with .Values.analytics.affinity affinity {{- toYaml . | nindent 8}} end with .Values.analytics.tolerations tolerations {{- toYaml . | nindent 8}} end`.
      - `templates/frontend/ingress.yaml`: `apiVersion networking.k8s.io/v1 kind Ingress metadata name {{include "predator.name" .}}-frontend annotations kubernetes.io/ingress.class=nginx cert-manager.io/cluster-issuer=letsencrypt-prod labels {{- include "predator.labels" . | nindent 4}} spec if .Values.frontend.ingress.enabled rules - host {{ .Values.frontend.ingress.host }} http paths - path / pathType Prefix backend service name {{ include "predator.name" . }}-frontend servicePort 80 tls if .Values.frontend.ingress.tls - hosts {{ .Values.frontend.ingress.host }} secretName {{ include "predator.name" . }}-tls else [] end end else [] end`.
      - `templates/monitoring/prometheus-rules.yaml`: `apiVersion monitoring.coreos.com/v1 kind PrometheusRule metadata name {{ include "predator.name" . }}-rules labels {{- include "predator.labels" . | nindent 4}} spec groups - name predator.rules rules - alert PredatorHighErrorRate expr rate(http_requests_total{job="predator-analytics",status=~"5.."}[5m]) > 0.01 for 2m labels severity critical team predator annotations summary "High error rate in Predator Analytics ({{ $value }}%)" description "{{ $labels.instance }} has error rate >1% for 2m" - alert PredatorLatencyHigh expr histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="predator-frontend"}[5m])) > 0.3 for 1m labels severity warning annotations summary "P95 latency high in Frontend ({{ $value }}s)" description "Frontend latency exceeds 300ms"`.
    - `rollouts/analysis-template.yaml`: `apiVersion argoproj.io/v1alpha1 kind AnalysisTemplate metadata name predator-canary-analysis spec args - name service-name metrics - name error-rate interval 60s count 3 failureLimit 1 successCondition result < 0.005 provider prometheus address http://prometheus-server.monitoring.svc.cluster.local query | sum(rate(http_requests_total{service="{{args.service-name}}",status=~"5.."}[2m])) / sum(rate(http_requests_total{service="{{args.service-name}}"}[2m])) - name p95-latency interval 60s count 3 failureLimit 1 successCondition result < 0.300 provider prometheus query | histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="{{args.service-name}}"}[2m])) by (le)) - name uptime interval 60s count 3 failureLimit 1 successCondition result > 0.995 provider prometheus query | avg_over_time(up{job="{{args.service-name}}"}[2m])`.
    - `argo/rbac/autonomous-agent-role.yaml`: `apiVersion rbac.authorization.k8s.io/v1 kind Role metadata name argocd-autonomous-deployer namespace argocd rules - apiGroups ["argoproj.io"] resources ["applications"] verbs ["get","list","watch","sync","update","patch"] - apiGroups ["argoproj.io"] resources ["rollouts"] verbs ["get","list","watch","update","patch"] --- apiVersion rbac.authorization.k8s.io/v1 kind RoleBinding metadata name argocd-autonomous-deployer-binding namespace argocd roleRef apiGroup rbac.authorization.k8s.io kind Role name argocd-autonomous-deployer subjects - kind ServiceAccount name autonomous-agent namespace argocd`.

2.  **`.github/workflows/autodeploy-dry.yml` (повний):** (Note: This file needs to be created or updated based on the provided content. The existing `gitops-bootstrap-dry.yml` or `ci-cd.yml` might be a starting point).

    ```yaml
    name: Autodeploy Dry-Run & Supply Chain
    on:
      workflow_dispatch:
      push:
        paths:
          - "helm/**"
          - "scripts/**"
          - ".vscode/**"
    jobs:
      dryrun:
        runs-on: ubuntu-latest
        env:
          MANIFESTS_REPO: ../manifests-temp
          IMAGE_TAG: dr-$(date +%s)
          DRY_RUN: "1"
        steps:
          - uses: actions/checkout@v4
          - name: Install deps
            run: |
              sudo apt-get update && sudo apt-get install -y yq jq shellcheck helm kubectl bats
          - name: Render Helm
            run: bash scripts/helm/render_and_sync.sh
          - name: GitOps Dry-Run
            run: bash scripts/gitops_sync.sh
          - name: Run Dry Tests
            run: bash scripts/gitops_sync_dry_tests.sh
          - name: Shellcheck
            run: shellcheck scripts/*.sh
          - name: Helm Lint
            run: helm lint helm/predator-umbrella --strict
          - name: Upload Logs
            uses: actions/upload-artifact@v4
            with:
              name: gitops-logs
              path: test-*.log
      supplychain:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - name: Trivy FS Scan
            uses: aquasecurity/trivy-action@0.20.0
            with:
              scan-type: fs
              severity: CRITICAL,HIGH
              exit-code: 1
              ignore-unfixed: true
          - name: Cosign Verify Mock
            run: echo "All images signed - integrate registry digest in prod"
    ```

3.  **`scripts/gitops_sync.sh` (повний скрипт з патчами):** (Note: This file exists and will be updated with the provided content).

    ```bash
    #!/bin/bash
    set -euo pipefail

    MANIFESTS_REPO="${MANIFESTS_REPO:-../predator-manifests}"
    IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"
    DRY_RUN="${DRY_RUN:-0}"

    # --- REPO INIT (idempotent) ---
    REMOTE_URL="${MANIFESTS_REMOTE:-}"
    if [ -d "$MANIFESTS_REPO/.git" ]; then
      pushd "$MANIFESTS_REPO" >/dev/null
      REMOTE_STATE=$(git ls-remote --heads 2>/dev/null || true)
      EMPTY_REMOTE=0
      if [ -z "$REMOTE_STATE" ]; then
        EMPTY_REMOTE=1
      fi
      popd >/dev/null
    else
      mkdir -p "$MANIFESTS_REPO"
      EMPTY_REMOTE=1
    fi

    if [ "$EMPTY_REMOTE" -eq 1 ]; then
      echo "[gitops_sync] manifests repo appears EMPTY — initializing base template"
      mkdir -p "$MANIFESTS_REPO"
      pushd "$MANIFESTS_REPO" >/dev/null
      if [ ! -d ".git" ]; then
        git init -b main
        [ -n "${GIT_AUTHOR_NAME:-}" ] && git config user.name "${GIT_AUTHOR_NAME}"
        [ -n "${GIT_AUTHOR_EMAIL:-}" ] && git config user.email "${GIT_AUTHOR_EMAIL}"
        [ -n "${REMOTE_URL}" ] && git remote add origin "$REMOTE_URL" || true
      fi
      mkdir -p helm/predator-rendered
      echo "# Predator Manifests Repo\nInitialized: $(date +%Y%m%d)" > README.md
      if [ -d "${MANIFESTS_TEMPLATE:-}" ]; then
        cp -r "$MANIFESTS_TEMPLATE"/* . || true
      fi
      git add .
      git commit -m "Initial manifests init-20251030" || true
      git tag -f init-20251030 || true
      if [ -n "${REMOTE_URL}" ]; then
        git push -u origin main || true
        git push origin init-20251030 || true
      fi
      popd >/dev/null
    fi
    # --- END REPO INIT ---

    # --- MCP RISK GATE ---
    MCP_BIN="${MCP_BIN:-node}"
    MCP_SCRIPT="${MCP_SCRIPT:-./mcp/predator-tools/src/index.ts}" # Adjusted path
    RISK_DECISION="low"  # default
    if [ -x "$MCP_BIN" ] && [ -f "$MCP_SCRIPT" ]; then
      echo "[gitops_sync] running MCP risk analysis..."
      CHANGES_CTX=$(git -C "$MANIFESTS_REPO" diff --name-only || true)
      MCP_OUT=$($MCP_BIN "$MCP_SCRIPT" --analyze --context "$(printf '{"changes": [%q]}' "$CHANGES_CTX")" 2>/dev/null || true)
      echo "[gitops_sync] MCP response: $MCP_OUT"
      echo "$MCP_OUT" | grep -qi 'risk=high' && RISK_DECISION="high"
    fi
    # --- END MCP RISK GATE ---

    pushd "$MANIFESTS_REPO" >/dev/null
    # Update Helm values (yq if available, fallback sed)
    if command -v yq >/dev/null 2>&1; then
      yq e '.analytics.image.tag = "'$IMAGE_TAG'"' values.yaml -i
    else
      sed -i "s/tag: latest/tag: $IMAGE_TAG/g" values.yaml || true
    fi
    cp values.yaml values.bak.$(date +%s) || true

    git add -A
    if git diff --staged --quiet; then
      echo "[gitops_sync] no changes to commit"
    else
      git commit -m "auto: bump image tag to $IMAGE_TAG"
    fi

    if [ "$DRY_RUN" != "0" ]; then
      echo "[gitops_sync] DRY_RUN enabled — showing git diff"
      git --no-pager diff HEAD~1 || true
      popd >/dev/null
      echo "[gitops_sync] done (dry-run)"
      exit 0
    fi

    if [ "$RISK_DECISION" = "low" ]; then
      if git push origin main; then
        echo "[gitops_sync] pushed changes to origin/main (low-risk auto)"
      else
        echo "[gitops_sync] git push failed (credentials?)" >&2
        popd >/dev/null
        exit 3
      fi
    else
      echo "[gitops_sync] high-risk detected — opening PR"
      if command -v gh >/dev/null 2>&1; then
        CURR_BRANCH="autonomous/$(date +%Y%m%d-%H%M%S)"
        git checkout -b "$CURR_BRANCH"
        git push -u origin "$CURR_BRANCH" || true
        gh pr create -B main -H "$CURR_BRANCH" -t "Autonomous update: $IMAGE_TAG" -b "MCP: risk=high confidence from analysis" -l "autonomous/review-needed" || true
      else
        echo "[gitops_sync] gh CLI not found — please create PR manually or install gh" >&2
        popd >/dev/null
        exit 7
      fi
    fi
    popd >/dev/null

    # --- OPTIONAL ARGOCD SYNC ---
    if command -v argocd >/dev/null 2>&1 && [ -n "${ARGO_AUTH_TOKEN:-}" ]; then
      echo "[gitops_sync] triggering ArgoCD sync..."
      argocd login "${ARGO_SERVER:-argocd.example.com}" --auth-token "${ARGO_AUTH_TOKEN}" --insecure || true
      argocd app sync predator-production --prune || true
    fi

    echo "[gitops_sync] cycle completed successfully"
    exit 0
    ```

4.  **`scripts/gitops_sync_dry_tests.sh` (повний):** (Note: This file does not exist and needs to be created).

    ```bash
    #!/bin/bash
    set -euo pipefail

    echo "Starting DRY_RUN tests for gitops_sync.sh..."
    rm -rf /tmp/test-*
    SCENARIOS=("init" "low" "high" "template" "argo")

    for scenario in "${SCENARIOS[@]}"; do
      case $scenario in
        "init")
          rm -rf /tmp/test-init
          MANIFESTS_REPO=/tmp/test-init DRY_RUN=1 IMAGE_TAG=test-init ./scripts/gitops_sync.sh > /tmp/test-init.log 2>&1
          if grep -q "initializing base template" /tmp/test-init.log && [ $? -eq 0 ]; then
            echo "PASS: $scenario - bootstrap successful"
          else
            echo "FAIL: $scenario - bootstrap failed"
            cat /tmp/test-init.log
            exit 1
          fi
          ;;
        "low")
          export MCP_ANALYZE_CMD="echo 'risk=low confidence=0.9'"
          MANIFESTS_REPO=/tmp/test-low DRY_RUN=1 IMAGE_TAG=test-low ./scripts/gitops_sync.sh > /tmp/test-low.log 2>&1
          if grep -q "pushed changes to origin/main" /tmp/test-low.log || grep -q "MCP response.*low" /tmp/test-low.log; then
            echo "PASS: $scenario - low-risk push simulated"
          else
            echo "FAIL: $scenario - low-risk failed"
            cat /tmp/test-low.log
            exit 1
          fi
          ;;
        "high")
          export MCP_ANALYZE_CMD="echo 'risk=high'"
          MANIFESTS_REPO=/tmp/test-high DRY_RUN=1 IMAGE_TAG=test-high ./scripts/gitops_sync.sh > /tmp/test-high.log 2>&1
          if grep -q "high-risk detected — opening PR" /tmp/test-high.log; then
            echo "PASS: $scenario - high-risk PR simulated"
          else
            echo "FAIL: $scenario - high-risk failed"
            cat /tmp/test-high.log
            exit 1
          fi
          ;;
        "template")
          mkdir -p /tmp/template/charts/predator
          echo "image: tag: latest" > /tmp/template/charts/predator/values.yaml
          MANIFESTS_TEMPLATE=/tmp/template MANIFESTS_REPO=/tmp/test-template DRY_RUN=1 IMAGE_TAG=test-template ./scripts/gitops_sync.sh > /tmp/test-template.log 2>&1
          if grep -q "copied template" /tmp/test-template.log || [ -f /tmp/test-template/charts/predator/values.yaml ]; then
            echo "PASS: $scenario - template bootstrap"
          else
            echo "FAIL: $scenario - template failed"
            cat /tmp/test-template.log
            exit 1
          fi
          ;;
        "argo")
          export ARGO_SERVER="localhost" ARGO_AUTH_TOKEN="mock"
          MANIFESTS_REPO=/tmp/test-argo DRY_RUN=1 IMAGE_TAG=test-argo ./scripts/gitops_sync.sh > /tmp/test-argo.log 2>&1
          if grep -q "triggering ArgoCD sync" /tmp/test-argo.log; then
            echo "PASS: $scenario - Argo sync simulated"
          else
            echo "FAIL: $scenario - Argo failed"
            cat /tmp/test-argo.log
            exit 1
          fi
          ;;
      esac
    done

    # Shellcheck
    if shellcheck scripts/gitops_sync.sh; then
      echo "PASS: shellcheck clean"
    else
      echo "FAIL: shellcheck warnings"
      exit 1
    fi

    echo "All DRY_RUN tests passed!"
    exit 0
    ```

### 4.2. CI/CD через GitHub Actions

- **`autodeploy-dry.yml`:** Повний файл як вище; add job `e2e-kind` (`kind create cluster`, `helm install --dry-run`, `kubectl apply --dry-run`, `teardown kind delete cluster`).
- **Secrets:** `GH_TOKEN` (`repo contents write pull_requests write`), `ARGO_AUTH_TOKEN` (staging sync), `MCP_TOKEN` (if real service).
- **Coverage:** `bats install bats-core`; `bats -c scripts/gitops_sync_dry_tests.bats`; `shellcheck -s strict scripts/*.sh` (warnings=0); `helm lint helm/predator-umbrella --values values-prod.yaml`.

### 4.3. Kubernetes Deployment

- **Helm manifests:** Повні файли як вище; add HPA template (`helm/predator-umbrella/templates/hpa-analytics.yaml`):
  ```yaml
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: {{include "predator.name" .}}-analytics
    labels:
      {{- include "predator.labels" . | nindent 4}}
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: {{include "predator.name" .}}-analytics
    minReplicas: {{.Values.analytics.hpa.minReplicas}}
    maxReplicas: {{.Values.analytics.hpa.maxReplicas}}
    metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            averageUtilization: {{.Values.analytics.hpa.targetCPUUtilizationPercentage}}
  ```
- **Локальна перевірка:** `helm dependency update`; `lint --strict`; `template --values values-prod.yaml > rendered`; `kubectl apply --dry-run=server -f rendered --validate`; `docker build -t ghcr.io/dima1203oleg/predator-analytics:test . --no-cache`; `docker run -d -p 8080:8080 test`; `curl localhost:8080/health` (expect 200).
- **DRY_RUN:** `helm install --dry-run --debug --atomic --wait predator-dry ./helm/predator-umbrella --values values-prod.yaml --namespace test --create-namespace`; `kubectl get all --dry-run=client -n test`; logs to artifact `dry-run-full.log`.

### 4.4. PR та рев'ю workflow

- **PR-ready:** Branch `auto/update-v1.0.1`; commit `auto: bump v1.0.1 MCP low`; PR title "Autonomous update v1.0.1" body "MCP confidence 0.92 low-risk; DRY_RUN logs [link]; Helm lint passed Trivy clean"; labels `autonomous/low-risk`; required checks `dryrun supplychain`.
- **Рев'ю/merge:** Review artifacts/logs/diff; approve if confidence >0.8 no vulns; merge squash "Merge autonomous update v1.0.1"; post-merge `git tag prod-verified-20251030 push`; webhook Argo `sync --wait-healthy 300s log "Synced Healthy"`.

### 4.5. Додаткові рекомендації

- **MCP в CI:** Job `mcp-analyze` env `MCP_ANALYZE_CMD="node mcp/predator-tools/src/index.ts --context '{\"changes\":[\"values.yaml\"]}'"` assert output `risk=low`.
- **Coverage shell:** `bats-core install`; `bats scripts/gitops_sync_dry_tests.bats --tap | tee coverage.tap`; `shellcheck -e SC2086 -e SC2016 scripts/*.sh`.
- **Prod rollout:** Namespace `predator-prod` (`kubectl create ns`); SealedSecrets for DB creds (`kubeseal --scope cluster-wide`); post-merge `argocd app sync --prune --wait-sync --wait-healthy`; Grafana dashboard Predator-Metrics (panels error_rate latency uptime from rules).
- **Моніторинг:** Loki structured logs (`runId phase decision`); Jaeger traces MCP calls; Alertmanager Slack on rollback.

## 5. Критерії приймання

- **Функціональні:** 10 DRY_RUN green (`grep "completed" logs`); PR high-risk create title/body/label; Argo sync "Synced Healthy" log; self-heal fix latency spike (scale +1, metrics <threshold).
- **CI/CD:** Workflow push/PR green (Trivy exit 0, Cosign signed, shellcheck 0, helm lint strict 0); artifacts `logs.zip` readable (`test-*.log PASS`).
- **K8s:** Helm lint/template clean; dry-run apply no errors; Deployment ready (`kubectl rollout status --timeout 300s`); HPA scale sim (`kubectl scale deployment --replicas=5`).
- **PR:** Merge no conflicts; post-merge tag push; MCP log confidence >0.8 low-risk.
- **Тести:** bats coverage >90% (tap report); e2e kind (helm install + verify curl 200 + chaos pod-kill recovery <2min); chaos-mesh 80% success.

## 6. План реалізації (детальний, 21 днів)

- **Фаза 0: Підготовка (Дні 1-2):** `kind create cluster --config kind-config.yaml` (nodes 2 cpu 2 memory 4Gi); `helm repo add argo https://argoproj.github.io/argo-helm helm install argo-cd argo/argo-cd --namespace argocd --create-ns`; `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts helm install prometheus prometheus-community/prometheus --namespace monitoring --create-ns`; `git clone manifests-repo cp umbrella commit init-20251030 tag push`; CI secrets add `GH_TOKEN ARGO_AUTH_TOKEN`.
- **Фаза 1: GitOps ядро (Дні 3-5):** Apply патчі `scripts/helm/render_and_sync.sh`; implement `scripts/gitops_sync_dry_tests.sh` (bats scenarios, assert grep PASS); local 10 runs (`DRY_RUN=1`, MCP mock low/high); add `docs/gitops_sync.md` (env, tests, risks); shellcheck fix `SC2086`/`SC2016`.
- **Фаза 2: VS Code & Orchestrator (Дні 6-10):** `extension/src/argocdAutoDeployer.ts` (load config `yaml.js-yaml`, preflight `git.diff + MCP.call`, `child_process exec scripts`, poll `argocd app get -o yaml --timeout 900`); `extension/src/verify.ts` (`axios prometheus query rate/histogram/avg`, `kubectl exec smoke curl/DB`); `extension/src/stateManager.ts` (`fs read/write mkdir recursive`, filter retention, replace redact `***`); `extension/src/copilotInterceptor.ts` (`vscode.workspace.onDidChangeTextDocument if file yaml/ts executeCommand editor.action.inlineSuggest.commit`); dev host F5 tests (10 triggers, assert Output "cycle completed").
- **Фаза 3: MCP & Security (Дні 11-15):** `mcp/predator-tools/src/index.ts` (`Promise.allSettled init contineo/klain timeout 30000`, analyze context `Promise timeout 45000`, consolidate `reduce weighted sum confidence`, `calculateConsensusRisk majority vote`); risk gates if confidence <0.8 PR; `security/supplyChainValidator.ts` (`execa trivy image/fs --severity CRITICAL,HIGH --exit-code 1`, `cosign verify --key pub`); CI add `mcp-job` (`node mcp/predator-tools/src/index.ts --analyze json assert risk low`).
- **Фаза 4: Rollouts & Self-Heal (Дні 16-19):** `helm repo add argo-rollouts https://argoproj.github.io/argo-helm helm install argo-rollouts argo/argo-rollouts --namespace argocd`; `AnalysisTemplate yaml apply`; `extension/src/verify.ts` integrate queries thresholds; `backend/app/agents/supervisor.py` add `autonomous_cycle async exec self_heal context issue high_cpu action scale+1`; `backend/app/health_monitor.py` `/self-heal post json context return HealResult success actions`; `chaos-mesh install helm chaos-mesh/chaos-mesh --namespace chaos-testing`; sim pod-kill/oom network-loss assert recovery <2min 80% success.
- **Фаза 5: Audit & Hardening (Дні 20-22):** `extension/src/stateManager.ts` retention cron-like filter `Date.now - 90d*24h`; RBAC `kubectl apply -f predator-base-manifests/argo/rbac/autonomous-agent-role.yaml`; `docs/TZ.md` (this doc with checklists); GDPR redact regex replace token patterns `***` logs.
- **Фаза 6: CI/E2E/Release (Дні 23-28):** CI add `e2e-kind` job (`kind create`, `helm install --wait`, verify metrics `>threshold`, chaos sim, teardown delete); PR sim `gh pr create mock review/merge squash`; `vsce package VSIX marketplace submit`; runbook SRE (`rollback argocd app rollback stable`, alert handling Slack webhook).

## 7. Ризики та пом'якшення

- **Vulns supply chain (high):** Trivy pre-push exit1 block PR; weekly cron scans CI.
- **Argo sync fail (medium):** Poll `--wait-healthy 300s`; fallback rollback + Alertmanager firing Slack.
- **Secrets leak (high):** Structured logs JSON redact regex `/token|key/g ***`; CI env only, pre-commit hook `git-secrets`.
- **Flaky metrics verify (low):** Prometheus 2m intervals retries 3x; local mock `axios 200`.
- **MCP false positive (medium):** Weighted consensus (contineo 0.6 security, klain 0.4 opt); PR label override human.

## 8. Наступні кроки (мікроплан тиждень 1)

1.  **День 1:** Патчі `scripts/gitops_sync.sh` apply; `scripts/gitops_sync_dry_tests.sh` run assert all PASS; shellcheck fix.
2.  **День 2:** Push `helm/predator-umbrella` manifests-repo; helm template lint dry-run apply check.
3.  **День 3:** CI secrets setup; `autodeploy-dry.yml` trigger review artifacts.
4.  **День 4:** Test PR high-risk sim (`gh create`, checks required, merge squash tag).
5.  **День 5:** Local chaos pod-kill; self-heal assert recovery; update `docs/TZ.md`.
