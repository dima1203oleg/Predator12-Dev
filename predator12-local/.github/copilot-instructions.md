## Predator12 — Copilot / AI-agent guidance

This file gives focused, actionable context for an AI coding agent (Copilot-style) working in this repository. Keep answers short and reference exact files when you can.

- Big picture: monorepo with three primary domains:
  - `backend/` — FastAPI + Celery workers, agents config under `backend/app/agents/`.
  - `frontend/` — React/Next UI (agent dashboards live in `frontend/src/components/agents/`).
  - `agents/` & `ml/` — orchestration and ML agent code (see `agents/supervisor.py` and `ml/analytics/mas-layer/agents`).

- Key patterns to preserve and reference:
  - Agent configs use `registry.yaml`/`policies.yaml` keys: `competition_models`, `fallback_chain`, `emergency_pool`, `arbiter_model`. (See `agents/supervisor.py` for how these are consumed.)
  - Model routing is competitive: code expects concurrent evaluation and a final arbitration step (look at `ProductionSupervisor.run_model_competition` and `_run_arbitration`).
  - Thermal/availability model: entities (agents/models) have `thermal_status` entries and `cooldown_until`. Avoid changes that break availability checks (`is_entity_available`).

- Developer workflows (concrete commands):
  - Local dev (fast):
    - Setup once: `./scripts/quick-setup.sh`
    - Start backend in debug: `DEBUG_PY=1 ./scripts/start-all.sh` or `uvicorn backend.app.main:app --reload` from `backend` (README has exact commands).
    - Run frontend dev server: `npm run dev` in `frontend/`.
  - Run supervisor locally: `python agents/supervisor.py --mode test` (or `--mode daemon|interactive`).
  - Tests: `pytest` (backend tests live under `backend/tests/`), frontend: `npm test` in `frontend/`.
  - Автогенерація патчів:
    - Dry run (sandbox): VS Code task **"🤖 Agents: Auto Propose (dry-run)"** → викликає `scripts/auto_propose.sh` (див. `docs/autogen-integration.md`).
    - Повністю автономно: VS Code task **"🤖 Agents: Auto Approve (commit)"** → виконує `scripts/auto_approve_and_commit.sh` з тестом `pytest backend/tests`. Guardrails описані у `docs/ai-tooling-integration.md`.

- Files and examples to cite when making changes:
  - `agents/supervisor.py` — production supervisor (competition / thermal logic)
  - `backend/app/agents/registry.yaml` and `backend/app/agents/policies.yaml` — agent routing and policies
  - `backend/app/workers/celery_app.py` — how background tasks are scheduled
  - `frontend/src/components/agents/agentsRegistry.ts` (or `.js`) — how UI discovers agents
  - `scripts/` — project helper scripts (`start-all.sh`, `quick-setup.sh`, `deploy-argocd-full-stack.sh`)

- Project-specific conventions (do not change without checking tests):
  - New agents: add implementation under `backend/app/agents/handlers/`, register in `registry.yaml`, add policies in `policies.yaml`, and include tests under `tests/agents/`.
  - ETL/ingest contracts: chunked uploads must follow `POST /ingest/upload` and `POST /ingest/commit` flows described in `backend/app/README.md`.
  - Observability and alerts are configured in `observability/prometheus/rules/` — changing metric names requires updates to alerts and dashboards.
  - Повністю автономні зміни повинні залишатися у гілках `auto/*` (див. `scripts/auto_approve_and_commit.sh`); не мерджити в `main` без review.

- When editing code, favored approach:
  1. Point to the smallest files that show the pattern (quote 1–2 function names). Example: "See `ProductionSupervisor.run_model_competition` — keep ThreadPoolExecutor-based evaluation and timeout semantics."
  2. Run unit tests for the module you touched (e.g., `pytest backend/tests/agents/ -k <name>`).
  3. If you change metric names, also update `observability/` rules and Grafana dashboards.

- If uncertain, ask one precise question (file + function) rather than broad multi-part prompts.

-- Quick example: `registry.yaml` fragment (use as a template when adding agents)

```yaml
agents:
  DatasetIngest:
    description: "Ingests chunked datasets and triggers ETL"
    competition_models:
      - "mistralai/mixtral-8x7b-instruct-v0.1"
      - "meta-llama/meta-llama-3-8b-instruct"
    fallback_chain:
      - "microsoft/phi-4-reasoning"
    emergency_pool:
      - "ai21-labs/ai21-jamba-1.5-large"
    arbiter_model: "mistralai/mixtral-8x7b-instruct-v0.1"
    embedding_model: "cohere/cohere-embed-v3-multilingual"
```

-- Quick example: `policies.yaml` fragment (use as a template when adding agent policies)

```yaml
competition_system:
  timeout_seconds: 30
  max_concurrent_competitions: 5

thermal_limits:
  warning_threshold: 0.7
  critical_threshold: 0.85
  emergency_threshold: 0.95
  cooldown_minutes: 5
```

-- VS Code tasks (use these exact labels in suggestions when running local dev):

- "🎯 Start Dev Environment" — runs docker compose dev stack (task: `🎯 Start Dev Environment`).
- "🛑 Stop Dev Environment" — stops dev stack.
- "🐍 Backend: Run Migrations" — runs alembic upgrade in `backend`.
- "🧪 Backend: Run Tests" — runs `pytest backend/tests/` with coverage.
- "🌐 Frontend: Dev Server" — runs `npm run dev` in `frontend` (background).
- "🤖 Agents: Auto Propose (dry-run)" — запускає `scripts/auto_propose.sh` у sandbox і залишає звіт у `.auto_propose_report.txt`.
- "🤖 Agents: Auto Approve (commit)" — застосовує `suggested.patch`, проганяє `pytest backend/tests`, комітить і опційно пушить (див. `docs/ai-tooling-integration.md`).

When suggesting commands, prefer invoking these tasks rather than raw docker-compose commands so the developer can run them via VS Code UI.

-- Додаткові довідники:
- `docs/autogen-integration.md` — інтеграція генераторів патчів і guardrails.
- `docs/ai-tooling-integration.md` — повний план налаштування локальних LLM, VS Code плагінів та автономних сценаріїв.

— End of file —
