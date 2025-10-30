# Predator Analytics - Архітектура Системи

## 📐 Загальна Архітектура

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface Layer                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐        ┌──────────────────┐                 │
│  │  Next.js Frontend │◄─────►│  3D Avatar       │                 │
│  │  (React)          │        │  (Three.js/R3F)  │                 │
│  └──────────────────┘        └──────────────────┘                 │
│           │                            │                            │
│           │  HTTP/WebSocket            │  Voice (TTS/STT)          │
│           ▼                            ▼                            │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    API Gateway / Ingress                      │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Layer (Backend)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Application                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │  Agents API  │  │  Tasks API   │  │  Voice API   │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │    │
│  │  │Analytics API │  │  Auth API    │  │  Health API  │    │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │    │
│  └───────────────────────────────────────────────────────────┘    │
│                      │              │              │                │
│                      ▼              ▼              ▼                │
│         ┌────────────────────────────────────────────────┐        │
│         │           Business Logic Layer                  │        │
│         │  ┌────────────┐  ┌────────────┐  ┌─────────┐  │        │
│         │  │  Services  │  │  Managers  │  │ Helpers │  │        │
│         │  └────────────┘  └────────────┘  └─────────┘  │        │
│         └────────────────────────────────────────────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AI Agents Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                     Arbiter Agent (Coordinator)               │ │
│  │                                                                │ │
│  │  Delegates tasks to specialized agents based on:             │ │
│  │  • Task type                                                  │ │
│  │  • Agent availability                                         │ │
│  │  • Priority and load balancing                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                      │               │               │              │
│                      ▼               ▼               ▼              │
│  ┌───────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │  Dataset      │  │  Data       │  │  Model Trainer       │    │
│  │  Inspector    │  │  Processor  │  │  Agent               │    │
│  │  Agent        │  │  Agent      │  │                      │    │
│  │               │  │             │  │  • Train models      │    │
│  │  • Validate   │  │  • Clean    │  │  • Hyperparameter    │    │
│  │  • Analyze    │  │  • Transform│  │    tuning            │    │
│  │  • Report     │  │  • Enrich   │  │  • Evaluation        │    │
│  └───────────────┘  └─────────────┘  └──────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Task Queue Layer (Celery)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Worker 1  │  │  Worker 2  │  │  Worker 3  │  │  Worker N  │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│         │               │               │               │           │
│         └───────────────┴───────────────┴───────────────┘           │
│                              │                                       │
│                              ▼                                       │
│                    ┌──────────────────┐                            │
│                    │  Redis (Broker)  │                            │
│                    └──────────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Layer                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │  PostgreSQL   │  │  Redis        │  │  Qdrant            │    │
│  │  (Main DB)    │  │  (Cache)      │  │  (Vector DB)       │    │
│  │               │  │               │  │                    │    │
│  │  • Tasks      │  │  • Sessions   │  │  • Embeddings      │    │
│  │  • Agents     │  │  • Queues     │  │  • Semantic Search │    │
│  │  • Users      │  │  • Rate Limit │  │  • Similarity      │    │
│  │  • Analytics  │  │               │  │                    │    │
│  └───────────────┘  └───────────────┘  └────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  External Services Layer                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │  Google Cloud │  │  Azure Speech │  │  OpenAI / LLMs     │    │
│  │  TTS/STT      │  │  Services     │  │                    │    │
│  │  (uk-UA)      │  │  (uk-UA)      │  │  • GPT-4           │    │
│  └───────────────┘  └───────────────┘  │  • Claude          │    │
│                                         │  • Gemma/LLaMA     │    │
│  ┌───────────────┐  ┌───────────────┐  └────────────────────┘    │
│  │  Keycloak     │  │  HashiCorp    │                             │
│  │  (Auth/SSO)   │  │  Vault        │                             │
│  │               │  │  (Secrets)    │                             │
│  └───────────────┘  └───────────────┘                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Observability Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │  Prometheus   │  │  Grafana      │  │  Loki              │    │
│  │  (Metrics)    │  │  (Dashboards) │  │  (Logs)            │    │
│  └───────────────┘  └───────────────┘  └────────────────────┘    │
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐                             │
│  │  Tempo        │  │  AlertManager │                             │
│  │  (Tracing)    │  │  (Alerts)     │                             │
│  └───────────────┘  └───────────────┘                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User Interaction Flow

```
User → Frontend (3D Avatar) → Voice Input (STT)
                            ↓
                      Text Command
                            ↓
                      Backend API
                            ↓
                      Arbiter Agent
                            ↓
              ┌─────────────┴─────────────┐
              ▼                           ▼
     Specialized Agent            Direct Response
              ↓                           ▼
         Process Task                Backend API
              ↓                           ↓
         Return Result                Frontend
              ↓                           ↓
         Backend API               Voice Output (TTS)
              ↓                           ↓
          Frontend ────────────────────► User
```

### 2. Task Processing Flow

```
API Request → Create Task (DB) → Celery Queue
                                       ↓
                                  Worker Picks Task
                                       ↓
                                  Execute Agent
                                       ↓
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
                   Success                        Failure
                        ↓                             ↓
              Update Task Status              Retry Logic
                        ↓                             ↓
              Return Result                   Max Retries?
                        ↓                             ↓
              Notify User                      Mark Failed
```

### 3. Monitoring Flow

```
Application → Metrics (Prometheus format)
                            ↓
                      Prometheus Scrapes
                            ↓
                      Store Metrics
                            ↓
              ┌─────────────┴─────────────┐
              ▼                           ▼
    Grafana Visualizes           Alert Rules Evaluate
              ↓                           ↓
         Dashboards                  Alerts Fire
              ↓                           ↓
          Users                    AlertManager
                                          ↓
                                   Notifications
```

## 🔐 Security Architecture

### Authentication Flow

```
User → Frontend → Keycloak (SSO)
                       ↓
                  OAuth2 Flow
                       ↓
                  JWT Token
                       ↓
        ┌──────────────┴──────────────┐
        ▼                             ▼
   Store in Cookie          Send to Backend
        ▼                             ▼
   Subsequent Requests        Validate Token
        ▼                             ▼
   Auto-refresh               RBAC Check
        ▼                             ▼
   Access Granted             Proceed/Deny
```

### Secrets Management

```
Application Startup
        ↓
Read Vault Configuration
        ↓
Authenticate to Vault (Token/K8s Auth)
        ↓
Request Secrets
        ↓
Vault Provides Secrets
        ↓
Inject into Environment
        ↓
Application Uses Secrets
        ↓
Periodic Secret Rotation
```

## 🌐 Network Architecture

### Kubernetes Network

```
┌─────────────────────────────────────────────────┐
│                  Ingress Controller              │
│              (nginx/traefik/istio)              │
└─────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐
   │Frontend│    │Backend │    │Grafana │
   │Service │    │Service │    │Service │
   └────────┘    └────────┘    └────────┘
        │              │              │
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌────────┐
   │  Pods  │    │  Pods  │    │  Pods  │
   └────────┘    └────────┘    └────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
        ┌──────────────────────────────┐
        │      Internal Services        │
        │  (PostgreSQL, Redis, etc.)   │
        └──────────────────────────────┘
```

## 📊 Scalability

### Horizontal Scaling

- **Frontend**: 2-10 pods (based on CPU/Memory)
- **Backend**: 3-20 pods (HPA on API latency)
- **Agents**: 2-5 pods per agent type
- **Celery Workers**: 5-50 workers (queue depth)

### Vertical Scaling

- VPA (Vertical Pod Autoscaler) для автоматичної оптимізації ресурсів

### Database Scaling

- **PostgreSQL**: Primary + Read Replicas (2-3)
- **Redis**: Sentinel/Cluster mode
- **Qdrant**: Sharding для великих векторних колекцій

## 🔄 Deployment Strategy

### GitOps with ArgoCD

```
Developer → Git Push → GitHub
                          ↓
                    GitHub Actions (CI)
                          ↓
                    Build & Test
                          ↓
                    Build Docker Images
                          ↓
                    Push to Registry
                          ↓
                    Update Helm Values
                          ↓
                    Git Commit (GitOps Repo)
                          ↓
                    ArgoCD Detects Change
                          ↓
                    Sync to Kubernetes
                          ↓
                    Rolling Update
                          ↓
                    Health Checks
                          ↓
                    Deployment Complete
```

## 🎯 SLO/SLI Metrics

| Service | SLI | SLO | Measurement |
|---------|-----|-----|-------------|
| API | Latency (p95) | < 200ms | Histogram |
| API | Success Rate | > 99.9% | Counter ratio |
| Tasks | Execution Time | 99% < 60s | Histogram |
| Redis | Availability | > 99.9% | Up/Down |
| DB | Query Time | p95 < 100ms | Histogram |

## 🛠️ Technology Stack Summary

### Backend
- Python 3.11
- FastAPI 0.104+
- Celery 5.3+
- SQLAlchemy 2.0+
- Pydantic 2.5+

### Frontend
- Next.js 14
- React 18
- Three.js / React Three Fiber
- TypeScript 5.3
- TailwindCSS 3.3

### Infrastructure
- Kubernetes 1.28+
- Helm 3.12+
- ArgoCD 2.9+
- Terraform 1.6+

### Databases
- PostgreSQL 16
- Redis 7
- Qdrant (latest)

### Monitoring
- Prometheus
- Grafana
- Loki
- Tempo

### Security
- Keycloak
- HashiCorp Vault

## 📈 Performance Targets

- **API Response Time**: p95 < 200ms, p99 < 500ms
- **Frontend Load Time**: < 2s (first contentful paint)
- **Task Processing**: 1000+ tasks/min
- **Concurrent Users**: 10,000+
- **Database Connections**: Pool of 20-50
- **Memory per Pod**: 512Mi - 4Gi
- **CPU per Pod**: 250m - 2000m

## 🔍 Observability

### Four Golden Signals

1. **Latency** - Request duration
2. **Traffic** - Requests per second
3. **Errors** - Error rate
4. **Saturation** - Resource utilization

### Logging Levels

- **DEBUG**: Development only
- **INFO**: Normal operations
- **WARNING**: Degraded performance
- **ERROR**: Failures
- **CRITICAL**: System down

---

**Останнє оновлення**: 2025-01-17
**Версія**: 1.0.0
