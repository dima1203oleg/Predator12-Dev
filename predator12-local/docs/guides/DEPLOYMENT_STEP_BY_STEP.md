# 🚀 Predator12 Production Deployment - Step by Step Guide

**Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Status:** ✅ Production Ready

> Complete walkthrough for deploying Predator12 to production with Docker Compose & Kubernetes options.

---

## 📋 Quick Navigation

| Section                                                 | Time   | Difficulty  |
| ------------------------------------------------------- | ------ | ----------- |
| [Requirements](#requirements)                           | 5 min  | ⭐ Easy     |
| [Environment Setup](#environment-setup)                 | 10 min | ⭐ Easy     |
| [Docker Compose Deployment](#docker-compose-deployment) | 15 min | ⭐⭐ Medium |
| [Kubernetes Deployment](#kubernetes-deployment)         | 30 min | ⭐⭐⭐ Hard |
| [Verification & Testing](#verification--testing)        | 10 min | ⭐ Easy     |
| [Monitoring & Alerts](#monitoring--alerts)              | 15 min | ⭐⭐ Medium |

---

## Requirements

### System Requirements

```bash
# Minimum specs
- CPU: 4 cores (8+ recommended)
- RAM: 8GB (16GB+ recommended)
- Disk: 50GB SSD
- Network: 100 Mbps+ connection
```

### Software Requirements

```bash
# Check versions
docker --version        # 20.10+
docker-compose --version # 1.29+
kubectl version         # 1.24+
helm version            # 3.10+
git --version           # 2.30+
```

### Installation

```bash
# macOS
brew install docker docker-compose kubectl helm git

# Linux (Ubuntu/Debian)
sudo apt-get install -y docker.io docker-compose kubectl helm git

# Verify installation
docker run hello-world
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/predator11/predator12-local.git
cd predator12-local
```

### 2. Create Environment Files

```bash
# Copy template
cp .env.example .env.production

# Edit configuration
nano .env.production
```

### 3. Environment Variables Required

```bash
# Database
POSTGRES_USER=predator_admin
POSTGRES_PASSWORD=<STRONG_PASSWORD>  # Generate: openssl rand -32 | base64
POSTGRES_DB=predator_prod
DATABASE_URL=postgresql://predator_admin:password@postgres:5432/predator_prod

# Redis
REDIS_PASSWORD=<STRONG_PASSWORD>
REDIS_URL=redis://:password@redis:6379/1
CELERY_BROKER_URL=redis://:password@redis:6379/0

# Security
JWT_SECRET_KEY=<STRONG_KEY>  # Generate: openssl rand -hex 32
ALLOWED_HOSTS=predator12.com,www.predator12.com,api.predator12.com

# OpenSearch
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=<STRONG_PASSWORD>
OPENSEARCH_URL=https://opensearch:9200

# S3/MinIO
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<STRONG_PASSWORD>
MINIO_URL=http://minio:9000

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317
OTEL_SERVICE_NAME=predator12-api
```

### 4. Validate Environment

```bash
# Check all required variables are set
bash scripts/validate-environment.sh

# Output should show:
# ✅ All required environment variables are set
# ✅ Passwords have sufficient length
# ✅ URLs are properly formatted
```

---

## Docker Compose Deployment

### Option 1: Automated Deployment

```bash
# Run automatic deployment script
bash scripts/production-deploy.sh full

# This will:
# 1. Run pre-flight checks
# 2. Create backups
# 3. Build Docker images
# 4. Start services
# 5. Run migrations
# 6. Verify health
```

### Option 2: Step-by-Step Deployment

#### Step 1: Pre-Flight Checks (5 min)

```bash
bash scripts/production-deploy.sh check

# Expected output:
# ✅ Docker is running
# ✅ Environment file exists with all variables
# ✅ Disk space is sufficient (50GB+)
# ✅ Network connectivity verified
# ✅ Git repository is clean
```

#### Step 2: Create Backups (5 min)

```bash
bash scripts/production-deploy.sh backup

# Creates backups in ./backups/YYYYMMDD_HHMMSS/
# - database.sql (if exists)
# - redis dump
# - configuration files
```

#### Step 3: Build Services (10 min)

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build --no-cache

# Pull pre-built images (if available)
docker-compose -f docker-compose.prod.yml pull
```

#### Step 4: Start Services (15 min)

```bash
# Start infrastructure first
docker-compose -f docker-compose.prod.yml up -d postgres redis opensearch minio

# Wait for services to be healthy
sleep 30

# Start application services
docker-compose -f docker-compose.prod.yml up -d api celery celery-beat

# Start monitoring
docker-compose -f docker-compose.prod.yml up -d prometheus grafana tempo
```

#### Step 5: Run Migrations (5 min)

```bash
# Execute database migrations
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head

# Expected output:
# INFO  [alembic.runtime.migration] Context impl PostgresqlImpl
# INFO  [alembic.runtime.migration] Will assume transactional DDL is supported
# INFO  [alembic.runtime.migration] Running upgrade ... done
```

#### Step 6: Health Verification (5 min)

```bash
# Check all services are healthy
bash scripts/verify-deployment.sh

# Should show:
# ✅ API healthy on http://localhost:8000
# ✅ Database connected
# ✅ Redis connected
# ✅ Celery workers running
# ✅ Prometheus scraping metrics
# ✅ Rate limiting active
```

---

## Kubernetes Deployment

### Option 1: Using Helm

#### Step 1: Install Helm Chart

```bash
# Add Predator12 Helm repository
helm repo add predator12 https://charts.predator12.com
helm repo update

# Create namespace
kubectl create namespace predator12

# Install chart
helm install predator12 predator12/predator12 \
  --namespace predator12 \
  --values helm/values-prod.yaml \
  --set image.tag=latest
```

#### Step 2: Verify Deployment

```bash
# Check Helm release status
helm status predator12 -n predator12

# Check pod status
kubectl get pods -n predator12

# Check services
kubectl get svc -n predator12

# Check ingress
kubectl get ingress -n predator12
```

### Option 2: Manual Kubernetes Deployment

#### Step 1: Create Secrets

```bash
# Create namespace
kubectl create namespace predator12

# Create secret from environment variables
kubectl create secret generic predator12-env \
  --from-file=.env.production \
  -n predator12

# Create TLS secret (if using HTTPS)
kubectl create secret tls predator12-tls \
  --cert=certs/tls.crt \
  --key=certs/tls.key \
  -n predator12
```

#### Step 2: Deploy Services

```bash
# Create ConfigMaps for configuration
kubectl apply -f k8s/configmaps.yaml -n predator12

# Deploy database
kubectl apply -f k8s/postgres-deployment.yaml -n predator12
kubectl apply -f k8s/postgres-service.yaml -n predator12

# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml -n predator12
kubectl apply -f k8s/redis-service.yaml -n predator12

# Deploy OpenSearch
kubectl apply -f k8s/opensearch-deployment.yaml -n predator12
kubectl apply -f k8s/opensearch-service.yaml -n predator12

# Deploy API
kubectl apply -f helm/predator-umbrella/charts/api/templates/deployment.yaml -n predator12

# Deploy Celery workers
kubectl apply -f k8s/celery-deployment.yaml -n predator12

# Deploy Celery Beat
kubectl apply -f k8s/celery-beat-deployment.yaml -n predator12

# Deploy monitoring
kubectl apply -f k8s/prometheus-deployment.yaml -n predator12
kubectl apply -f k8s/grafana-deployment.yaml -n predator12
```

#### Step 3: Create Ingress

```bash
# Deploy Ingress for external access
kubectl apply -f k8s/ingress.yaml -n predator12

# Get Ingress IP
kubectl get ingress -n predator12

# Add DNS record pointing to Ingress IP
# predator12.com A <INGRESS_IP>
```

---

## Verification & Testing

### Health Check Endpoints

```bash
# API health
curl http://localhost:8000/health | jq .

# Expected response:
{
  "status": "healthy",
  "components": {
    "database": "healthy",
    "redis": "healthy",
    "opensearch": "healthy"
  }
}
```

### Run Smoke Tests

```bash
# Run E2E smoke tests
pytest tests/e2e/test_smoke.py -v

# Expected: 16/16 tests passing ✅
```

### Run Security Tests

```bash
# Verify security headers
for header in "X-Content-Type-Options" "X-Frame-Options" "Strict-Transport-Security"; do
  value=$(curl -s -I http://localhost:8000/health | grep "$header" | cut -d' ' -f2-)
  [ -n "$value" ] && echo "✅ $header: $value" || echo "❌ $header: NOT SET"
done
```

### Run Performance Tests

```bash
# Light load test (10 users, 2 minutes)
locust -f tests/load/load_test.py \
  -H http://localhost:8000 \
  --users 10 \
  --spawn-rate 2 \
  --run-time 2m \
  --headless

# Medium load test (50 users, 5 minutes)
locust -f tests/load/load_test.py \
  -H http://localhost:8000 \
  --users 50 \
  --spawn-rate 10 \
  --run-time 5m \
  --headless

# Heavy load test (100 users, 10 minutes)
locust -f tests/load/load_test.py \
  -H http://localhost:8000 \
  --users 100 \
  --spawn-rate 20 \
  --run-time 10m \
  --headless
```

---

## Monitoring & Alerts

### Access Dashboards

```bash
# Grafana
open http://localhost:3000
# Default credentials: admin / admin

# Prometheus
open http://localhost:9090

# Jaeger Tracing
open http://localhost:16686

# AlertManager
open http://localhost:9093
```

### Key Metrics to Monitor

| Metric               | Target | Warning | Critical |
| -------------------- | ------ | ------- | -------- |
| API Response Time    | <100ms | >500ms  | >1000ms  |
| Error Rate           | <0.1%  | >1%     | >5%      |
| CPU Usage            | <30%   | >70%    | >90%     |
| Memory Usage         | <50%   | >80%    | >95%     |
| Database Connections | <50    | >100    | >150     |
| Redis Memory         | <1GB   | >2GB    | >3GB     |

### Configure Alerting

```bash
# Update alert rules
kubectl edit configmap prometheus-rules -n predator12

# Example alert rule:
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 10m
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value | humanizePercentage }}"
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check PostgreSQL pod
kubectl describe pod postgres-0 -n predator12

# Check logs
kubectl logs postgres-0 -n predator12

# Test connection
kubectl exec -it api-0 -n predator12 -- \
  psql -h postgres -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1"
```

#### 2. API Not Responding

```bash
# Check API pod
kubectl describe pod api-0 -n predator12

# Check logs
kubectl logs api-0 -n predator12

# Check port forwarding
kubectl port-forward svc/api 8000:8000 -n predator12
curl http://localhost:8000/health
```

#### 3. Celery Workers Not Running

```bash
# Check Celery pod
kubectl describe pod celery-worker-0 -n predator12

# Check active tasks
kubectl exec celery-worker-0 -n predator12 -- \
  celery -A app.workers inspect active

# Check Celery logs
kubectl logs celery-worker-0 -n predator12
```

---

## Rollback Procedure

### Rollback Last Deployment (< 5 minutes)

```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml down
LATEST_BACKUP=$(ls -td ./backups/*/ | head -1)
cd $LATEST_BACKUP/config
docker-compose -f docker-compose.prod.yml up -d

# Kubernetes / Helm
helm rollback predator12 -n predator12
```

---

## 🎉 Deployment Complete!

### Post-Deployment Checklist

- [ ] All services healthy
- [ ] Smoke tests passing
- [ ] No error logs
- [ ] Rate limiting working
- [ ] Security headers present
- [ ] Monitoring dashboards active
- [ ] Team notified
- [ ] Documentation updated

### Next Steps

1. **Monitor** - Watch dashboards for first 24 hours
2. **Test** - Run full test suite
3. **Optimize** - Tune based on metrics
4. **Secure** - Run security audit
5. **Document** - Update runbooks with findings

---

**Status:** ✅ **READY FOR PRODUCTION DEPLOYMENT**

For issues, see `/docs/runbooks/OPERATIONS.md` or contact `ops@predator12.local`

🚀 Happy deploying!
