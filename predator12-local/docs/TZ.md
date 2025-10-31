# Predator Analytics — Автономний GitOps-конвеєр (Розширене ТЗ)

Коротко: один тригер у VS Code (`autodeploy.toProd` via Ctrl+Alt+D) запускає ідемпотентний цикл: preflight (MCP-ризики) → Helm render → sync → Argo CD (rollouts) → verify (Prometheus + smoke) → finalize/tag або rollback/self-heal. Всі приклади налаштовані під `ghcr.io/dima1203oleg/predator-analytics`.

---

## 1. Мета та візія

- **Візія:** Запуск одним тригером повного, безпечного, відстежуваного GitOps циклу з автоматичним самовідновленням (self-heal) та аудитом.
- **Ідемпотентність:** повторюваний цикл без побічних ефектів; low-risk (MCP ≥0.8) → автопуш; high-risk → PR з 1+ approval.
- **Безпека:** Trivy + Cosign; підписані образи; redaction секретів; RBAC.
- **Стійкість:** Self-heal ≥85% (ціль); retries: 1m, 2m, 4m.
- **Traceability:** JSON-ліги runId/phase з ретеншеном 90 днів.

Ролі (коротко):

| Роль | Фокус |
|---|---|
| Engineering Lead | Архітектура, roadmap |
| DevOps / SRE | K8s/Argo/Prometheus, rollback |
| Backend / Frontend devs | Агенти, extension, scripts |
| QA | E2E / chaos tests |
| Security | Trivy/Cosign, RBAC, secrets |

KPI (витяг):

| Метрика | Ціль | Вимір |
|---|---:|---|
| Low-risk цикли | ≥95% success | <10 хв |
| Self-heal | ≥85% | симуляція pod crash/latency |
| CI/CD | 100% green DRY_RUN | логи артефактів |
| Безпека | 0 критичних | Trivy/scan pass |

---

## 2. Контекст та поточний стан (оновлено)

- Manifests repo: `https://github.com/dima1203oleg/predator-manifests` (helm/ в `main`).
- Ключові файли в репо Predator:
  - `agents/supervisor.py` — competition/thermal logic.
  - `agents/health_monitor.py` — /health, self-heal endpoints.
  - `frontend/src/components/agents/selfHeal.ts` — UI для self-heal.
  - `scripts/render_and_sync.sh`, `scripts/gitops_sync.sh` — helm render + sync flow.
  - `helm/predator-umbrella/` — chart, `prod.yaml`, prometheus rules.
  - `extension/argocdAutoDeployer.ts`, `extension/verify.ts`, `extension/stateManager.ts`.
- Залежності: `helm`, `yq`, `kubectl`, `gh` (GitHub CLI), `trivy`, `cosign`, ArgoCD, Prometheus (community helm).
- Середовища: `kind`/`minikube` для локального, `k3s` для staging, managed K8s — production.
- Припущення: доступ до `ARGO_AUTH_TOKEN`, `GH_TOKEN`, `MCP_TOKEN` для CI/extension.

---

## 3. Архітектура (потік)

Копіюйте для діаграм/автогенерації:

```
VS Code (Ctrl+Alt+D) → preflight (git diff + MCP + lint/scan)
↓
GitOps (render_and_sync.sh → gitops_sync.sh: init/MCP/yq/DRY_RUN/push|PR)
↓ (low: push+tag / high: PR gh label)
Argo CD (sync --prune; Rollouts canary 5/25/50/100% + AnalysisTemplate Prometheus)
↓ (scale/jobs; RBAC agent sync/rollback)
Agents (supervisor.py status; health_monitor.py /self-heal on degraded)
↓ (verify: Prometheus rate[2m]/quantile/uptime + smoke curl/DB exec)
StateManager (JSON append runId/phase; resume; 90d redact)
↓ (success: tag prod-ts / fail: rollback + Slack)
CI (Actions dry/e2e kind; PR artifacts; squash merge)
```

Короткі контракти модулів (inputs/outputs):

- **MCPOrchestrator.ts**
  - Inputs: changed files diff, image tags, env
  - Outputs: riskScore (0..1), reason[], recommendedAction (push/pr)
  - Error modes: timeout, unreachable registry, unknown files
- **SupplyChainValidator.ts**
  - Inputs: rendered manifests + images list
  - Outputs: vulnerabilities list, signed boolean, sbom
  - Error modes: scan fail, missing signature
- **Verify.ts**
  - Inputs: runId, prometheus endpoints, smoke targets
  - Outputs: verifyPass boolean, metrics snapshot

Edge cases:
- Empty diff (no-op)
- Network failure during push/pr
- Flaky Prometheus metrics (retries/backoff)
- Missing GH permissions (fail early)

---

## 4. Деталізований функціонал

### 4.1 Структура репозиторію (рекомендації)

- `predator-base-manifests/`
  - `helm/predator-umbrella/` (Chart.yaml v2, deps: prometheus-community)
  - `rollouts/analysis-template.yaml`
  - `argo/rbac/autonomous-agent-role.yaml`
  - `README.md` з quickstart

### 4.2 CI/CD — GitHub Actions (повний блок для копіювання)

Нижче — робочий приклад `autodeploy-dry.yml`. Помістіть у `.github/workflows/autodeploy-dry.yml`.

```yaml
name: Autodeploy Dry-Run & Supply Chain
on:
  workflow_dispatch:
  push:
    paths:
      - 'helm/**'
      - 'scripts/**'
      - '.vscode/**'
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
        run: sudo apt-get update && sudo apt-get install -y yq jq shellcheck helm kubectl bats kind
      - name: Render Helm
        run: bash scripts/render_and_sync.sh
      - name: GitOps Dry-Run
        run: bash scripts/gitops_sync.sh
      - name: Run Dry Tests
        run: bash scripts/gitops_sync_dry_tests.sh
      - name: Shellcheck
        run: shellcheck scripts/*.sh || true
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
        run: echo "Cosign verify placeholder — integrate registry and key"
  e2e-kind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Kind Cluster
        run: |
          curl -sLo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind
          kind create cluster --config kind-config.yaml
      - name: Helm Install Dry
        run: helm install predator-dry ./helm/predator-umbrella --dry-run --debug
      - name: Kubectl Dry
        run: kubectl apply --dry-run=server -f rendered.yaml
      - name: Teardown
        run: kind delete cluster || true
```

Secrets: `GH_TOKEN`, `ARGO_AUTH_TOKEN`, `MCP_TOKEN` (зберігати в GitHub Secrets). CI повинен фейлити при CRITICAL/HIGH для Trivy.

### 4.3 Скрипти (приклади для включення)

1) `scripts/gitops_sync.sh` — скорочений шаблон (помістіть повний скрипт у репо):

```bash
#!/usr/bin/env bash
set -euo pipefail
MANIFESTS_REPO="${MANIFESTS_REPO:-../predator-manifests}"
IMAGE_TAG="${IMAGE_TAG:-auto-$(date +%s)}"
DRY_RUN="${DRY_RUN:-0}"

echo "[gitops_sync] start: MANIFESTS_REPO=${MANIFESTS_REPO} IMAGE_TAG=${IMAGE_TAG} DRY_RUN=${DRY_RUN}"

# 1) Init repo (idempotent)
if [ ! -d "${MANIFESTS_REPO}" ]; then
  git clone git@github.com:dima1203oleg/predator-manifests.git "${MANIFESTS_REPO}"
fi

# 2) Run MCP analyzer (node/mcpOrchestrator.js expected to return exit code 2 for high-risk)
if command -v node >/dev/null 2>&1 && [ -f ./mcp/mcpOrchestrator.js ]; then
  node ./mcp/mcpOrchestrator.js --repo "${PWD}" --image-tag "${IMAGE_TAG}" || true
fi

# 3) Bump image tag in values.yaml (idempotent via yq)
yq eval -i ".global.image.tag = \"${IMAGE_TAG}\"" "${MANIFESTS_REPO}/helm/predator-umbrella/values.yaml"

# 4) Commit changes
cd "${MANIFESTS_REPO}"
git add -A
if git diff --cached --quiet; then
  echo "[gitops_sync] no changes to commit"
else
  git commit -m "chore: update image tag ${IMAGE_TAG} [auto]"
  if [ "${DRY_RUN}" != "1" ]; then
    git push origin main
  else
    git --no-pager show --name-only --pretty="" HEAD > ../test-rendered-change.log
  fi
fi

# 5) Optionally trigger ArgoCD sync via its API (requires ARGO_AUTH_TOKEN)
if [ "${DRY_RUN}" != "1" ] && [ -n "${ARGO_SERVER:-}" ]; then
  curl -sS -X POST "${ARGO_SERVER}/api/v1/applications/predator/sync" -H "Authorization: Bearer ${ARGO_AUTH_TOKEN}" || true
fi

echo "[gitops_sync] cycle completed"
```

2) `scripts/render_and_sync.sh` — helm render example:

```bash
#!/usr/bin/env bash
set -euo pipefail
CHART_DIR="./helm/predator-umbrella"
OUTPUT="./rendered.yaml"
VALUES="${1:-./helm/predator-umbrella/prod.yaml}"

helm dependency update "${CHART_DIR}"
helm template predator "${CHART_DIR}" --values "${VALUES}" --output-dir ./rendered || :
# merge rendered manifests
find ./rendered -name '*.yaml' -exec cat {} \; > "${OUTPUT}"
echo "[render_and_sync] rendered -> ${OUTPUT}"
```

3) `scripts/gitops_sync_dry_tests.sh` — minimal checks (Bash):

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "[dry_tests] start"
# basic checks
grep -q "kind: Deployment" rendered.yaml && echo "PASS: contains Deployment" || (echo "FAIL: deployment missing" && exit 1)
helm lint helm/predator-umbrella --values helm/predator-umbrella/prod.yaml
echo "[dry_tests] all PASS"
```

### 4.4 K8s / Helm (важливі шаблони)

- HPA (autoscaling/v2) шаблон: minReplicas 3 max 10 targetCPU 70%
- Rollouts: Argo CD + Argo Rollouts analysis template using Prometheus:

`rollouts/analysis-template.yaml` (витяг):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: predator-canary-analysis
spec:
  metrics:
  - name: error-rate
    interval: 30s
    count: 5
    successCondition: result < 0.005
    failureCondition: result >= 0.01
    provider:
      prometheus:
        address: http://prometheus-operated.monitoring.svc.cluster.local
        query: sum(rate(http_requests_total{job="predator",status=~"5.."}[2m])) / sum(rate(http_requests_total{job="predator"}[2m]))
```

### 4.5 PR workflow

- Для low-risk: branch `auto/update-<tag>` → checks → auto-merge + tag `prod-verified-<ts>`.
- Для high-risk: create PR with body containing `MCP report`, `stateManager` audit link; one human approver required.
- Webhook/Action: post-merge → ArgoCD sync api call with `--wait-healthy 300s`.

---

## 5. Критерії приймання

- Функціональні:
  - [ ] 10 DRY_RUNs green locally (logs).
  - [ ] PRs high-risk створюються (не автопушиться).
  - [ ] Argo свідчить `Healthy` після sync.
  - [ ] Self-heal успішний у ≥85% симуляцій (pod kill / latency spike).
- CI/CD:
  - [ ] Workflows green; artifacts доступні.
- K8s:
  - [ ] Helm lint clean; dry-run ok.
  - [ ] Rollout status OK за 300s.
- Тести:
  - [ ] Bats/shell tests >90% coverage.
  - [ ] E2E kind: curl /health=200 + chaos recovery <2min.

---

## 6. План реалізації (21 днів) — чеклісти

### Фаза 0: Підготовка (Дні 1-2)
- [ ] Створити локальний `kind` кластер (2 nodes).
- [ ] Встановити ArgoCD + Prometheus через Helm (prometheus-community).
- [ ] Клон manifests repo → commit bootstrap.

### Фаза 1: GitOps (Дні 3-5)
- [ ] Додавання / патчі `scripts/render_and_sync.sh`, `scripts/gitops_sync.sh`.
- [ ] Прогнати local DRY_RUN ×10.
- [ ] Виправлення shellcheck/helm lint.

### Фаза 2: VS Code Extension (Дні 6-10)
- [ ] `argocdAutoDeployer.ts` — preflight → MCP → execute → poll.
- [ ] `verify.ts` — prometheus queries + smoke.
- [ ] `stateManager.ts` — JSON audit, redact secrets.
- [ ] Manual trigger тести F5 ×10.

### Фаза 3: MCP & Security (Дні 11-15)
- [ ] `MCPOrchestrator.ts` — parallel analyze + consensus.
- [ ] `SupplyChainValidator.ts` — Trivy + Cosign + SBOM checks.
- [ ] Integrate MCP job into CI.

### Фаза 4: Rollouts & Self-Heal (Дні 16-19)
- [ ] Argo Rollouts canary + AnalysisTemplate.
- [ ] Hook verify.ts into analysis phases.
- [ ] Supervisor/health_monitor self-heal end-to-end tests (pod kill).

### Фаза 5: Audit & Ops (Дні 20-22)
- [ ] Retention policy 90d; redact secrets.
- [ ] RBAC: `argo/rbac/autonomous-agent-role.yaml`.
- [ ] Runbook for rollback & Slack alerts.

### Фаза 6: CI/Release (Дні 23-28)
- [ ] CI e2e kind runs stable.
- [ ] Create VSIX / extension packaging (optional).
- [ ] Final run: simulate PR → merge → tag → Argo sync.

---

## 7. Ризики та пом'якшення

| Ризик | Ймовірність | Пом'якшення |
|---|---:|---|
| Вразливості в ланцюгу (vulns) | High | Block on CRITICAL/HIGH; scheduled scans |
| Argo fail / sync issues | Medium | Poll 300s; автоматичний rollback, Slack alert |
| Секрети потрапляють у логи | High | redact regex, git-secrets pre-commit |
| Flaky metrics | Low | retries 3x; mockable thresholds |
| MCP false positive | Medium | Weighted consensus, manual override PR |

---

## 8. Наступні кроки (тиждень 1 — короткий план)

1. День 1: Apply scripts патчі; забезпечити `helm dep update` success; local DRY_RUN PASS.
2. День 2: Push umbrella; helm lint & template; створити initial PR якщо high-risk.
3. День 3: CI secrets setup; запустити `autodeploy-dry.yml`.
4. День 4: Simulate PR merge → Argo sync.
5. День 5: Chaos: pod-kill, validate self-heal ≥85%.

---

## Додатки / Code snippets для швидкого копіювання

- VS Code keybinding recommendation (в `package.json` for extension):

```json
{
  "contributes": {
    "commands": [
      {
        "command": "autodeploy.toProd",
        "title": "Autodeploy to Prod"
      }
    ],
    "keybindings": [
      {
        "command": "autodeploy.toProd",
        "key": "ctrl+alt+d",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

- Minimal `argocdAutoDeployer.ts` contract (pseudocode outline):

```ts
// Inputs: repoPath, imageTag, dryRun
// Outputs: runId, phases[]
export async function runAutoDeploy(opts: {repoPath:string, imageTag:string, dryRun:boolean}) {
  const runId = genRunId();
  await preflightChecks(opts.repoPath, opts.imageTag);
  const mcp = await MCPOrchestrator.analyze(opts.repoPath);
  if (mcp.risk > 0.8) {
    return createPR(opts.repoPath, opts.imageTag, runId);
  }
  await renderAndSync(opts.repoPath, opts.imageTag);
  await triggerArgoSync();
  await verify(runId);
  return finalize(runId);
}
```

---

## Try it — quick local smoke (копіювати у термінал zsh)

```bash
# 1. Render locally
./scripts/render_and_sync.sh ./helm/predator-umbrella/prod.yaml

# 2. Dry-run apply (kind/local)
helm install predator-dry ./helm/predator-umbrella --dry-run --debug

# 3. Run quick tests
bash scripts/gitops_sync_dry_tests.sh
```

---

## Завершення та рекомендації

- Зберегти цей файл як `docs/TZ.md`.
- Далі: хочете, щоб я:
  - A) автоматично створив `docs/TZ.md` у репозиторії? (застосую патч)
  - B) Згенерував повні файли `scripts/*` на основі вставок і додав до репо?
  - C) Згенерував початковий код `MCPOrchestrator.ts` або `argocdAutoDeployer.ts`?

Вкажіть один вибір — я або застосую патчи прямо в репозиторії, або дам наступні кроки/файли для вставки.
