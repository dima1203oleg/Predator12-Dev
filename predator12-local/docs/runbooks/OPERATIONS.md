# 📚 Predator12 Operations Runbook

**Version:** 1.0.0  
**Last Updated:** November 3, 2025  
**Status:** Production Ready

---

## 📖 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Daily Operations](#daily-operations)
3. [Incident Response](#incident-response)
4. [Disaster Recovery](#disaster-recovery)
5. [Performance Tuning](#performance-tuning)
6. [Scaling](#scaling)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Essential Commands

```bash
# Перевірити статус всіх сервісів
docker-compose -f docker-compose.prod.yml ps

# Переглянути логи
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f celery

# Перезапустити сервіс
docker-compose -f docker-compose.prod.yml restart api

# Отримати shell в контейнері
docker exec -it predator12-api bash

# Запустити міграції
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head

# Бекап БД
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres predator > backup.sql

# Виклич health check
curl http://localhost:8000/health

# Перевірити metrics
curl http://localhost:9090/api/v1/query?query=up
```

---

## Daily Operations

### Morning Checklist (Before Shift)

1. **System Health**

   ```bash
   curl -s http://localhost:8000/health | jq .components
   ```

   ✅ All components should be "healthy"

2. **Database Health**

   ```bash
   docker-compose exec db psql -U postgres -d predator -c "SELECT version();"
   ```

   ✅ Should show PostgreSQL version

3. **Redis Connection**

   ```bash
   redis-cli -h localhost ping
   ```

   ✅ Should return PONG

4. **Celery Workers**

   ```bash
   celery -A app.workers inspect active
   ```

   ✅ Should show active workers

5. **Monitoring Dashboards**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000
     ✅ Check CPU, memory, request rates

### End-of-Day Checklist

1. Review error logs:

   ```bash
   docker-compose logs api | grep -i error
   ```

2. Check failed tasks:

   ```bash
   celery -A app.workers inspect failed
   ```

3. Backup critical data:
   ```bash
   bash scripts/backup-database.sh
   ```

---

## Incident Response

### High CPU Usage

**Symptoms:** CPU > 80% for 5+ minutes

**Diagnosis:**

```bash
# Find problematic process
docker top predator12-api

# Check for stuck queries
docker-compose exec db psql -U postgres -d predator \
  -c "SELECT pid, query, state FROM pg_stat_activity WHERE state != 'idle';"
```

**Resolution:**

1. Identify the problematic query
2. Kill the query if necessary:
   ```bash
   docker-compose exec db psql -U postgres -d predator \
     -c "SELECT pg_terminate_backend(<pid>);"
   ```
3. Investigate the root cause
4. Scale horizontally if needed

### High Memory Usage

**Symptoms:** Memory > 85% available

**Diagnosis:**

```bash
docker stats predator12-api --no-stream
```

**Resolution:**

1. Identify memory leaks:
   ```bash
   python -m memory_profiler backend/app/main.py
   ```
2. Restart service if critical:
   ```bash
   docker-compose restart api
   ```
3. Increase allocated memory in docker-compose

### Database Connection Errors

**Symptoms:** "Connection refused" in logs

**Diagnosis:**

```bash
docker-compose exec db psql -U postgres -d predator -c "SELECT 1;"
```

**Resolution:**

1. Check database container status:
   ```bash
   docker-compose logs db | tail -20
   ```
2. Restart database if necessary:
   ```bash
   docker-compose restart db
   ```
3. Restore from backup if corrupted

### API Response Time Degradation

**Symptoms:** Average response time > 500ms

**Diagnosis:**

```bash
# Check slow queries
curl 'http://localhost:9090/api/v1/query?query=http_request_duration_seconds_bucket'

# Check Celery queue depth
celery -A app.workers inspect reserved
```

**Resolution:**

1. Scale Celery workers:
   ```bash
   docker-compose up -d --scale celery=3
   ```
2. Optimize slow queries
3. Add caching

---

## Disaster Recovery

### Database Corruption

1. **Alert Phase**
   - Monitor detects database errors
   - Alerts sent to on-call

2. **Mitigation Phase**

   ```bash
   # Stop writes
   docker-compose pause api

   # Restore from latest backup
   docker-compose exec db psql -U postgres predator < backup_latest.sql

   # Verify data
   docker-compose exec db psql -U postgres -d predator \
     -c "SELECT COUNT(*) FROM agents;"

   # Resume
   docker-compose unpause api
   ```

### Partial Data Loss

1. Enable point-in-time recovery:

   ```bash
   # Check WAL archive
   ls -lh /var/lib/postgresql/data/pg_wal/
   ```

2. Restore to specific point:
   ```sql
   RESTORE DATABASE predator FROM BACKUP
   UNTIL TIME '2025-11-03 10:30:00 UTC';
   ```

### Complete Failure

1. **Full Recovery Procedure**

   ```bash
   # 1. Stop all services
   docker-compose down

   # 2. Restore volumes
   docker volume rm predator12-postgres-data
   docker volume create predator12-postgres-data
   docker run --rm -v predator12-postgres-data:/data \
     -v $(pwd):/backup ubuntu tar xzf /backup/volume-backup.tar.gz -C /data

   # 3. Start services
   docker-compose up -d

   # 4. Verify
   curl http://localhost:8000/health
   ```

---

## Performance Tuning

### Database Optimization

```sql
-- Create missing indexes
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM agents WHERE status = 'active';

-- Update statistics
ANALYZE agents;
```

### Celery Tuning

```python
# Optimize configuration
app.conf.update(
    worker_prefetch_multiplier=4,  # Batch processing
    task_soft_time_limit=300,      # 5 min soft limit
    worker_max_tasks_per_child=1000, # Memory leak prevention
)
```

### Caching Strategy

```python
# Add Redis caching
@cache.cached(timeout=300, key_prefix='agent_')
async def get_agent(agent_id: str):
    return db.query(Agent).filter_by(id=agent_id).first()
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale Celery workers
docker-compose up -d --scale celery=5

# Scale API servers (with load balancer)
docker-compose up -d --scale api=3

# Verify
docker-compose ps | grep api
```

### Vertical Scaling

```bash
# Increase resources in docker-compose.prod.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

---

## Security

### Regular Security Checks

1. **Daily**: Review failed login attempts

   ```bash
   docker-compose logs keycloak | grep "Invalid credentials"
   ```

2. **Weekly**: Rotate secrets

   ```bash
   bash scripts/rotate-secrets.sh
   ```

3. **Monthly**: Security scan
   ```bash
   trivy image predator12/api:latest
   ```

### Credential Management

```bash
# Never commit secrets
echo ".env.production" >> .gitignore

# Use environment variables
export TELEGRAM_BOT_TOKEN=<token>
export SECRET_KEY=<key>

# Rotate regularly
bash scripts/key-rotation.sh
```

---

## Troubleshooting

### Common Issues

| Problem            | Symptoms                | Solution                             |
| ------------------ | ----------------------- | ------------------------------------ |
| API not responding | 502 Bad Gateway         | Check API logs, restart container    |
| High latency       | Response time > 1s      | Scale horizontally, optimize queries |
| Memory leak        | Increasing memory usage | Restart worker, code review          |
| Database locked    | "database is locked"    | Kill blocking queries, analyze       |
| Redis unavailable  | "Connection refused"    | Check Redis container, restart       |

### Debugging Tools

```bash
# Check logs
docker-compose logs --tail=100 api

# Monitor resources
watch -n 1 'docker stats predator12-api --no-stream'

# Profile Python code
python -m cProfile -s cumtime backend/app/main.py

# Database debugging
docker-compose exec db psql -U postgres predator
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

---

## Escalation

| Severity    | Response Time | Escalation                   |
| ----------- | ------------- | ---------------------------- |
| 🟢 Low      | 1 hour        | Document in log              |
| 🟡 Medium   | 15 mins       | Notify on-call               |
| 🔴 High     | 5 mins        | Page on-call + team lead     |
| 🔴 Critical | Immediate     | Page team, wake-up if needed |

---

## Post-Incident Review

Template for after-incident reviews:

```markdown
# Incident Report - [Date] [Title]

## Timeline

- **14:32** - Alert triggered
- **14:35** - On-call responded
- **14:42** - Issue identified
- **14:55** - Fix deployed
- **15:00** - Service recovered

## Root Cause

[Describe what caused the issue]

## Impact

- Duration: 28 minutes
- Affected users: X
- SLA impact: X%

## Resolution

[Describe what was done]

## Prevention

[What will we do to prevent this]

## Action Items

- [ ] Item 1 (Owner: X, Due: Date)
- [ ] Item 2 (Owner: Y, Due: Date)
```

---

## Contact & Resources

- **Slack Channel:** #predator12-ops
- **On-Call Rotation:** [Link to PagerDuty]
- **Status Page:** https://status.predator12.local
- **Documentation:** https://docs.predator12.local

---

**🎯 Remember:** In case of emergency, escalate immediately!  
**📞 Helpline:** [Phone Number]  
**✉️ Email:** ops@predator12.local
