# 🚀 Швидкий Старт - Predator Analytics

Повний гайд по швидкому запуску Predator Analytics системи.

## 📋 Зміст

1. [Вимоги](#вимоги)
2. [Локальна Розробка](#локальна-розробка)
3. [Перший Запуск](#перший-запуск)
4. [Тестування Функціоналу](#тестування-функціоналу)
5. [Production Deploy](#production-deploy)

---

## Вимоги

### Локальна Розробка
- Docker Desktop 4.0+
- Docker Compose 2.0+
- Git

### Production
- Kubernetes 1.28+
- Helm 3.12+
- kubectl
- Terraform 1.6+ (опціонально)

---

## Локальна Розробка

### 1. Клонування Репозиторію

```bash
git clone https://github.com/your-org/predator-analytics.git
cd predator-analytics
```

### 2. Налаштування Environment

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**Відредагуйте backend/.env:**
```bash
DEBUG=true
SECRET_KEY=your-dev-secret-key

# Для голосового інтерфейсу (опціонально)
GOOGLE_CLOUD_TTS_API_KEY=your_google_key
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=westeurope
```

### 3. Запуск Усіх Сервісів

```bash
docker-compose up -d
```

**Це запустить:**
- ✅ PostgreSQL (база даних)
- ✅ Redis (кеш і черги)
- ✅ Qdrant (векторна БД)
- ✅ Backend API (FastAPI)
- ✅ Celery Worker (фонові задачі)
- ✅ Celery Flower (моніторинг черг)
- ✅ Frontend (Next.js)
- ✅ Prometheus (метрики)
- ✅ Grafana (візуалізація)
- ✅ Loki (логи)

### 4. Перевірка Статусу

```bash
docker-compose ps
```

Усі сервіси повинні бути в статусі `Up`.

---

## Перший Запуск

### 1. Відкрийте Інтерфейси

**Frontend (Головна сторінка з 3D Аватаром)**
```
http://localhost:3000
```

**Backend API Docs (Swagger)**
```
http://localhost:8000/api/docs
```

**Grafana (Моніторинг)**
```
http://localhost:3001
Login: admin / admin
```

### 2. Перевірка Backend API

```bash
# Health check
curl http://localhost:8000/health

# Статус агентів
curl http://localhost:8000/api/v1/agents/system/status
```

### 3. Ініціалізація Бази Даних

Backend автоматично створить таблиці при старті.

Перевірка:
```bash
docker-compose exec postgres psql -U postgres -d predator_analytics -c "\dt"
```

---

## Тестування Функціоналу

### 1. Тест AI Аватара

1. Відкрийте http://localhost:3000
2. Побачите 3D аватар з анімацією
3. Натисніть на мікрофон для голосового введення
4. Або введіть текст у чат

### 2. Тест AI Агентів

**Через API:**

```bash
# Аналіз датасету
curl -X POST http://localhost:8000/api/v1/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "analyze_dataset",
    "data": {
      "dataset": [
        {"name": "John", "age": 30, "city": "Kyiv"},
        {"name": "Anna", "age": 25, "city": "Lviv"}
      ]
    }
  }'
```

**Через Frontend:**

1. Перейдіть на http://localhost:3000
2. Натисніть "Аналіз даних" у швидких діях
3. Завантажте CSV файл або введіть дані

### 3. Перегляд Дашборду Аналітики

```
http://localhost:3000/dashboard
```

Тут ви побачите:
- Загальну статистику завдань
- Графіки активності за 7 днів
- Статистику по агентам
- Метрики продуктивності

### 4. Моніторинг та Метрики

**Prometheus:**
```
http://localhost:9090
```

Приклади запитів:
```promql
# API latency
predator:api:latency:p95

# Success rate
predator:api:success_rate

# Active tasks
predator_active_tasks
```

**Grafana:**
```
http://localhost:3001
```

Імпортуйте dashboard:
```bash
# Dashboard вже налаштований у monitoring/grafana/dashboard-overview.json
```

### 5. Логи

```bash
# Backend logs
docker-compose logs -f backend

# Celery worker logs
docker-compose logs -f celery-worker

# Frontend logs
docker-compose logs -f frontend

# Усі логи
docker-compose logs -f
```

---

## Production Deploy

### Варіант 1: Helm (Рекомендовано)

#### 1. Підготовка

```bash
# Створіть namespace
kubectl create namespace predator-analytics-production

# Створіть secrets
kubectl create secret generic postgresql-secret \
  --from-literal=username=predator \
  --from-literal=password=YOUR_SECURE_PASSWORD \
  -n predator-analytics-production

kubectl create secret generic redis-secret \
  --from-literal=password=YOUR_REDIS_PASSWORD \
  -n predator-analytics-production
```

#### 2. Налаштування values-prod.yaml

```bash
cd helm/predator-analytics
cp values-prod.yaml values-prod-custom.yaml

# Відредагуйте values-prod-custom.yaml
# Встановіть ваші домени, секрети, ресурси
```

#### 3. Deploy

```bash
# Оновлення залежностей
helm dependency update

# Інсталяція
helm install predator-analytics . \
  -f values.yaml \
  -f values-prod-custom.yaml \
  --namespace predator-analytics-production
```

#### 4. Перевірка

```bash
# Статус релізу
helm status predator-analytics -n predator-analytics-production

# Поди
kubectl get pods -n predator-analytics-production

# Сервіси
kubectl get svc -n predator-analytics-production

# Ingress
kubectl get ingress -n predator-analytics-production
```

### Варіант 2: ArgoCD (GitOps)

#### 1. Встановлення ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

#### 2. Доступ до ArgoCD UI

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Login: admin
Password: 
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

#### 3. Deploy Application

```bash
kubectl apply -f argocd/application.yaml
```

ArgoCD автоматично синхронізує з Git репозиторієм.

### Варіант 3: Terraform + Helm

```bash
cd terraform

# Ініціалізація
terraform init

# План
terraform plan -var-file="production.tfvars"

# Deploy
terraform apply -var-file="production.tfvars"
```

---

## 🎯 Наступні Кроки

### 1. Налаштування Моніторингу

- Підключіть Grafana до Prometheus
- Імпортуйте dashboard'и з `monitoring/grafana/`
- Налаштуйте алерти

### 2. Безпека

- Встановіть Keycloak для SSO
- Налаштуйте Vault для секретів
- Увімкніть TLS для всіх сервісів
- Налаштуйте Network Policies

### 3. Backup та Disaster Recovery

```bash
# PostgreSQL backup
kubectl exec -it <postgres-pod> -n predator-analytics-production -- \
  pg_dump -U predator predator_analytics > backup.sql

# Velero для K8s
velero install --provider aws --plugins velero/velero-plugin-for-aws:v1.8.0
velero backup create predator-analytics-backup
```

### 4. Масштабування

```bash
# Horizontal scaling
kubectl scale deployment backend --replicas=5 -n predator-analytics-production

# Vertical scaling (VPA)
kubectl apply -f vpa-backend.yaml
```

---

## 🐛 Troubleshooting

### Backend не стартує

```bash
# Перевірка логів
docker-compose logs backend

# Перевірка з'єднання з БД
docker-compose exec backend python -c "from core.database import engine; engine.connect()"
```

### Frontend не підключається до Backend

```bash
# Перевірте NEXT_PUBLIC_API_URL
cat frontend/.env

# Має бути: http://localhost:8000/api/v1
```

### Celery Worker не обробляє задачі

```bash
# Перевірка з'єднання з Redis
docker-compose exec celery-worker redis-cli -h redis ping

# Перевірка черг
docker-compose exec celery-worker celery -A services.celery_service:celery_app inspect active
```

### Prometheus не збирає метрики

```bash
# Перевірка endpoints
curl http://localhost:8000/metrics

# Перевірка конфігурації Prometheus
docker-compose exec prometheus cat /etc/prometheus/prometheus.yml
```

---

## 📚 Додаткові Ресурси

- [Повна Документація](README.md)
- [API Reference](http://localhost:8000/api/docs)
- [Архітектура Системи](ARCHITECTURE.md)
- [CI/CD Pipeline](.github/workflows/ci.yaml)

---

## 💬 Підтримка

- GitHub Issues: https://github.com/your-org/predator-analytics/issues
- Email: team@predator-analytics.io
- Telegram: @predator_analytics

---

**Успішного запуску! 🚀🇺🇦**
