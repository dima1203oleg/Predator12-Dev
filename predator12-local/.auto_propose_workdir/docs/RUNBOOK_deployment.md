# Production Deployment Runbook

## 🎯 Purpose

This runbook provides step-by-step procedures for deploying Predator12 to production using ArgoCD GitOps workflow.

---

## 📋 Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing in CI/CD
- [ ] Code review approved (2+ reviewers)
- [ ] Security scan completed (no critical issues)
- [ ] Performance tests passed
- [ ] Documentation updated

### Infrastructure

- [ ] Kubernetes cluster healthy
- [ ] ArgoCD operational
- [ ] Monitoring stack running (Prometheus/Grafana)
- [ ] Backup completed
- [ ] Resource capacity verified

### Database

- [ ] Migration scripts tested in staging
- [ ] Rollback plan prepared
- [ ] Database backup completed
- [ ] Replica lag acceptable (<5s)

### Team Readiness

- [ ] On-call engineer identified
- [ ] Deployment window scheduled
- [ ] Stakeholders notified
- [ ] Rollback plan communicated

---

## 🚀 Deployment Procedure

### Phase 1: Preparation (T-30 minutes)

#### 1.1 Verify Cluster Health

```bash
# Check cluster status
kubectl get nodes
kubectl top nodes

# Check ArgoCD
kubectl get pods -n argocd
argocd app list

# Check monitoring
kubectl get pods -n monitoring
```

#### 1.2 Create Backup

```bash
# Database backup
./scripts/backup-database.sh

# ArgoCD configuration backup
argocd app list -o yaml > backups/applications-$(date +%Y%m%d).yaml
kubectl get cm argocd-cm -n argocd -o yaml > backups/argocd-cm-$(date +%Y%m%d).yaml

# Git commit backup
git log --oneline -10 > backups/git-log-$(date +%Y%m%d).txt
```

#### 1.3 Verify Staging

```bash
# Run smoke tests on staging
kubectl exec -n predator12-staging deployment/backend -- \
  python -m pytest tests/smoke/ -v

# Check staging metrics
curl -s http://staging-api.predator12.com/health | jq
```

### Phase 2: Deployment (T-0)

#### 2.1 Update Image Tags

```bash
# Update Helm values
cd helm/predator12-umbrella
yq e '.image.tag = "v1.2.3"' -i values/prod.yaml

# Commit and push
git add values/prod.yaml
git commit -m "Deploy v1.2.3 to production"
git push origin main
```

#### 2.2 Trigger ArgoCD Sync

```bash
# Manual sync (production requires approval)
argocd app sync predator12-prod-backend --prune

# Monitor sync progress
watch -n 2 "argocd app get predator12-prod-backend | tail -n 20"
```

#### 2.3 Monitor Rollout

```bash
# Watch Argo Rollout
kubectl argo rollouts get rollout predator12-backend -n predator12-prod --watch

# Check canary metrics
kubectl argo rollouts dashboard
```

### Phase 3: Verification (T+5 minutes)

#### 3.1 Health Checks

```bash
# Check pod status
kubectl get pods -n predator12-prod -l app=predator12,component=backend

# Check readiness
kubectl get pods -n predator12-prod -l app=predator12,component=backend \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'

# API health
curl -s https://api.predator12.com/health | jq
```

#### 3.2 Smoke Tests

```bash
# Run production smoke tests
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: smoke-test-$(date +%s)
  namespace: predator12-prod
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: smoke-test
        image: predator12/backend:v1.2.3
        command: ["python", "-m", "pytest", "tests/smoke/", "-v"]
        env:
        - name: API_URL
          value: "https://api.predator12.com"
EOF

# Wait for completion
kubectl wait --for=condition=complete job/smoke-test-* -n predator12-prod --timeout=300s

# Check results
kubectl logs -n predator12-prod job/smoke-test-*
```

#### 3.3 Metrics Verification

```bash
# Check error rate
curl -s 'http://prometheus.monitoring:9090/api/v1/query?query=rate(http_requests_total{service="predator12-backend",status=~"5.."}[5m])' | jq

# Check latency
curl -s 'http://prometheus.monitoring:9090/api/v1/query?query=histogram_quantile(0.95,rate(http_request_duration_seconds_bucket{service="predator12-backend"}[5m]))' | jq

# Check agent health
curl -s https://api.predator12.com/agents/health | jq
```

### Phase 4: Gradual Rollout

#### 4.1 Monitor Canary (10% traffic)

**Duration**: 2 minutes

```bash
# Check canary metrics
kubectl get analysisrun -n predator12-prod

# Success criteria:
# - Success rate ≥95%
# - P95 latency ≤500ms
# - Error rate ≤5%
```

**Go/No-Go Decision**:
- ✅ **GO**: All metrics within thresholds → Continue to 25%
- ❌ **NO-GO**: Any metric out of bounds → Rollback

#### 4.2 Increase to 25% Traffic

**Duration**: 5 minutes

```bash
# ArgoCD automatically progresses based on analysis

# Monitor
kubectl argo rollouts get rollout predator12-backend -n predator12-prod
```

**Go/No-Go Decision**:
- ✅ **GO**: All metrics stable → Continue to 50%
- ❌ **NO-GO**: Any degradation → Rollback

#### 4.3 Increase to 50% Traffic

**Duration**: 5 minutes

**Go/No-Go Decision**:
- ✅ **GO**: All metrics stable → Full rollout
- ❌ **NO-GO**: Any degradation → Rollback

#### 4.4 Full Rollout (100% Traffic)

```bash
# Wait for automatic promotion
kubectl argo rollouts get rollout predator12-backend -n predator12-prod
```

### Phase 5: Post-Deployment (T+15 minutes)

#### 5.1 Final Verification

```bash
# All pods running new version
kubectl get pods -n predator12-prod -l app=predator12,component=backend \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'

# Check application logs
kubectl logs -n predator12-prod deployment/predator12-backend --tail=100

# Check for errors
kubectl logs -n predator12-prod deployment/predator12-backend --since=15m | grep -i error
```

#### 5.2 Update Monitoring

```bash
# Add deployment annotation in Grafana
curl -X POST https://grafana.predator12.com/api/annotations \
  -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Production deployment v1.2.3",
    "tags": ["deployment", "production"],
    "time": '$(date +%s000)'
  }'
```

#### 5.3 Communication

```bash
# Send success notification
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "✅ Production deployment v1.2.3 completed successfully",
    "attachments": [{
      "color": "good",
      "fields": [
        {"title": "Version", "value": "v1.2.3", "short": true},
        {"title": "Duration", "value": "15 minutes", "short": true},
        {"title": "Status", "value": "All health checks passed", "short": false}
      ]
    }]
  }'
```

---

## 🔄 Rollback Procedure

### When to Rollback

Rollback immediately if:
- Error rate >5%
- P95 latency >500ms
- Success rate <95%
- Critical functionality broken
- Security vulnerability discovered

### Quick Rollback (Automatic)

Argo Rollouts automatically rolls back if analysis fails:

```bash
# Check rollback status
kubectl argo rollouts get rollout predator12-backend -n predator12-prod

# Rollback is automatic, monitor progress
watch kubectl get pods -n predator12-prod
```

### Manual Rollback

```bash
# Abort current rollout
kubectl argo rollouts abort rollout predator12-backend -n predator12-prod

# Rollback to previous version
kubectl argo rollouts undo rollout predator12-backend -n predator12-prod

# Or rollback to specific revision
argocd app rollback predator12-prod-backend <revision-number>

# Monitor rollback
kubectl argo rollouts get rollout predator12-backend -n predator12-prod --watch
```

### Database Rollback

```bash
# If database migration needs rollback
kubectl exec -n predator12-prod deployment/backend -- \
  python -m alembic downgrade -1

# Restore from backup (if needed)
./scripts/restore-database.sh backups/predator12-$(date +%Y%m%d).sql.gz
```

### Post-Rollback

```bash
# Verify old version running
kubectl get pods -n predator12-prod -l app=predator12 \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'

# Run smoke tests
kubectl apply -f tests/smoke/job.yaml

# Check metrics
curl -s https://api.predator12.com/health | jq

# Notify team
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "⚠️ Production rollback completed",
    "attachments": [{
      "color": "warning",
      "fields": [
        {"title": "Rolled back to", "value": "v1.2.2", "short": true},
        {"title": "Reason", "value": "High error rate", "short": false}
      ]
    }]
  }'
```

---

## 🔍 Troubleshooting

### Issue: Pods Not Starting

```bash
# Check events
kubectl get events -n predator12-prod --sort-by='.lastTimestamp' | tail -20

# Check pod logs
kubectl logs -n predator12-prod <pod-name> --previous

# Check resource constraints
kubectl top pods -n predator12-prod

# Describe pod
kubectl describe pod -n predator12-prod <pod-name>
```

### Issue: High Error Rate

```bash
# Check application logs
kubectl logs -n predator12-prod deployment/predator12-backend --tail=1000 | grep -i error

# Check database connection
kubectl exec -n predator12-prod deployment/backend -- \
  python -c "from app.db import engine; print(engine.execute('SELECT 1').fetchone())"

# Check Redis connection
kubectl exec -n predator12-prod deployment/backend -- \
  python -c "from app.cache import redis_client; print(redis_client.ping())"
```

### Issue: Database Migration Failed

```bash
# Check migration status
kubectl exec -n predator12-prod deployment/backend -- \
  python -m alembic current

# View migration logs
kubectl logs -n predator12-prod job/db-migrate-presync

# Manually apply migration
kubectl exec -n predator12-prod deployment/backend -- \
  python -m alembic upgrade head
```

### Issue: Canary Analysis Failing

```bash
# Check analysis run
kubectl get analysisrun -n predator12-prod

# Describe analysis
kubectl describe analysisrun -n predator12-prod <analysis-name>

# Check Prometheus queries
kubectl logs -n predator12-prod <analysisrun-pod>
```

---

## 📊 Key Metrics

### Deployment Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deployment Frequency | Daily | ArgoCD sync count |
| Lead Time for Changes | <1 hour | Commit to production |
| Mean Time to Recovery | <15 minutes | Rollback duration |
| Change Failure Rate | <5% | Failed deployments / total |

### Application Metrics

| Metric | SLI Target | Alert Threshold |
|--------|------------|-----------------|
| Availability | 99.9% | <99.5% |
| Error Rate | <1% | >5% |
| P95 Latency | <300ms | >500ms |
| Success Rate | >99% | <95% |

### Infrastructure Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| CPU Usage | <70% | >80% |
| Memory Usage | <75% | >85% |
| Disk Usage | <80% | >90% |
| Network Errors | <0.1% | >1% |

---

## 📞 Escalation

### Level 1: On-Call Engineer
- Initial triage
- Execute standard runbooks
- Monitor deployment

### Level 2: Team Lead
- Complex issues
- Architectural decisions
- Stakeholder communication

### Level 3: CTO/Senior Leadership
- Critical outages
- Security incidents
- Major architectural changes

### Contact Information

```bash
# View on-call rotation
pagerduty-cli on-call

# Page on-call engineer
pagerduty-cli trigger --service predator12 --description "Production deployment issue"

# Emergency contacts in Slack
# #predator12-oncall
# #predator12-incidents
```

---

## 📚 References

- [ArgoCD Guide](./ARGOCD_COMPLETE_GUIDE.md)
- [Self-Improving Stack](./SELF_IMPROVING_STACK.md)
- [AI DevOps Guide](./AI_DEVOPS_GUIDE.md)
- [Runbook: Self-Healing](./RUNBOOK_self_healing.md)

---

## ✅ Post-Mortem Template

After any incident or rollback, complete a post-mortem:

```markdown
## Incident: [Brief Description]

**Date**: YYYY-MM-DD
**Duration**: HH:MM
**Severity**: Critical/High/Medium/Low

### Timeline
- HH:MM - Deployment started
- HH:MM - Issue detected
- HH:MM - Rollback initiated
- HH:MM - Service restored

### Root Cause
[Detailed explanation]

### Impact
- Users affected: X
- Downtime: Y minutes
- Revenue impact: $Z

### Action Items
- [ ] Fix root cause
- [ ] Add test coverage
- [ ] Update runbook
- [ ] Team training

### Lessons Learned
[What went well, what didn't]
```

---

## 🎓 Training

New team members should:
1. Read this runbook thoroughly
2. Shadow a production deployment
3. Perform deployment in staging
4. Lead deployment with supervision
5. Conduct post-deployment review

Quarterly disaster recovery drills:
- Simulate production outage
- Practice rollback procedures
- Test backup restoration
- Review and update runbook
