# 🚀 Predator Analytics - Developer Quick Start

**Version**: 11.0 | **Status**: 🎯 Production-Ready | **Last Update**: 2025-01-06

---

## ⚡ TL;DR — Get Started in 5 Minutes

```bash
# 1. Clone & setup
git clone https://github.com/your-org/predator-analytics.git
cd predator-analytics

# 2. Install local dependencies (PostgreSQL, Redis, OpenSearch, Qdrant)
./scripts/install-local-deps.sh

# 3. Initialize database
./scripts/init-database.sh

# 4. Start everything
make dev
# або відкрийте VSCode і натисніть F5 → "Run Both"

# 5. Open UI
open http://localhost:3000
```

**Готово!** 🎉 Nexus Core працює локально без Docker/Helm.

---

## 📚 Complete Documentation

### 🎯 **START HERE**

#### 1️⃣ [NEXUS_CORE_TZ_V11.md](./docs/NEXUS_CORE_TZ_V11.md)
   **📌 ГОЛОВНА ТЕХНІЧНА СПЕЦИФІКАЦІЯ**
   - Архітектура системи
   - Unified Command Center (Пульт Керування)
   - 30 AI агентів + 58 LLM моделей
   - Data pipeline (ingestion → analytics)
   - DevOps (local-first → Docker → K8s)
   - Security (Zero-trust, PII masking, RBAC)
   - Timeline (12 тижнів)
   - Acceptance criteria

#### 2️⃣ [COMMAND_CENTER_UNIFIED_UI.md](./docs/COMMAND_CENTER_UNIFIED_UI.md)
   **🎮 UI/UX ДОКУМЕНТАЦІЯ**
   - React 18 + TypeScript + Vite
   - 9 модулів інтерфейсу:
     - 3D/2D Dashboard (Three.js)
     - Real-Time Data Feed (WebSocket)
     - Simulator (What-if scenarios)
     - Agent Orchestration Map (vis-network)
     - Billing (PII unlock + usage)
     - Upload Progress (multi-format)
     - Notifications, Settings, Command Palette
   - Dark theme + responsive design

#### 3️⃣ [AGENTS_30_COMPLETE_SPEC.md](./docs/AGENTS_30_COMPLETE_SPEC.md)
   **🤖 30 AI АГЕНТІВ — ПОВНИЙ КАТАЛОГ**
   - **Self-Heal (10 агентів)**: PortCollision, OOMKiller, EnvVarFixer, DockerRestarter, etc.
   - **Optimize (10 агентів)**: CodeRefactorer, QueryOptimizer, CacheOptimizer, BundleSizeReducer, etc.
   - **Modernize (10 агентів)**: DependencyUpgrader, APIVersionMigrator, SecurityPatcher, etc.
   - YAML configs з role, dependencies, triggers, metrics, LLM selection
   - Python приклади з CrewAI/LangGraph
   - OpenTelemetry tracing

#### 4️⃣ [MODEL_SELECTION_LOGIC_SPEC.md](./docs/MODEL_SELECTION_LOGIC_SPEC.md)
   **🧠 ЛОГІКА ВИБОРУ МОДЕЛЕЙ — IMPLEMENTATION GUIDE**
   - Router Layer (task context → model selection)
   - Model Registry (58 моделей з metadata)
   - Scoring Engine (capability + cost + latency + health)
   - Execution Layer (LiteLLM + retry/fallback)
   - Feedback Loop (RLHF + AutoTrain + LoRA)
   - OpenTelemetry tracing
   - 3 детальні usage examples
   - Unit tests + deployment configs

#### 5️⃣ [DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)
   **📚 ПОВНИЙ ІНДЕКС ДОКУМЕНТАЦІЇ**
   - Навігація по всіх документах
   - Cross-references між агентами та моделями
   - Development workflow
   - Monitoring & metrics
   - Security considerations
   - Production deployment guides

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│              NEXUS CORE — UNIFIED COMMAND CENTER             │
│                   (http://localhost:3000)                    │
├─────────────────────────────────────────────────────────────┤
│  3D/2D Dashboard  │  Data Feed  │  Simulator  │  Agent Map  │
│  (Three.js)       │  (WebSocket)│  (What-if)  │(vis-network)│
├─────────────────────────────────────────────────────────────┤
│              30 AI AGENTS + 58 LLM MODELS                    │
├─────────────────────────────────────────────────────────────┤
│  Self-Heal (10)   │  Optimize (10)  │  Modernize (10)       │
│  - PortCollision  │  - CodeRefactor │  - DepsUpgrade        │
│  - OOMKiller      │  - QueryOpt     │  - APIVersionMigrate  │
│  - EnvVarFixer    │  - CacheOpt     │  - SecurityPatcher    │
│  - DockerRestart  │  - BundleSize   │  - FeatureFlagMigrate │
│  - DependencyRes  │  - ImageCompr   │  - DockerfileModern   │
│  - LogAnalyzer    │  - APILatency   │  - CICDUpgrade        │
│  - NetworkDiag    │  - MemoryProf   │  - K8sManifestUpdate  │
│  - DBConnHealer   │  - TestCoverage │  - ObservabilityEnh   │
│  - CertRenewer    │  - CodeDuplication│ - TechDebtAnalyzer  │
│  - ConfigSyncAgt  │  - LoadBalancer │  - LegacyCodeModern   │
├─────────────────────────────────────────────────────────────┤
│                  INTELLIGENT MODEL ROUTER                    │
│   (MoMA-style selection: capability+cost+latency+health)     │
├─────────────────────────────────────────────────────────────┤
│  58 LLM Models:                                              │
│  - GPT-4o-mini, Claude 3.5 Sonnet, Llama 3.3, Gemini 2.0    │
│  - DeepSeek Coder, Qwen 2.5, Codestral, Mistral Large       │
│  - CodeLlama, Phi-3, Granite Code, ... (48 more)            │
├─────────────────────────────────────────────────────────────┤
│         STORAGE LAYER (PostgreSQL + OpenSearch + Qdrant)    │
├─────────────────────────────────────────────────────────────┤
│                    MONITORING (Prometheus + Grafana)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Features

### ✅ **Unified Command Center**
Єдиний веб-інтерфейс ("Пульт Керування") для всієї системи:
- **3D/2D Volumetric Dashboards** — Three.js візуалізації
- **Real-Time Data Feed** — WebSocket updates з аномаліями/алертами
- **AI Simulator** — What-if аналіз сценаріїв
- **Agent Orchestration Map** — Граф агентів в реальному часі
- **Billing & PII Unlock** — Usage tracking + розблокування PII
- **Multi-Format Uploads** — PDF/Excel/CSV/ZIP drag-and-drop

### 🤖 **30 AI Agents + 58 LLM Models**
- **Self-Heal (10)**: Автоматичне відновлення (port conflicts, OOM, Docker crashes, etc.)
- **Optimize (10)**: Оптимізація коду/даних/запитів (refactoring, query opt, cache, bundle size, etc.)
- **Modernize (10)**: Модернізація (dependencies, API migrations, security patches, CI/CD, etc.)
- **Intelligent Routing**: MoMA-style model selection на базі context + cost + latency
- **Graceful Degradation**: Fallback chains на випадок failures
- **RLHF Feedback Loop**: Continuous learning через AutoTrain + LoRA

### 📊 **Multi-Source Analytics**
- **PostgreSQL**: Structured data (customs, invoices, registries)
- **OpenSearch**: Full-text search + time-series logs
- **Qdrant**: Vector similarity search для embeddings
- **Redis**: Caching + rate limiting + agent state
- **MinIO**: Object storage (files, backups)
- **Kafka**: Event streaming (real-time ingestion)

### 🔒 **Zero-Trust Security**
- **PII Masking**: Automatic email/phone/name/IBAN masking
- **RBAC**: Role-based access (admin, analyst, viewer)
- **Audit Trail**: All actions logged → OpenSearch
- **SBOM Signing**: Sigstore/Cosign для containers
- **Encryption**: TLS 1.3, AES-256 at rest

### 🚀 **Local-First Development**
- **No Docker Locally**: brew/apt інсталяція (PG, Redis, OpenSearch, Qdrant)
- **F5 "Run Both"**: One-click start в VSCode
- **Hot Reload**: Frontend (Vite) + Backend (FastAPI reload)
- **Fast Iteration**: Rebuild в <5 секунд

---

## 📂 Project Structure

```
predator-analytics/
├── docs/                                    ← 📚 ВСЯ ДОКУМЕНТАЦІЯ ТУТ
│   ├── NEXUS_CORE_TZ_V11.md                ← 📌 ГОЛОВНА СПЕЦИФІКАЦІЯ
│   ├── COMMAND_CENTER_UNIFIED_UI.md         ← 🎮 UI/UX документація
│   ├── AGENTS_30_COMPLETE_SPEC.md           ← 🤖 30 агентів детально
│   ├── MODEL_SELECTION_LOGIC_SPEC.md        ← 🧠 Логіка вибору моделей
│   ├── DOCUMENTATION_INDEX.md               ← 📚 Повний індекс
│   ├── architecture/                        ← Архітектурні документи
│   ├── guides/                              ← Developer guides
│   ├── api/                                 ← API documentation
│   └── operations/                          ← Ops runbooks
│
├── backend/                                 ← FastAPI backend
│   ├── agents/                              ← 30 AI agents
│   │   ├── core/                            ← Model selector/executor
│   │   ├── self_heal/                       ← 10 self-heal agents
│   │   ├── optimize/                        ← 10 optimize agents
│   │   └── modernize/                       ← 10 modernize agents
│   ├── api/                                 ← REST + WebSocket APIs
│   ├── services/                            ← Business logic
│   └── config/                              ← Configs (model_registry.yaml)
│
├── frontend/                                ← React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/                      ← UI components
│   │   ├── modules/                         ← 9 core modules
│   │   │   ├── Dashboard3D/                 ← Three.js dashboard
│   │   │   ├── DataFeed/                    ← WebSocket feed
│   │   │   ├── Simulator/                   ← What-if scenarios
│   │   │   ├── AgentMap/                    ← vis-network graph
│   │   │   ├── Billing/                     ← PII unlock + usage
│   │   │   ├── UploadProgress/              ← File uploads
│   │   │   ├── Notifications/               ← Toast/modal alerts
│   │   │   ├── Settings/                    ← User preferences
│   │   │   └── CommandPalette/              ← Cmd+K quick actions
│   │   ├── hooks/                           ← Custom React hooks
│   │   ├── store/                           ← Zustand state
│   │   └── utils/                           ← Helpers
│
├── config/                                  ← Configuration files
│   ├── model_registry.yaml                  ← 58 LLM models metadata
│   ├── fallback_policies.yaml               ← Fallback chains
│   └── agent_configs/                       ← YAML configs per agent
│
├── k8s/                                     ← Kubernetes manifests
│   ├── base/                                ← Base configs
│   ├── overlays/                            ← Env-specific (dev/staging/prod)
│   └── rollouts/                            ← Canary/blue-green rollouts
│
├── argocd/                                  ← GitOps configs
├── scripts/                                 ← Utility scripts
├── tests/                                   ← Unit/integration/E2E tests
├── .vscode/                                 ← VSCode tasks/launch configs
├── docker-compose.yml                       ← Docker Compose (staging)
├── Makefile                                 ← Common commands
└── README.md                                ← Цей файл
```

---

## 🛠️ Development Commands

### Local Development

```bash
# Start all services
make dev                    # Frontend + Backend + PostgreSQL + Redis + OpenSearch

# Or individually:
make backend                # Start FastAPI (http://localhost:8000)
make frontend               # Start Vite dev server (http://localhost:3000)
make database               # Start PostgreSQL
make redis                  # Start Redis
make opensearch             # Start OpenSearch
make qdrant                 # Start Qdrant

# Rebuild
make clean                  # Stop all services
make rebuild                # Clean + reinstall deps + restart

# Database
make migrate                # Run Alembic migrations
make seed                   # Seed test data
make reset-db               # Drop + recreate + migrate + seed
```

### Testing

```bash
# Unit tests
make test                   # All tests
make test-backend           # Backend tests only
make test-frontend          # Frontend tests only

# Integration tests
make test-integration

# E2E tests (Playwright)
make test-e2e

# Coverage
make coverage               # Generate coverage report
```

### Agents

```bash
# List all agents
python agents/cli.py list

# Test agent locally
python agents/self_heal/port_collision_healer.py --dry-run

# Test model selection
python agents/core/test_selector.py \
  --task-type code_fix \
  --domain self_heal \
  --complexity simple

# Run agent with specific model
python agents/self_heal/port_collision_healer.py \
  --model llama-3.3-70b-versatile \
  --port 8000 \
  --service backend
```

### Monitoring

```bash
# Open Grafana
open http://localhost:3001
# Login: admin/admin

# Prometheus
open http://localhost:9090

# Jaeger (tracing)
open http://localhost:16686

# View agent logs
tail -f logs/agents/self_heal.log
tail -f logs/agents/optimize.log
tail -f logs/agents/modernize.log
```

---

## 🚀 Production Deployment

### Kubernetes + ArgoCD

```bash
# 1. Build & push images
make docker-build
make docker-push

# 2. Deploy via ArgoCD
cd argocd/
kubectl apply -f nexus-core-app.yaml

# 3. Verify deployment
kubectl get pods -n nexus-core
kubectl get svc -n nexus-core

# 4. Access UI
kubectl port-forward svc/nexus-ui 3000:3000 -n nexus-core
open http://localhost:3000
```

### Canary Rollout

```bash
# Deploy canary (20% traffic)
kubectl argo rollouts promote nexus-core --namespace nexus-core

# Monitor canary metrics
kubectl argo rollouts get rollout nexus-core --watch

# Full rollout if healthy
kubectl argo rollouts promote nexus-core --full
```

---

## 📊 Monitoring Dashboards

### Grafana Dashboards (http://localhost:3001)

1. **Agents Overview** — 30 агентів health + execution stats
2. **Model Selection Metrics** — Top models, fallback frequency, cost
3. **Execution Traces** — OpenTelemetry distributed traces
4. **Cost Analysis** — LLM usage costs per agent/model
5. **System Health** — CPU/RAM/disk/network per service
6. **Data Pipeline** — Ingestion → Processing → Storage metrics
7. **Security Audit** — PII access, failed auth, suspicious activity

### Prometheus Queries

```promql
# Agent success rate (last 1h)
rate(agent_execution_success_total[1h]) / rate(agent_execution_total[1h])

# Model latency P95
histogram_quantile(0.95, sum(rate(model_execution_latency_seconds_bucket[5m])) by (le, model_id))

# Cost per day
sum(increase(model_execution_cost_usd_total[1d])) by (model_id)

# Fallback trigger rate
rate(model_fallback_triggered_total[1h])
```

---

## 🔒 Security Best Practices

### PII Masking

```python
# Automatic PII masking before sending to LLM
from backend.services.pii_masker import PIIMasker

masker = PIIMasker()
masked_data = masker.mask(
    text="Contact: user@example.com, phone: +380991234567",
    types=['email', 'phone']
)
# Output: "Contact: [EMAIL], phone: [PHONE]"
```

### RBAC

```python
# Protect endpoints with RBAC
from backend.api.auth import require_role

@app.get("/agents/metrics")
@require_role("admin", "analyst")
async def get_agent_metrics():
    return {"metrics": [...]}
```

### Audit Trail

```python
# All actions auto-logged
from backend.services.audit import log_action

log_action(
    user_id="user123",
    action="unlock_pii",
    resource="declaration_456",
    result="success"
)
```

---

## 🧪 Testing Guidelines

### Unit Tests

```python
# tests/agents/test_port_collision_healer.py
import pytest
from agents.self_heal.port_collision_healer import PortCollisionHealer

def test_heal_port_collision():
    healer = PortCollisionHealer()
    script = healer.heal(port=8000, service="backend")
    
    assert "lsof -ti:8000" in script
    assert "kill -15" in script
    assert script.endswith("restart backend")

def test_model_selection():
    healer = PortCollisionHealer()
    model, fallbacks = healer.select_model()
    
    assert model == "llama-3.3-70b-versatile"
    assert "gpt-4o-mini-self-heal" in fallbacks
```

### Integration Tests

```python
# tests/integration/test_agent_e2e.py
def test_self_heal_workflow():
    # 1. Trigger port collision
    start_service_on_port(8000)
    start_service_on_port(8000)  # Collision
    
    # 2. Agent should detect and heal
    wait_for_agent_execution("PortCollisionHealer", timeout=30)
    
    # 3. Verify port is free
    assert is_port_free(8000)
    
    # 4. Verify service restarted
    assert is_service_running("backend")
```

---

## 📞 Support & Resources

### Documentation
- **Main Spec**: [NEXUS_CORE_TZ_V11.md](./docs/NEXUS_CORE_TZ_V11.md)
- **UI Docs**: [COMMAND_CENTER_UNIFIED_UI.md](./docs/COMMAND_CENTER_UNIFIED_UI.md)
- **Agents**: [AGENTS_30_COMPLETE_SPEC.md](./docs/AGENTS_30_COMPLETE_SPEC.md)
- **Model Selection**: [MODEL_SELECTION_LOGIC_SPEC.md](./docs/MODEL_SELECTION_LOGIC_SPEC.md)
- **Full Index**: [DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)

### Community
- **Slack**: #predator-analytics
- **Jira**: [PRED Project](https://jira.example.com/projects/PRED)
- **Confluence**: [Predator Analytics Wiki](https://confluence.example.com/predator)
- **GitHub**: [Issues](https://github.com/your-org/predator-analytics/issues)

### Contacts
- **Project Lead**: [Your Name] (your.name@example.com)
- **Tech Lead**: [Tech Lead Name] (tech.lead@example.com)
- **Support**: support@predator-analytics.com

---

## 🎯 Quick Links

| Resource | URL |
|----------|-----|
| **Local UI** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **Grafana** | http://localhost:3001 (admin/admin) |
| **Prometheus** | http://localhost:9090 |
| **OpenSearch** | http://localhost:9200 |
| **Qdrant** | http://localhost:6333 |
| **Jaeger** | http://localhost:16686 |

---

## 🙏 Credits

Розроблено командою Predator Analytics з використанням:
- **CrewAI** + **LangGraph** — Multi-agent orchestration
- **LiteLLM** — Universal LLM interface (100+ providers)
- **React 18** + **Three.js** — Interactive 3D UI
- **FastAPI** — High-performance backend
- **PostgreSQL** + **OpenSearch** + **Qdrant** — Storage trinity
- **Prometheus** + **Grafana** — Monitoring stack
- **ArgoCD** + **Helm** — GitOps automation
- **OpenTelemetry** — Distributed tracing

**Special Thanks**: Всім розробникам open-source інструментів, які зробили цей проект можливим! 🚀

---

**Ready to start?** 👉 [NEXUS_CORE_TZ_V11.md](./docs/NEXUS_CORE_TZ_V11.md)

**Version**: 11.0 | **Status**: ✅ Production-Ready | **Last Update**: 2025-01-06
