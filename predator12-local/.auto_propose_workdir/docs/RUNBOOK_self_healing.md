# Runbook: Self-Healing Operations

## 🎯 Overview

This runbook covers self-healing operations for Predator12, including automatic rollback, health checks, and recovery procedures.

## 📊 Metrics & Thresholds

### Critical Metrics
- **Error Rate:** <5% (5xx responses)
- **P95 Latency:** <250ms
- **Availability:** >99.9%
- **Pod Restart Rate:** <10/hour

### Warning Thresholds
- Error Rate: 3-5%
- P95 Latency: 200-250ms
- CPU Usage: >70%
- Memory Usage: >80%

---

## 🚨 Alerts

### PredatorHighErrorRate
**Trigger:** 5xx error rate >5% for 2 minutes

**Auto-Actions:**
1. Argo Rollouts automatically pauses canary deployment
2. Traffic stays on stable version
3. Slack notification sent to #alerts channel

**Manual Steps:**
```bash
# 1. Check current rollout status
kubectl argo rollouts get rollout predator-backend -n default

# 2. View recent logs
kubectl logs -l app=predator-backend --tail=100 -n default

# 3. Check error details in Grafana
# Dashboard: Predator12 Backend Errors

# 4. If needed, manual rollback
kubectl argo rollouts undo predator-backend -n default

# 5. Check Prometheus metrics
curl 'http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~"5.."}[5m])'
```

---

### PredatorHighLatency
**Trigger:** P95 latency >500ms for 2 minutes

**Auto-Actions:**
1. HPA scales up replicas (if autoscaling enabled)
2. Alert sent to on-call engineer

**Manual Steps:**
```bash
# 1. Check current pod count
kubectl get pods -l app=predator-backend -n default

# 2. Verify HPA status
kubectl get hpa predator-backend -n default

# 3. Check resource usage
kubectl top pods -l app=predator-backend -n default

# 4. Analyze slow queries
python scripts/db/query_optimizer_agent.py

# 5. Check OpenTelemetry traces
# Jaeger UI: http://jaeger:16686
```

---

### PredatorAgentDown
**Trigger:** Agent pod down for >1 minute

**Auto-Actions:**
1. Kubernetes restarts pod automatically
2. Alert sent if restart count >3

**Manual Steps:**
```bash
# 1. Check pod status
kubectl get pods -l component=agents -n default

# 2. View pod events
kubectl describe pod <pod-name> -n default

# 3. Check logs before crash
kubectl logs <pod-name> -n default --previous

# 4. Restart deployment if needed
kubectl rollout restart deployment predator-agents -n default

# 5. Check agent dashboard
# http://predator-ui:8080
```

---

## 🔄 Rollback Procedures

### Automatic Rollback (Argo Rollouts)

When analysis fails, Argo Rollouts automatically:
1. Stops canary promotion
2. Shifts 100% traffic to stable version
3. Marks rollout as "Degraded"

### Manual Rollback

```bash
# Rollback to previous version
kubectl argo rollouts undo predator-backend

# Rollback to specific revision
kubectl argo rollouts undo predator-backend --to-revision=5

# Check rollout history
kubectl argo rollouts history predator-backend

# Promote specific revision
kubectl argo rollouts promote predator-backend --full
```

---

## 🏥 Health Check Procedures

### Backend Health Check

```bash
# Quick health check
curl http://predator-backend:8000/health

# Detailed readiness check
curl http://predator-backend:8000/ready

# Check all services
python scripts/health-check.py
```

### Database Health

```bash
# PostgreSQL
kubectl exec -it postgres-0 -- psql -U predator -c "SELECT version();"

# Check connections
kubectl exec -it postgres-0 -- psql -U predator -c "SELECT count(*) FROM pg_stat_activity;"

# Slow query analysis
python scripts/db/query_optimizer_agent.py
```

### Redis Health

```bash
# Check Redis
kubectl exec -it redis-0 -- redis-cli ping

# Check memory usage
kubectl exec -it redis-0 -- redis-cli info memory

# Check Celery queue
kubectl exec -it redis-0 -- redis-cli llen celery
```

---

## 🔍 Investigation Steps

### 1. Check Recent Changes

```bash
# View recent git commits
git log --oneline -10

# Check recent deployments
kubectl get events -n default --sort-by='.lastTimestamp' | head -20

# Check Argo CD sync history
argocd app history predator-backend
```

### 2. Analyze Metrics

```bash
# Prometheus queries
# Error rate:
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Latency:
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# CPU usage:
rate(container_cpu_usage_seconds_total{pod=~"predator-backend.*"}[5m])
```

### 3. Check Logs

```bash
# Recent errors
kubectl logs -l app=predator-backend --tail=500 | grep -i error

# OpenSearch logs
curl -X GET "opensearch:9200/predator-logs-*/_search" -H 'Content-Type: application/json' -d'
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h"
      }
    }
  },
  "sort": [{"@timestamp": "desc"}]
}'
```

---

## 🛠️ Recovery Actions

### Restart Services

```bash
# Restart backend
kubectl rollout restart deployment predator-backend

# Restart all agents
kubectl rollout restart deployment predator-agents

# Restart Celery workers
kubectl rollout restart deployment predator-celery
```

### Clear Caches

```bash
# Clear Redis cache
kubectl exec -it redis-0 -- redis-cli FLUSHDB

# Clear application cache
kubectl exec -it predator-backend-xyz -- python -c "from app.cache import clear_all; clear_all()"
```

### Scale Resources

```bash
# Manual scale up
kubectl scale deployment predator-backend --replicas=5

# Update resource limits
kubectl set resources deployment predator-backend \
  --limits=cpu=2,memory=4Gi \
  --requests=cpu=1,memory=2Gi
```

---

## 📈 Post-Incident Steps

### 1. Document Incident

```bash
# Create incident report
cat > incidents/incident-$(date +%Y%m%d-%H%M).md << 'EOF'
# Incident Report

## Summary
[What happened]

## Timeline
- HH:MM: [Event]
- HH:MM: [Event]

## Root Cause
[Why it happened]

## Resolution
[How it was fixed]

## Action Items
- [ ] [Preventive measure]
- [ ] [Monitoring improvement]
EOF
```

### 2. Update Runbooks

If incident revealed gaps:
- Update this runbook
- Add new alerts
- Improve monitoring
- Update dashboards

### 3. Conduct Retrospective

- What went well?
- What could be improved?
- Action items for prevention

---

## 📞 Contacts

### On-Call
- **Primary:** Slack #oncall
- **Backup:** ops@predator12.io

### Escalation
1. L1: Team Lead
2. L2: Engineering Manager
3. L3: CTO

---

## 🔗 Related Resources

- [Architecture Overview](../docs/ARCHITECTURE.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Monitoring Dashboard](http://grafana:3000/d/predator12)
- [Prometheus Alerts](http://prometheus:9090/alerts)
- [ArgoCD UI](http://argocd:8080)

---

**Last Updated:** 2025-01-06  
**Version:** 1.0  
**Maintainer:** DevOps Team
