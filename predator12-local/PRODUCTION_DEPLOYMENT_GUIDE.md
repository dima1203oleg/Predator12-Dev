# Predator11 Production Deployment Guide

## 📋 Огляд

Цей документ описує процес розгортання системи Predator11 у продакшн-середовищі з використанням RKE2 Kubernetes кластера, що відповідає вимогам безпеки ISO 27001 та GDPR.

## 🎯 Архітектура

### Компоненти системи:

- **Backend API** - FastAPI додаток (3 репліки з автоскейлінгом)
- **Frontend** - React додаток з NGINX (2 репліки)
- **Agents** - Багатоагентна система (супервізор + 5 воркерів)
- **PostgreSQL** - HA кластер з primary/standby реплікацією
- **Redis** - HA кластер для кешування
- **OpenSearch** - 3-нодовий кластер для логів та пошуку
- **Vault** - Управління секретами (3 репліки)
- **Keycloak** - Система автентифікації (2 репліки)

### Зовнішні інтеграції:

- Платіжні системи (Stripe, LiqPay)
- SMS сервіс (Twilio)
- Email сервіс (SMTP/SES)
- Державні реєстри України
- Google Maps API

## 🚀 Швидкий старт

### Передумови

```bash
# Встановлення необхідних інструментів
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
curl -sSL https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64 -o argocd
```

### Розгортання

1. **Клонування репозиторію:**

```bash
git clone https://github.com/predator11/predator11.git
cd predator11
```

2. **Запуск автоматичного розгортання:**

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

3. **Або покрокове розгортання:**

```bash
# Крок 1: Розгортання RKE2 кластера
./scripts/deploy-production.sh rke2

# Крок 2: Налаштування безпеки
./scripts/deploy-production.sh security

# Крок 3: Встановлення моніторингу
./scripts/deploy-production.sh monitoring

# Крок 4: Розгортання додатку
./scripts/deploy-production.sh deploy
```

## 🔐 Безпека

### Управління секретами через Vault

1. **Ініціалізація Vault:**

```bash
kubectl exec -it vault-0 -n predator11-security -- vault operator init
kubectl exec -it vault-0 -n predator11-security -- vault operator unseal
```

2. **Налаштування автентифікації Kubernetes:**

```bash
vault auth enable kubernetes
vault write auth/kubernetes/config \
    token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
    kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
    kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
```

3. **Створення політик та ролей:**

```bash
vault policy write predator11-backend k8s/security/policies/backend-policy.hcl
vault policy write predator11-agents k8s/security/policies/agents-policy.hcl

vault write auth/kubernetes/role/predator11-backend \
    bound_service_account_names=predator11 \
    bound_service_account_namespaces=predator11 \
    policies=predator11-backend \
    ttl=24h
```

### TLS та сертифікати

Сертифікати автоматично видаються через cert-manager з Let's Encrypt:

```bash
# Перевірка статусу сертифікатів
kubectl get certificates -n predator11
kubectl describe certificate predator11-tls -n predator11
```

### Network Policies

Всі компоненти ізольовані мережевими політиками:

- Backend може спілкуватися тільки з БД, Redis, OpenSearch
- Frontend має доступ тільки до Backend API
- Зовнішній трафік дозволений тільки через Ingress

## 📊 Моніторинг та спостережуваність

### Доступ до систем моніторингу:

- **Grafana**: https://monitoring.predator11.com
- **Prometheus**: https://monitoring.predator11.com/prometheus
- **OpenSearch Dashboards**: https://logs.predator11.com
- **ArgoCD**: https://argocd.predator11.com

### Основні дашборди:

1. **System Overview** - загальний стан системи
2. **Infrastructure** - метрики інфраструктури
3. **Security** - безпекові події
4. **Application** - метрики додатку

### Налаштування алертів:

```bash
# Перевірка правил алертів
kubectl get prometheusrules -n predator11-monitoring

# Перегляд активних алертів
curl -s http://prometheus:9090/api/v1/alerts | jq '.data.alerts'
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Pipeline автоматично:

1. Запускає тести та лінтери
2. Будує Docker образи
3. Сканує на вразливості
4. Розгортає на staging
5. Запускає інтеграційні тести
6. Розгортає на production (після підтвердження)

### ArgoCD GitOps

ArgoCD автоматично синхронізує стан кластера з Git репозиторієм:

```bash
# Перегляд статусу додатків
argocd app list

# Синхронізація додатку
argocd app sync predator11-production

# Відкат до попередньої версії
argocd app rollback predator11-production
```

## 🔧 Експлуатація

### Масштабування

```bash
# Ручне масштабування backend
kubectl scale deployment predator11-backend --replicas=5 -n predator11

# Перегляд HPA статусу
kubectl get hpa -n predator11

# Масштабування кластера (якщо підтримується)
kubectl scale nodes --selector=predator11.com/node-type=worker --replicas=5
```

### Резервне копіювання

```bash
# Резервна копія PostgreSQL
kubectl exec -it predator11-postgresql-0 -n predator11 -- \
  pg_dump -h localhost -U predator11 predator11 | \
  gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Резервна копія Vault
kubectl exec -it vault-0 -n predator11-security -- \
  vault operator raft snapshot save /tmp/vault-snapshot-$(date +%Y%m%d).snap
```

### Логування

```bash
# Перегляд логів додатку
kubectl logs -f deployment/predator11-backend -n predator11

# Перегляд логів через OpenSearch
curl -X GET "opensearch:9200/predator11-logs-*/_search" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match": {"level": "ERROR"}}}'
```

## 🚨 Усунення несправностей

### Перевірка стану системи

```bash
# Статус всіх подів
kubectl get pods -n predator11 -o wide

# Перевірка подій
kubectl get events -n predator11 --sort-by='.lastTimestamp'

# Перевірка мережевої зв'язаності
kubectl exec -it predator11-backend-xxx -n predator11 -- \
  curl -v http://predator11-postgresql:5432
```

### Поширені проблеми

1. **Pod не запускається:**
   - Перевірте image pull secrets
   - Перевірте resource limits
   - Переглянте логи: `kubectl describe pod <pod-name>`

2. **Проблеми з сертифікатами:**
   - Перевірте cert-manager: `kubectl logs -n cert-manager deployment/cert-manager`
   - Перевірте DNS записи для домену

3. **Проблеми з Vault:**
   - Перевірте unsealing: `vault status`
   - Перевірте мережеву політику для доступу до Vault

## 🔄 Оновлення системи

### Rolling Updates

```bash
# Оновлення через Helm
helm upgrade predator11 k8s/helm/predator11 \
  --namespace predator11 \
  --set app.backend.image.tag=v1.2.0

# Перегляд статусу оновлення
kubectl rollout status deployment/predator11-backend -n predator11

# Відкат у разі проблем
kubectl rollout undo deployment/predator11-backend -n predator11
```

### Blue-Green Deployment

```bash
# Створення green середовища
helm install predator11-green k8s/helm/predator11 \
  --namespace predator11-green \
  --set app.backend.image.tag=v1.2.0

# Переключення трафіку через Ingress
kubectl patch ingress predator11-ingress -n predator11 \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value": "predator11-green-backend"}]'
```

## 📈 Продуктивність та оптимізація

### Налаштування автоскейлінгу

```yaml
# HPA конфігурація
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: predator11-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: predator11-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Налаштування resource limits

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

## 🌐 Зовнішні інтеграції

### Налаштування Stripe

```bash
# Додавання секретів Stripe у Vault
vault kv put secret/predator11/external-apis/stripe \
  public_key="pk_live_..." \
  secret_key="sk_live_..." \
  webhook_secret="whsec_..."
```

### Налаштування Twilio

```bash
# Додавання секретів Twilio у Vault
vault kv put secret/predator11/external-apis/twilio \
  account_sid="AC..." \
  auth_token="..." \
  from_number="+1234567890"
```

## 📞 Підтримка та контакти

- **Технічна підтримка**: support@predator11.com
- **Екстрена підтримка**: +380-XX-XXX-XXXX
- **Документація**: https://docs.predator11.com
- **Статус системи**: https://status.predator11.com

## 📚 Додаткові ресурси

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [RKE2 Documentation](https://docs.rke2.io/)
- [Helm Charts](https://helm.sh/docs/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Vault Documentation](https://www.vaultproject.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
