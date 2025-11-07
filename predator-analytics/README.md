# Predator Analytics

> AI-Powered Analytics Platform with Interactive 3D Avatar and Multi-Agent System

[![CI](https://github.com/your-org/predator-analytics/workflows/CI/badge.svg)](https://github.com/your-org/predator-analytics/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Особливості

- **3D AI-Аватар** - Інтерактивний 3D-помічник з підтримкою голосових команд
- **Багатоагентна Система** - Спеціалізовані AI-агенти для різних задач
- **Українська Мова** - Повна підтримка TTS/STT українською (uk-UA)
- **Real-time Аналітика** - Дашборди з візуалізацією даних
- **Production-Ready** - Kubernetes, Helm, ArgoCD, Terraform
- **Observability** - Prometheus, Grafana, Loki, Tempo

## 🏗️ Архітектура

### Backend

- **FastAPI** - Асинхронний Python веб-фреймворк
- **Celery** - Розподілена черга завдань
- **Redis** - Кеш та брокер повідомлень
- **PostgreSQL** - Основна база даних
- **Qdrant** - Векторна база даних

### Frontend

- **Next.js 14** - React фреймворк
- **React Three Fiber** - 3D графіка (WebGL/Three.js)
- **TailwindCSS** - Стилізація
- **TypeScript** - Type safety

### AI Agents

1. **ArbiterAgent** - Центральний координатор задач
2. **DatasetInspectorAgent** - Аналіз та перевірка датасетів
3. **DataProcessorAgent** - Обробка даних
4. **ModelTrainerAgent** - Навчання ML-моделей

### Infrastructure

- **Kubernetes** - Оркестрація контейнерів
- **Helm** - Управління пакетами K8s
- **ArgoCD** - GitOps деплоймент
- **Terraform** - Infrastructure as Code

## 🚀 Швидкий Старт

### Локальна Розробка (Docker Compose)

```bash
# Клонуйте репозиторій
git clone https://github.com/your-org/predator-analytics.git
cd predator-analytics

# Створіть .env файл
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Запустіть всі сервіси
docker-compose up -d

# Перевірте статус
docker-compose ps
```

**Доступні сервіси:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Flower (Celery): http://localhost:5555

### Production Deploy (Kubernetes)

```bash
# 1. Підготовка інфраструктури з Terraform
cd terraform
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"

# 2. Deploy з Helm
cd ../helm/predator-analytics
helm dependency update
helm install predator-analytics . \
  -f values.yaml \
  -f values-prod.yaml \
  --namespace predator-analytics-production \
  --create-namespace

# 3. Або з ArgoCD (GitOps)
kubectl apply -f ../argocd/application.yaml
```

## 📦 Структура Проєкту

```
predator-analytics/
├── backend/                    # FastAPI Backend
│   ├── agents/                # AI Agents
│   │   ├── base.py           # Base Agent class
│   │   ├── arbiter_agent.py  # Coordinator
│   │   └── dataset_inspector_agent.py
│   ├── api/                  # API Routes
│   │   └── routes/
│   ├── core/                 # Core modules
│   │   ├── config.py
│   │   ├── database.py
│   │   └── monitoring.py
│   ├── models/               # Database models
│   ├── services/             # Business logic
│   └── requirements.txt
│
├── frontend/                  # Next.js Frontend
│   ├── app/                  # App router
│   │   ├── page.tsx          # Main page with 3D Avatar
│   │   └── dashboard/        # Analytics dashboard
│   ├── components/           # React components
│   │   ├── AIAvatar.tsx      # 3D Avatar
│   │   ├── VoiceControls.tsx
│   │   └── ChatInterface.tsx
│   ├── lib/                  # Utilities
│   └── package.json
│
├── helm/                      # Helm Charts
│   └── predator-analytics/
│       ├── Chart.yaml        # Umbrella chart
│       ├── values.yaml       # Default values
│       ├── values-prod.yaml  # Production values
│       └── charts/           # Subcharts
│           ├── backend/
│           ├── frontend/
│           └── agents/
│
├── terraform/                 # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── production.tfvars
│
├── monitoring/                # Observability
│   ├── prometheus/
│   │   ├── prometheus-rules.yaml
│   │   └── servicemonitor.yaml
│   └── grafana/
│       └── dashboard-overview.json
│
├── argocd/                    # GitOps
│   └── application.yaml
│
├── .github/                   # CI/CD
│   └── workflows/
│       └── ci.yaml
│
└── docker-compose.yml         # Local development
```

## 🔧 Конфігурація

### Environment Variables

**Backend (.env)**

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=predator_analytics

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Voice Services (Ukrainian)
GOOGLE_CLOUD_TTS_API_KEY=your_key
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=westeurope

# Security
KEYCLOAK_URL=http://keycloak:8080
VAULT_ADDR=http://vault:8200
```

**Frontend (.env)**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📊 Моніторинг та SLO

### Service Level Objectives (SLO)

| Метрика            | SLO      | Алерт            |
| ------------------ | -------- | ---------------- |
| API Latency (p95)  | < 200ms  | > 200ms for 5min |
| Success Rate       | > 99.9%  | < 99.9% for 5min |
| Redis Availability | > 99.9%  | < 99.9% for 5min |
| Task Execution     | 99% < 1s | > 1s for 10min   |

### Grafana Dashboards

1. **Overview Dashboard** - Загальні метрики системи
2. **SLO Dashboard** - Статус SLO та error budget
3. **Agents Dashboard** - Метрики AI-агентів
4. **Infrastructure Dashboard** - Ресурси Kubernetes

## 🔐 Безпека

- **Keycloak** - SSO та OAuth2/OIDC аутентифікація
- **Vault** - Управління секретами
- **RBAC** - Role-Based Access Control
- **TLS** - Шифрування трафіку
- **Network Policies** - Ізоляція мережі

## 🎤 Голосовий Інтерфейс

Підтримка українських голосів:

### Google Cloud TTS

- `uk-UA-Wavenet-A` (жіночий, висока якість)
- `uk-UA-Standard-A` (жіночий, стандарт)

### Azure Speech Services

- `uk-UA-PolinaNeural` (жіночий, Neural)
- `uk-UA-OstapNeural` (чоловічий, Neural)

## 📈 Масштабування

### Horizontal Pod Autoscaling (HPA)

```yaml
# Backend: 3-20 pods (CPU 80%, Memory 80%)
# Frontend: 2-10 pods (CPU 70%)
# Agents: 2-5 pods per type
```

### Vertical Pod Autoscaling (VPA)

Автоматична оптимізація ресурсів на основі використання.

## 🧪 Тестування

```bash
# Backend tests
cd backend
pytest tests/ -v --cov

# Frontend tests
cd frontend
npm run test
npm run lint
```

## 📝 API Документація

- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

### Основні Endpoint'и

```bash
# Health check
GET /health

# Agents
GET  /api/v1/agents
POST /api/v1/agents/execute

# Tasks
POST /api/v1/tasks
GET  /api/v1/tasks/{id}

# Analytics
GET /api/v1/analytics/overview

# Voice (Ukrainian TTS/STT)
POST /api/v1/voice/tts
POST /api/v1/voice/stt
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Predator Analytics Team - [team@predator-analytics.io](mailto:team@predator-analytics.io)

## 🔗 Links

- [Documentation](https://docs.predator-analytics.io)
- [GitHub](https://github.com/your-org/predator-analytics)
- [Issues](https://github.com/your-org/predator-analytics/issues)

---

Made with ❤️ in Ukraine 🇺🇦
