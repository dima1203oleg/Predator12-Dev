# GitOps Sync Script (Helm-first Architecture) — Technical Specification

Дата: 30 жовтня 2025 р.

## Мета

`gitops_sync.sh` — автономний GitOps‑контролер для ініціалізації, оновлення та синхронізації Helm‑чартів Predator12.

Його основна функція — забезпечити повний Helm‑first GitOps‑цикл навіть у випадках:

- manifests‑repo порожній або відсутній;
- відсутній remote або SSH, потрібен fallback на HTTPS;
- система потребує рішення push vs PR на основі MCP‑аналізу.

---

## Коротке резюме логіки

1. Helm‑first: скрипт шукає `charts/predator/values.yaml` або `helm/*-rendered/*.yaml` і дає пріоритет Helm‑джерелу істини.
2. Bootstrap manifests‑repo якщо відсутній / порожній: копіювання з `MANIFESTS_TEMPLATE` або створення мінімальної структури (`helm/predator-rendered/`, `README.md`) + `git init -b main` + `commit: init: bootstrap manifests`.
3. MCP hook: викликається `MCP_ANALYZE_CMD` (опц.) → `low` => push, `high|review` => PR.
4. Оновлення образного тега: оновлення `.image.tag` у `charts/predator/values.yaml` (через `yq` або `sed`), або оновлення відрендерених YAML; створення резервних копій `.bak.<ts>`.
5. Dry‑run: `DRY_RUN=1` показує `git diff` без push/PR.
6. Push/PR flow: push до origin/main або HTTPS push за допомогою `MANIFESTS_REMOTE`+`GH_TOKEN`; PR через `gh` CLI при high‑risk.
7. ArgoCD sync: якщо `argocd` CLI та `ARGO_AUTH_TOKEN` доступні — виконати `argocd app sync predator`.

---

## Змінні середовища

- `MANIFESTS_REPO` — шлях до локальної manifests‑репи (default: `../predator-manifests`).
- `MANIFESTS_TEMPLATE` — (опц.) шлях до шаблона Helm manifests для bootstrap.
- `MANIFESTS_REMOTE` — (опц.) HTTPS remote URL для push.
- `GH_TOKEN` — (опц.) GitHub token (secure) для HTTPS push.
- `IMAGE_TAG` — тег Docker‑образу для оновлення.
- `DRY_RUN` — якщо `1`, показати зміни і завершити без push/PR.
- `MCP_ANALYZE_CMD` — (опц.) команда/скрипт що повертає `low` або `high`/`review`.
- `ARGO_SERVER`, `ARGO_AUTH_TOKEN` — (опц.) для ArgoCD login/sync.
- `AUTONOMOUS_MODE` — (опц.) прапорець для розширеної поведінки agent/stateManager.

---

## Детальна логіка та порядок дій

1. **Підготовка:**
   - Якщо `MANIFESTS_REPO` не існує — створити каталог.
   - Якщо `MANIFESTS_REPO` існує, але в ньому немає `.git` — bootstrap: копіювання з `MANIFESTS_TEMPLATE` або створення мінімальної структури.
   - Ініціювати git (`git init -b main`) та зробити commit `init: bootstrap manifests <ts>`.

2. **MCP‑аналіз (опціональний):**
   - Якщо `MCP_ANALYZE_CMD` заданий — виконати і прочитати результат (`low`|`high`).
   - `low` → AUTONOMOUS_PUSH=true; `high` → AUTONOMOUS_PUSH=false.

3. **Helm‑first оновлення:**
   - Якщо знайдено `charts/predator/values.yaml` — backup і оновлення `.image.tag` (через `yq` або sed).
   - Інакше — знайти відрендерені YAML (`helm/*-rendered/*.yaml`) і оновити tags:
     - Спробувати `yq` структурно; якщо не вдається — fallback regex/`perl`.
   - Для кожного відредагованого файлу створити `file.bak.<ts>`.

4. **DRY_RUN:**
   - Якщо `DRY_RUN=1` — показати `git --no-pager diff` і вийти 0.

5. **Commit:**
   - `git add -A` і `git commit -m "auto: bump image tag to $IMAGE_TAG"` (лише якщо є зміни).

6. **Push vs PR (MCP decision):**
   - Якщо AUTONOMOUS_PUSH=true:
     - Якщо `origin` існує — `git push origin main`.
     - Інакше, якщо `MANIFESTS_REMOTE` і `GH_TOKEN` задані — додати remote з токеном і push.
     - Якщо немає — завершити зі зрозумілим повідомленням (не аварійно).
   - Якщо AUTONOMOUS_PUSH=false:
     - Якщо `gh` CLI встановлено — створити гілку `autonomous/update-<IMAGE_TAG>` і `gh pr create`.
     - Інакше — попросити вручну створити PR.

7. **ArgoCD sync (опціонально):**
   - Якщо `argocd` CLI та `ARGO_AUTH_TOKEN` є — `argocd login` + `argocd app sync predator`.

8. **Логування та коди виходу:**
   - Логування в форматі `[gitops_sync] ...`.
   - Коди виходу: 0 (успіх), 3 (push failed), 4 (MANIFESTS_REMOTE заданий але GH_TOKEN відсутній), 5 (немає origin і MANIFESTS_REMOTE), 6 (`gh pr create` failed), 7 (`gh` not found для PR flow).

---

## Безпека та секрети

- Не логувати значення секретів або токенів.
- Використовувати `GH_TOKEN` лише для миттєвого push і не зберігати у конфіг/логах.
- Використовувати VS Code Secret Storage или CI secrets для `GH_TOKEN` / `ARGO_AUTH_TOKEN`.
- RBAC: надати мінімальні права ArgoCD service account для `sync`/`rollback`.
- Supply chain: Trivy + Cosign у CI перед push/PR (block on CRITICAL/HIGH).

---

## Rollouts / Verification / Self‑heal

- Canary strategy: 5% → 25% → 50% → 100% з Prometheus AnalysisTemplate.
- Prometheus thresholds:
  - error_rate (5xx) < 0.5% (0.005)
  - p95 latency < 300ms (0.3s)
  - uptime > 99.5% (0.995)
- Verification steps: Prometheus queries, smoke tests (curl /health, DB checks), if fail → trigger `/health/self-heal` with context or `argocd app rollback`.

---

## Audit / StateManager

- Генерувати `runId` (UUID or timestamp) для кожного запуску.
- Зберігати audit object: `{runId, startedAt, finishedAt, decision, mcp_result, image_tag, git_commit, artifacts, verify_result, errors[]}` у `stateManager` з retention 90 днів.
- Redact PII/tokens in logs.

---

## Acceptance criteria

- Init порожнього `MANIFESTS_REPO` → `main` з commit `init: bootstrap manifests` і тег `init-<date>`.
- `DRY_RUN=1` показує diff без push/PR.
- `MCP_ANALYZE_CMD=echo low` → push у main (за наявності origin або MANIFESTS_REMOTE+GH_TOKEN).
- `MCP_ANALYZE_CMD=echo high` → створюється PR через `gh` CLI (якщо доступний).
- Backup `.bak.<ts>` створені для змінених YAML.
- Якщо `argocd` CLI + `ARGO_AUTH_TOKEN` задано → викликається `argocd app sync predator`.

---

## Recommended tests (локально, zsh / macOS)

1. Empty manifests bootstrap (dry-run):

```bash
rm -rf /tmp/test-manifests
MANIFESTS_REPO=/tmp/test-manifests DRY_RUN=1 IMAGE_TAG=test-$(date +%s) ./scripts/gitops_sync.sh
```

2. Bootstrap with template:

```bash
mkdir -p /tmp/manifests-template/helm/predator-rendered
echo "apiVersion: v1" > /tmp/manifests-template/helm/predator-rendered/predator.yaml
MANIFESTS_TEMPLATE=/tmp/manifests-template MANIFESTS_REPO=/tmp/test-manifests DRY_RUN=1 ./scripts/gitops_sync.sh
```

3. MCP high -> PR flow:

```bash
export MCP_ANALYZE_CMD="bash -c 'echo high'"
MANIFESTS_REPO=/tmp/test-manifests ./scripts/gitops_sync.sh
```

4. HTTPS push (requires GH_TOKEN and MANIFESTS_REMOTE):

```bash
export MANIFESTS_REMOTE="https://github.com/yourorg/predator-manifests.git"
export GH_TOKEN="ghp_xxx"
MANIFESTS_REPO=/tmp/test-manifests MANIFESTS_REMOTE=$MANIFESTS_REMOTE GH_TOKEN=$GH_TOKEN ./scripts/gitops_sync.sh
```

5. ArgoCD sync (optional):

```bash
export ARGO_SERVER="argocd.example.com"
export ARGO_AUTH_TOKEN="..."
MANIFESTS_REPO=/tmp/test-manifests ./scripts/gitops_sync.sh
```

---

## Deployment plan / Roadmap (7–14 days)

1. Implement updated `scripts/gitops_sync.sh` and add `docs/gitops_sync.md` (Day 1–2).
2. Add `MANIFESTS_TEMPLATE` contents or `predator-base-manifests` repo (Day 2–3).
3. Integrate MCP analyzer mock and test push vs PR flows (Day 3–4).
4. Wire `argocd` sync and optional `waitForAppHealthy` (Day 4–5).
5. Add CI dry-run workflow + Trivy (Day 5–7).
6. E2E testing with kind/minikube + rollouts (Day 8–12).
7. Hardening: RBAC, secrets guidance, marketplace packaging (Day 13–14).

---

## Files to add / update

- `scripts/gitops_sync.sh` — updated implementation.
- `docs/gitops_sync_spec.md` — (this file) full spec and instructions.
- `.github/workflows/autodeploy-dry.yml` — dry‑run CI job.
- `predator-base-manifests/` — optional template for bootstrap.

---

## Contacts / ownership

- Owner: Predator Dev Team
- Reviewers: DevOps Lead, Security (Trivy team), Platform team (ArgoCD operator)

---

_Файл згенеровано на основі запиту користувача та наданих фактів про репозиторій. Якщо потрібно — можу автоматично внести зміни в `scripts/gitops_sync.sh` відповідно до специфікації і створити відповідні CI файли._
