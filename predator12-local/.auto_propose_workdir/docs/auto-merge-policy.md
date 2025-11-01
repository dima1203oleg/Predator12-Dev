# Auto‑merge policy and deployment guide

Цей документ описує безпечний шаблон для автоматичного мерджу Pull Requests (auto‑merge) з додатковими гарантіями: MCP, supply‑chain скани, CI checks та audit.

Важливо: цей репозиторій містить лише шаблон. Перед увімкненням в продакшн забезпечте налаштування секретів і branch protection.

Prerequisites

- Встановити секрет `AUTO_MERGE_BOT_TOKEN` у GitHub Secrets (recommend: bot account token з мінімальними scope `repo:status, pull_request, contents, checks`). Якщо не вказано, workflow використовує `GITHUB_TOKEN` (має обмежений scope в `pull_request_target`).
- Налаштувати branch protection на `main` з required checks (CI, lint, dry-run) та мінімум required reviews (на випадок override).
- Додати label `autonomous/allow-auto-merge` для PR, які дозволено автомерджити.

How it works (summary)

- Workflow `.github/workflows/auto-merge-safe.yml` запускається на `pull_request_target` та `workflow_dispatch`.
- Коли PR має label `autonomous/allow-auto-merge`, запускається перевірка `scripts/auto_merge_condition_check.sh` яка:
  - Перевіряє всі `check-runs` для HEAD SHA і вимагає `conclusion: success`.
  - Опційно запускає MCP аналіз (якщо увімкнено та доступний локальний скрипт `core/mcpOrchestrator.js`).
  - Опційно перевіряє supply chain (Trivy/Cosign) — ця частина в шаблоні відключена і повинна бути реалізована відповідно до вашого процесу.
  - Якщо всі перевірки пройдені — зберігає audit JSON у `/.auto_merge_audit/` і повертає успіх.
- Після успішної перевірки job виконує merge PR методом `squash`.

Security notes & recommendations

- Не давайте широкі права токенам: створіть окремий bot‑account з мінімальними правами.
- Встановіть branch protection і забороніть прямі push у `main`.
- Завжди вимагайте наявність лейблу `autonomous/allow-auto-merge` перед автомерджем (людина додає label після верифікації результатів).
- Налаштуйте Trivy/Cosign у CI для перевірки артефактів та доповніть `scripts/auto_merge_condition_check.sh` реальними перевірками.

Operational checklist before enabling

1. Create GitHub Secret `AUTO_MERGE_BOT_TOKEN` (bot account token).
2. Protect `main` branch with required checks and at least 1 reviewer (optional: allow auto-merge for special teams).
3. Configure CI jobs to produce check‑runs on commits (CI must create checks with `conclusion: success`).
4. Optionally implement MCP analyzer and Trivy/Cosign steps and set `SKIP_MCP=false` and `SKIP_SUPPLYCHAIN=false` in workflow env.
5. Test in a sandbox repo: create PR, label with `autonomous/allow-auto-merge`, ensure flow merges only when conditions met.

Rollback and audit

- All auto‑merge decisions are logged to `/.auto_merge_audit/<runId>.json` in the workspace during the run. Consider shipping these logs to centralized storage (S3/Elasticsearch) or attaching as artifacts.
- If a bad merge happens, use GitHub to revert the merge or ArgoCD to rollback the deployed changes.

Next steps I can take

- Create a PR adding the workflow, script and this doc into `auto/auto-merge-safety` branch (ready).
- Extend `scripts/auto_merge_condition_check.sh` to run real Trivy/Cosign checks and MCP integration (requires tools in CI and/or secrets).
- Add GitHub Action to upload audit artifacts and notify Slack on merge.
