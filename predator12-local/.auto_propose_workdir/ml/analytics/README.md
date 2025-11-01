# Predator Analytics

Predator Analytics - комплексна система для аналізу та виявлення зв'язків у різних сферах, включаючи тендерні змови, лобістські зв'язки та митні схеми.

## Огляд проєкту

Система Predator Analytics складається з наступних основних компонентів:

- **Оркестрація та CI/CD**: Kubernetes, Helm, ArgoCD, Tekton, Terraform
- **Безпека**: Zero Trust архітектура з Vault, Keycloak, Istio
- **Бекенд API**: FastAPI, Celery, Kafka, LangGraph
- **AI/LLM**: MLflow, DVC, Ollama, LoRA/PEFT, ONNX
- **Бази даних**: PostgreSQL, TimescaleDB, Qdrant, Redis, MinIO, OpenSearch
- **ETL та парсинг**: Telethon, Playwright, Scrapy, Pandas
- **Фронтенд**: React 18, Next.js, Tailwind CSS, D3.js, WebGL
- **Багатоагентна система**: RedTeam, AutoHeal, Arbiter агенти
- **Спостережуваність**: Prometheus, Grafana, Jaeger, Loki, Tempo
- **Білінг**: Stripe, Kafka Streams, Kong, RBAC
- **Аналітична логіка**: Модулі для аналізу тендерів, лобіювання, митних схем

## Розгортання

### Локальне розгортання (MacBook Pro)

```bash
# Клонування репозиторію
git clone https://github.com/your-organization/predator-analytics.git
cd predator-analytics

# Налаштування змінних оточення
cp .env.example .env
# Відредагуйте .env файл відповідно до вашого оточення

# Запуск за допомогою Docker Compose
docker-compose up -d
```

### Розгортання на сервері з GPU

```bash
# Встановлення залежностей
sudo apt update
sudo apt install -y docker.io docker-compose nvidia-docker2

# Клонування репозиторію
git clone https://github.com/your-organization/predator-analytics.git
cd predator-analytics

# Налаштування змінних оточення
cp .env.example .env
# Відредагуйте .env файл відповідно до вашого оточення

# Запуск з підтримкою GPU
docker-compose -f docker-compose.gpu.yml up -d
```

### Розгортання в Kubernetes

```bash
# Встановлення Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Додавання Helm репозиторію
helm repo add predator-analytics https://charts.your-organization.com
helm repo update

# Розгортання за допомогою Helm
helm install predator-analytics predator-analytics/predator-analytics -f values.yaml
```

## 📚 Документація, чек-листи та сучасні практики

- [CHECKLIST.md — повний DevOps/AI/Infra/Self-healing/AI checklist](../CHECKLIST.md)
- [Документація по інфраструктурі, безпеці, CI/CD, observability, AI, self-healing, chaos engineering, knowledge graph](../documentation/)
- [OPA/Kyverno policy-as-code](../documentation/opa-kyverno.md)
- [Grafana ML anomaly detection](../documentation/grafana-ml-anomaly.md)
- [Chaos Engineering (Litmus)](../documentation/chaos-engineering.md)
- [Self-tuning Kubernetes (VPA/HPA/KEDA+ML)](../documentation/self-tuning-k8s.md)
- [Crossplane (self-healing infra)](../documentation/crossplane.md)
- [Knowledge Graph & Semantic Search](../documentation/knowledge-graph.md)

## Ліцензія

Цей проєкт розповсюджується під ліцензією [Ваша ліцензія]. Детальніше дивіться у файлі LICENSE.
