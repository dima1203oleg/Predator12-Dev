# 🚀 Predator12 - Локальна розробницька версія

> **📚 [INDEX.md](INDEX.md) - Повний навігаційний індекс всієї документації**
>
> **🤖 [AI_STACK_SUMMARY.md](docs/AI_STACK_SUMMARY.md) - Self-Improving AI Stack - Quick Reference**

> **Технічне завдання** - Перехід на локальний dev-режим (без контейнерів) + GitOps для деплойменту + Self-Improving AI Stack

![Development Ready](https://img.shields.io/badge/Development-Ready-blue.svg)
![Version](https://img.shields.io/badge/Version-Dev-orange.svg)
![Local Setup](https://img.shields.io/badge/Local-Setup-green.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-Optimized-purple.svg)
![GitOps](https://img.shields.io/badge/GitOps-ArgoCD-blue.svg)
![AI Stack](https://img.shields.io/badge/AI-Self--Improving-red.svg)

**🎯 ЛОКАЛЬНА РОЗРОБНИЦЬКА ВЕРСІЯ + GITOPS WORKFLOW + AI-DRIVEN OPS**

Налаштування для локальної розробки без контейнерів з повною підтримкою VS Code, автоматичними скриптами, міграцією даних, GitOps workflow для деплойменту з ArgoCD + Helm, та самонавчальним AI стеком з 26+ агентами.

---

## 📚 Документація

### 🎯 START HERE
- **[INDEX.md](INDEX.md)** - 📚 **CENTRAL HUB** - Навігація по всій документації (30+ файлів)
- **[START_HERE.md](START_HERE.md)** - 🎯 Абсолютний початок для новачків

### 🚀 Quick Start Guides
- **[AI_STACK_SUMMARY.md](docs/AI_STACK_SUMMARY.md)** - ⚡ AI Stack за 5 хвилин
- **[GITOPS_QUICKSTART.md](GITOPS_QUICKSTART.md)** - ⚡ GitOps за 10 хвилин
- **[VSCODE_QUICKSTART.md](VSCODE_QUICKSTART.md)** - ⚡ VS Code debug за 3 хвилини
- **[QUICK_START.md](QUICK_START.md)** - 🚀 Загальний швидкий старт

### 🤖 AI & DevOps Stack
- **[SELF_IMPROVING_STACK.md](docs/SELF_IMPROVING_STACK.md)** - 🤖 Повна архітектура AI-driven стеку
- **[AI_DEVOPS_GUIDE.md](docs/AI_DEVOPS_GUIDE.md)** - 📖 AI DevOps практики (26+ агентів)
- **[RUNBOOK_self_healing.md](docs/RUNBOOK_self_healing.md)** - 🚨 Операційний runbook
- **Agent Web UI** - http://localhost:8080 (Real-time моніторинг 26+ агентів)

### 🔧 Development Workflow
- **[GITOPS_ARGO_HELM.md](GITOPS_ARGO_HELM.md)** - 📖 Повний GitOps workflow (Dev → Staging → Prod)
- **[VSCODE_COMPLETE_REPORT.md](VSCODE_COMPLETE_REPORT.md)** - 📖 Повний гайд по VS Code debugging
- **[PYTHON311_MIGRATION_README.md](PYTHON311_MIGRATION_README.md)** - 🐍 Міграція на Python 3.11

### 🛠️ Operations
- **[OPENSEARCH_SETUP_GUIDE.md](OPENSEARCH_SETUP_GUIDE.md)** - 🔍 OpenSearch для macOS
- **[MIGRATION_GUIDE_PYTHON311.md](MIGRATION_GUIDE_PYTHON311.md)** - 📦 Детальна міграція пакетів
- **[LOCAL_DEV_STATUS.md](LOCAL_DEV_STATUS.md)** - 📊 Статус локального середовища

### 📋 Reference
- **[CHEAT_SHEET.md](CHEAT_SHEET.md)** - 💡 Швидкий довідник команд
- **[VSCODE_CHANGES_SUMMARY.md](VSCODE_CHANGES_SUMMARY.md)** - 📝 Зміни VS Code конфігурації

---

## 🚀 Два Режими Роботи

### 1️⃣ Локальна Розробка (Dev Mode)

**Для чого:** Швидка розробка з debugger, hot reload, локальні тести

```bash
# Налаштування (один раз)
./scripts/quick-setup.sh

# Запуск backend з debug
DEBUG_PY=1 ./scripts/start-all.sh

# Або через VS Code
# F5 → "🐍 Python: FastAPI Backend Debug"
```

**Переваги:**
- ✅ Instant debugging (breakpoints, step-through)
- ✅ Hot reload для швидких змін
- ✅ Локальні тести без Docker
- ✅ VS Code інтеграція

**Документація:** [VSCODE_QUICKSTART.md](VSCODE_QUICKSTART.md)

---

### 2️⃣ GitOps Deployment (Production Mode)

**Для чого:** Автоматизований деплоймент у Kubernetes через Git

```bash
# Встановлення ArgoCD (один раз)
./scripts/argocd-setup.sh

# Створення Helm charts (один раз)
./scripts/create-helm-structure.sh

# Deploy через Git commit
git add helm/charts/backend/
git commit -m "feat: new API endpoint"
git push
# ArgoCD автоматично синхронізує зміни!
```

**Переваги:**
- ✅ Git як single source of truth
- ✅ Автоматична синхронізація (dev → staging → prod)
- ✅ Rollback через Git history
- ✅ Observability з Prometheus/Grafana

**Документація:** [GITOPS_QUICKSTART.md](GITOPS_QUICKSTART.md)

---

## 🚀 Quick Start

### Локальна Розробка

```bash
# 1. Створити віртуальне середовище
cd backend
python3.11 -m venv .venv
source .venv/bin/activate

# 2. Встановити залежності
pip install -r requirements-311-modern.txt

# 3. Налаштувати .env
cp .env.example .env
# Відредагувати .env

# 4. Запустити з debug
# Варіант A: Через скрипт
DEBUG_PY=1 ../scripts/start-all.sh

# Варіант B: Через VS Code
# F5 → Вибрати "🐍 Python: FastAPI Backend Debug"
```

### GitOps Deployment

```bash
# 1. Встановити ArgoCD
./scripts/argocd-setup.sh
# Відкрити https://localhost:8080

# 2. Створити Helm structure
./scripts/create-helm-structure.sh

# 3. Deploy
kubectl apply -f argo/app-backend-dev.yaml

# 4. Моніторити
argocd app get predator-backend-dev
```

---

## 🚀 Ключові Особливості

- **🤖 Мультиагентна система** - 16 спеціалізованих AI-агентів для різних завдань
- **🔄 Автоматичне самовідновлення** - AutoHeal система з Prometheus/Alertmanager
- **🔒 Безпека та PII** - Маскування чутливих даних, контроль доступу
- **📊 Повне спостереження** - Prometheus, Grafana, Loki, Tempo
- **🔍 Розширений пошук** - OpenSearch з індексацією PostgreSQL
- **🧠 Машинне навчання** - MLflow, моделі для аномалій та прогнозування  
- **🔗 MCP інтеграція** - Робота з GitHub Copilot у VS Code
- **📈 ETL процеси** - Автоматизована обробка та індексація даних
- **⚡ Контейнеризація** - Docker Compose + DevContainer

## 📋 Зміст

- [Швидкий старт](#-швидкий-старт)
- [Архітектура](#️-архітектура)
- [Агенти та моделі](#-агенти-та-моделі)
- [Налаштування](#️-налаштування)
- [API документація](#-api-документація)
- [Моніторинг](#-моніторинг)
- [Безпека](#-безпека)
- [Розробка](#-розробка)
- [Деплой](#-деплой)

## 🚀 Швидкий старт

### Вимоги

- Docker 20.10+ і Docker Compose v2
- 8+ GB RAM, 4+ CPU cores
- VS Code з розширенням Dev Containers (рекомендовано)
- Python 3.11+, Node.js 18+ (для локальної розробки)

### Установка

1. **Клонування та настройка**

   ```bash
   git clone <repository-url> predator11
   cd predator11
   
   # Автоматичне налаштування системи
   make setup
   ```

2. **Конфігурація змінних**

   ```bash
   # Відредагуйте .env файл з вашими токенами
   nano .env
   
   # Встановіть обов'язкові змінні:
   # GITHUB_TOKEN, OPENAI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
   ```

3. **Запуск системи**

   ```bash
   # Запуск всіх сервісів
   make start
   
   # Перевірка системи  
   make test-system
   ```

4. **Доступ до інтерфейсів**
   - **Frontend**: <http://localhost:3000>
   - **API**: <http://localhost:8000>
   - **Grafana**: <http://localhost:3001> (admin/admin)
   - **Keycloak**: <http://localhost:8080> (admin/admin)
   - **OpenSearch**: <http://localhost:9200>

### VS Code Dev Container

```bash
# Відкрити у VS Code
code .

# VS Code автоматично запропонує відкрити у Dev Container
# Або використовуйте Command Palette: "Dev Containers: Reopen in Container"
```

## 🏗️ Архітектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  Agent System   │
│   React/Next    │◄──►│   FastAPI       │◄──►│   Supervisor    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Data Layer    │  Observability  │      Infrastructure         │
│                 │                 │                             │
│ • PostgreSQL    │ • Prometheus    │ • Keycloak (Auth)          │
│ • OpenSearch    │ • Grafana       │ • MinIO (Storage)          │
│ • Redis         │ • Alertmanager  │ • Nginx (Proxy)            │
│ • Qdrant        │ • Loki (Logs)   │ • AutoHeal                 │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Основні компоненти

- **Backend** - FastAPI з Celery для асинхронних завдань
- **Frontend** - React/Next.js з Tailwind CSS
- **ETL** - Автоматизована індексація PostgreSQL → OpenSearch
- **ML Pipeline** - MLflow для експериментів та деплою моделей
- **Agent System** - 16 спеціалізованих агентів з Supervisor
- **Observability** - Повний стек моніторингу та логування

## 🤖 Агенти та Моделі

### Основні агенти

| Агент | Призначення | Primary Model | Fallback Models |
|-------|-------------|---------------|-----------------|
| **NEXUS_SUPERVISOR** | Головний координатор | meta/llama-3.1-405b | mistral-large-2411, phi-4 |
| **DatasetIngestAgent** | Завантаження даних | phi-4-reasoning | gpt-4o-mini, llama-3.1-8b |
| **IndexerAgent** | Індексація з PII | llama-3.1-8b | phi-4-mini |  
| **SearchPlannerAgent** | Планування запитів | phi-4-reasoning | mistral-large-2411 |
| **AnomalyAgent** | Виявлення аномалій | deepseek-v3 | phi-4-reasoning |
| **AutoHealAgent** | Самовідновлення | gpt-4o-mini | codestral-2501, phi-4-mini |

### Розподіл моделей

Система використовує 58 доступних LLM моделей з автоматичним роутингом за:

- **Якість** (40%) - точність відповідей
- **Латентність** (30%) - швидкість відповіді  
- **Вартість** (30%) - ціна API запитів

```yaml
# Приклад конфігурації у registry.yaml
agents:
  AnomalyAgent:
    primary_model: deepseek/deepseek-v3-0324
    fallback_models:
      - microsoft/phi-4-reasoning
    embedding_model: cohere/cohere-embed-v3-multilingual
```

## ⚙️ Налаштування

### Змінні оточення (.env)

```bash
# Основні API
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
BING_SUBSCRIPTION_KEY=xxxxxxxxxxxxx

# Бази даних
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/predator11
OPENSEARCH_URL=http://opensearch:9200
REDIS_URL=redis://redis:6379

# Телеграм сповіщення
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-1001234567890

# Безпека
JWT_SECRET_KEY=your-super-secret-jwt-key-here
PII_SALT=random-salt-for-pii-hashing

# Налаштування агентів
SELF_IMPROVEMENT_ENABLED=true
AUTO_HEAL_ENABLED=true
RED_TEAM_ENABLED=false
```

### Розширене налаштування

Детальну конфігурацію можна знайти у файлах:

- `backend/app/agents/registry.yaml` - призначення моделей агентам
- `backend/app/agents/policies.yaml` - політики та ліміти
- `observability/prometheus/rules/alerts.yml` - правила алертів

## 📚 API Документація

### Основні ендпоінти

```bash
# Здоров'я системи
GET /health

# Чат з агентами
POST /api/v1/chat
{
  "message": "Яка столиця України?",
  "agent": "NEXUS_SUPERVISOR",
  "history": []
}

# Статус агентів
GET /api/v1/agents/status
GET /api/v1/agents/{agent_name}/status

# Керування самовдосконаленням
POST /api/v1/agents/supervisor/start_self_improve
POST /api/v1/agents/supervisor/stop_self_improve

# ETL операції
POST /api/v1/etl/index
GET /api/v1/etl/status

# Пошук
POST /api/v1/search
{
  "query": "пошуковий запит",
  "index": "customs_safe_current",
  "filters": {}
}
```

### MCP інтеграція

Для роботи з GitHub Copilot у VS Code:

1. Переконайтеся, що MCP сервер запущено
2. Відкрийте VS Code Copilot Chat  
3. Увімкніть Agent Mode
4. Оберіть "Predator AI Server"

Команди MCP:

- `/help` - список команд
- `/status` - статус системи
- `/agents` - активні агенти
- `/search <query>` - пошук у даних

## 📊 Моніторинг

### Grafana дашборди

- **System Overview** - загальний стан системи
- **Agent Performance** - метрики агентів
- **OpenSearch Cluster** - стан кластера
- **ETL Pipeline** - статус ETL процесів

### Prometheus метрики

```prometheus
# Приклади метрик
agent_response_time_seconds{agent_name="NEXUS_SUPERVISOR"}
pii_detection_failures_total
etl_records_processed_total
model_inference_duration_seconds{model_name="phi-4-reasoning"}
```

### Алерти та сповіщення

Система автоматично надсилає критичні алерти у Telegram:

- 🚨 **CRITICAL** - падіння сервісу, помилки PII
- ⚠️ **WARNING** - високе навантаження, довгі відповіді
- 🔧 **AutoHeal** - автоматичне відновлення

## 🔒 Безпека

### PII захист

Система автоматично маскує чутливі дані:

```
# Приклад маскування:
company_name: "ТОВ Приклад" => company_mask: "a1b2c3d4"
edrpou: "12345678" => edrpou_mask: "e1f2g3h4"
```

### Індекси безпеки

- `*_safe_*` - замасковані дані (доступ за замовчуванням)
- `*_restricted_*` - повні дані (роль `view_pii`)

### Аудит доступу

Всі доступи до PII логуються у `audit_pii_access`:

```sql
SELECT user_id, accessed_at, data_type, purpose 
FROM audit_pii_access 
WHERE accessed_at > NOW() - INTERVAL '24 hours';
```

## 💻 Розробка

### Локальна розробка

```bash
# Встановлення залежностей
make install

# Запуск у режимі розробки
make dev-setup

# Лінтинг коду
make lint

# Тестування
make test

# Оболонка розробки
make dev-shell
```

### Структура проєкту

```
predator11/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── agents/    # AI агенти
│   │   ├── api/       # API ендпоінти  
│   │   ├── core/      # Основна логіка
│   │   └── models/    # Моделі даних
├── frontend/          # React frontend
├── etl/               # ETL процеси
├── ml/                # ML пайплайни
├── observability/     # Моніторинг
├── scripts/           # Допоміжні скрипти
└── docs/              # Документація
```

### Додавання нового агента

1. Створіть клас агента у `backend/app/agents/handlers/`
2. Додайте конфігурацію у `registry.yaml`
3. Налаштуйте політики у `policies.yaml`
4. Додайте тести у `tests/agents/`

## 🚀 Деплой

### Розробка

```bash
make quick-deploy
```

### Продакшн

```bash
# Підготовка
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Деплой
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Перевірка
make health-check
```

### Kubernetes (Helm)

```bash
# Встановлення через Helm
helm install predator11 ./infra/helm/predator11

# Оновлення
helm upgrade predator11 ./infra/helm/predator11
```

## 🛠️ Команди Makefile

| Команда | Опис |
|---------|------|
| `make setup` | Повне налаштування системи |
| `make start` | Запуск всіх сервісів |
| `make test-system` | Комплексне тестування |
| `make agents-status` | Статус агентів |
| `make monitoring` | Відкрити моніторинг |
| `make backup` | Резервне копіювання |
| `make clean` | Очистка системи |

## 📖 Документація

- [Архітектура системи](docs/architecture.md)
- [Конфігурація агентів](docs/agents.md)
- [ETL процеси](docs/etl.md) 
- [Безпека та PII](docs/security.md)
- [Моніторинг та алерти](docs/monitoring.md)
- [MCP інтеграція](docs/mcp.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🐛 Усунення неполадок

### Загальні проблеми

**Сервіси не запускаються:**

```bash
# Перевірити логи
make logs

# Перевірити ресурси
docker system df
free -h
```

**Агенти не відповідають:**

```bash
# Перезапуск агентів
make agents-restart

# Перевірка статусу
make agents-status
```

**Помилки PII маскування:**

```bash
# Перевірити конфігурацію
python3 scripts/indexing/discover_pg_schema.py --dry-run

# Тестування маскування  
python3 -c "from backend.app.core.pii import mask_pii; print(mask_pii('test data'))"
```

### Логи та діагностика

```bash
# Системні логи
make export-logs

# Логи конкретного сервісу
docker-compose logs -f backend

# Діагностика агентів
curl http://localhost:8000/api/v1/agents/diagnosis
```

## 🤝 Внесок

1. Fork репозиторію
2. Створіть feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit зміни (`git commit -m 'Add some AmazingFeature'`)
4. Push у branch (`git push origin feature/AmazingFeature`)
5. Відкрийте Pull Request

## 📄 Ліцензія

Цей проект ліцензовано під [MIT License](LICENSE).

## 📞 Підтримка

- **Issues**: [GitHub Issues](../../issues)
- **Документація**: [docs/](docs/)  
- **Email**: support@predator11.ai

---

**Predator11** - Потужна AI платформа для сучасної аналітики даних 🚀

---

## 🚀 GitOps/ArgoCD Production Deployment

Predator12 now includes a **complete production-grade GitOps stack** with ArgoCD for automated, secure, and observable deployments.

### Quick Start

```bash
# Deploy full ArgoCD stack (5 minutes)
./scripts/deploy-argocd-full-stack.sh dev

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Open: https://localhost:8080

# Run acceptance tests
python3 scripts/test-argocd-acceptance.py
```

### What's Included

- ✅ **Complete ArgoCD Setup**: Multi-environment (dev/staging/prod)
- ✅ **Progressive Delivery**: Argo Rollouts with canary deployments
- ✅ **Security**: Sealed Secrets, OPA/Gatekeeper, RBAC
- ✅ **Monitoring**: Prometheus metrics, alerts, Grafana dashboards
- ✅ **Automation**: Pre/Post sync hooks, self-healing
- ✅ **Documentation**: Complete guides and runbooks

### Key Features

| Feature | Description |
|---------|-------------|
| **ApplicationSets** | Auto-generate apps for all environments |
| **Canary Rollouts** | Progressive delivery with automatic rollback |
| **Drift Detection** | Automatic sync on configuration drift |
| **Sync Hooks** | Pre-sync migrations, post-sync tests |
| **RBAC** | Role-based access (Admin, Developer, Operator) |
| **Sealed Secrets** | Encrypted secrets in Git |
| **Policy Enforcement** | OPA/Gatekeeper for security policies |
| **Monitoring** | 12+ Prometheus alerts, ServiceMonitors |

### Documentation

- 📖 [GitOps Quick Start](GITOPS_QUICKSTART.md) - Get started in 5 minutes
- 📘 [ArgoCD Complete Guide](docs/ARGOCD_COMPLETE_GUIDE.md) - Full setup and usage
- 📗 [Deployment Runbook](docs/RUNBOOK_deployment.md) - Production procedures
- 📕 [Self-Improving Stack](docs/SELF_IMPROVING_STACK.md) - AI-driven automation

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitOps Flow                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Git Repo ──▶ ArgoCD ──▶ Kubernetes ──▶ Monitoring        │
│     │           │            │                              │
│     └───────────┴────────────┘                              │
│        Drift Detection + Self-Heal                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
