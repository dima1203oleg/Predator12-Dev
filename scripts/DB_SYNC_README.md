# Database Synchronization System

## Overview

The Predator12 system uses multiple databases that need to be kept in sync:

| Database | Purpose | Sync Direction | Update Frequency |
|----------|---------|----------------|------------------|
| **PostgreSQL** | Primary relational database | Source | Real-time writes |
| **OpenSearch** | Full-text search and logs | ← PostgreSQL | Every 1-2 hours |
| **Qdrant** | Vector embeddings for AI | ← PostgreSQL | Every 2-4 hours |
| **Redis** | Cache and message queue | Invalidated | After each sync |
| **MinIO** | Object storage | Self-contained | No sync needed |

## Architecture

```
┌──────────────┐
│  PostgreSQL  │ (Source of Truth)
└──────┬───────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌──────────────┐                      ┌──────────────┐
│  OpenSearch  │ (Full-text Search)   │    Qdrant    │ (Vector Search)
└──────────────┘                      └──────────────┘
       │
       ▼
┌──────────────┐
│    Redis     │ (Cache Invalidation)
└──────────────┘
```

## Components

### 1. Database Sync Orchestrator (`db-sync-orchestrator.py`)

Main synchronization script that coordinates all database sync operations.

**Features:**
- ✅ Parallel sync execution
- ✅ Error handling and retry logic
- ✅ Detailed logging and reporting
- ✅ Selective sync (skip specific databases)
- ✅ Single database sync mode
- ✅ Timeout protection
- ✅ Performance metrics

**Usage:**

```bash
# Full sync (all databases)
./scripts/db-sync-orchestrator.py

# Skip Qdrant (useful during development)
./scripts/db-sync-orchestrator.py --skip-qdrant

# Skip OpenSearch
./scripts/db-sync-orchestrator.py --skip-opensearch

# Sync only OpenSearch
./scripts/db-sync-orchestrator.py --single opensearch

# Sync only Qdrant
./scripts/db-sync-orchestrator.py --single qdrant

# Stop on first failure (default: continue on errors)
./scripts/db-sync-orchestrator.py --fail-fast

# Enable debug logging
./scripts/db-sync-orchestrator.py --verbose
```

### 2. Operations Control Script (`opsctl`)

Unified operations script for CI/CD workflows.

**Commands:**

```bash
# Build, test, and security scan
./scripts/opsctl build-test-scan

# Deploy to environment
./scripts/opsctl deploy stage --kubeconfig kubeconfig --nonstop

# Run ETL jobs (includes database sync)
./scripts/opsctl etl-run --jobs changed --nonstop

# Check release gate
./scripts/opsctl check-gate --env prod

# Conditional production release
./scripts/opsctl maybe-release --env prod --timebox 12h

# Deploy with Helm
./scripts/opsctl helm-deploy --env stage --kube kubeconfig

# Enable auto-healing
./scripts/opsctl enable-autoheal --env stage

# Show local daemon instructions
./scripts/opsctl run-local-daemon --env dev
```

### 3. Celery Tasks (Automated Scheduling)

Database sync is integrated into the Celery task queue for automated execution.

**Configuration:** `predator12-local/backend/app/workers/celery_app.py`

**Default Schedule:**
- Every 2 hours (7200 seconds)
- Queue: `db_sync`
- Automatic retry on failure

**Manual Trigger:**

```python
from app.workers.tasks import database_sync_task

# Trigger full sync
result = database_sync_task.delay()

# Skip Qdrant
result = database_sync_task.delay(skip_qdrant=True)

# Skip OpenSearch
result = database_sync_task.delay(skip_opensearch=True)
```

### 4. Cron Jobs (Alternative to Celery)

For systems without Celery, use cron jobs instead.

**Setup:**

```bash
# Edit crontab
crontab -e

# Add one of the examples from db-sync-cron.example
# Example: Full sync every 2 hours
0 */2 * * * cd /path/to/Predator12-Dev && python3 scripts/db-sync-orchestrator.py >> /var/log/predator12/db-sync.log 2>&1
```

See `scripts/db-sync-cron.example` for more scheduling options.

## Sync Operations Details

### PostgreSQL → OpenSearch

**Script:** `predator12-local/scripts/index_pg_to_opensearch.py`

**Purpose:**
- Index customs declarations for full-text search
- Enable fast filtering by multiple fields
- Support aggregations and analytics

**Data Flow:**
1. Query PostgreSQL for declarations
2. Transform data to search-optimized format
3. Bulk index to OpenSearch
4. Update alias to point to new index

**Configuration:**
- `OPENSEARCH_URL`: OpenSearch endpoint
- `POSTGRES_CONN`: PostgreSQL connection string
- `BATCH`: Batch size (default: 2000)
- `LIMIT`: Max records to sync (default: 10000)

### PostgreSQL → Qdrant

**Script:** `predator12-local/ml/analytics/backend-api/scripts/postgres_to_qdrant.py`

**Purpose:**
- Generate vector embeddings for semantic search
- Enable similarity search across declarations
- Support AI-powered recommendations

**Data Flow:**
1. Query PostgreSQL for declarations
2. Generate embeddings using AI model
3. Upload vectors to Qdrant collection
4. Store metadata for filtering

**Configuration:**
- `PREDATOR_DB_URL`: PostgreSQL connection string
- `QDRANT_URL`: Qdrant endpoint
- `COLLECTION`: Collection name (default: customs_registry_embeddings)

**Note:** This sync is slower due to embedding generation. Consider:
- Running less frequently (every 4 hours)
- Using batch processing
- Running during off-peak hours

### Redis Cache Invalidation

**Purpose:**
- Clear cached query results after data updates
- Ensure users see fresh data
- Maintain cache consistency

**Modes:**
- **Selective**: Invalidate specific key patterns (recommended)
- **Full Flush**: Clear entire cache (use with caution)

**Configuration:**
- `REDIS_URL`: Redis connection string

## Environment Variables

```bash
# PostgreSQL
export PREDATOR_DB_URL="postgresql://user:pass@localhost:5432/predator_db"
export POSTGRES_CONN="postgresql+psycopg2://user:pass@localhost:5432/predator_analytics"

# OpenSearch
export OPENSEARCH_URL="http://localhost:9200"

# Qdrant
export QDRANT_URL="http://localhost:6333"

# Redis
export REDIS_URL="redis://localhost:6379"

# Celery (if using)
export CELERY_BROKER_URL="redis://localhost:6379/1"
export CELERY_RESULT_BACKEND="redis://localhost:6379/2"
```

## Monitoring

### Check Sync Status

```bash
# View sync orchestrator logs
tail -f /var/log/predator12/db-sync.log

# Check last sync result
grep "SYNCHRONIZATION SUMMARY" /var/log/predator12/db-sync.log | tail -1

# Check Celery task status
celery -A app.workers.celery_app inspect active

# View specific queue
celery -A app.workers.celery_app inspect active_queues
```

### Health Checks

```bash
# Check OpenSearch index
curl -X GET "http://localhost:9200/_cat/indices/customs_safe*?v"

# Check Qdrant collection
curl -X GET "http://localhost:6333/collections/customs_registry_embeddings"

# Check Redis
redis-cli INFO keyspace
```

### Performance Metrics

The sync orchestrator provides detailed metrics:

```
======================================================================
SYNCHRONIZATION SUMMARY
======================================================================
Total duration: 245.67s
Tasks completed: 4/4
Successful: 4
Failed: 0
======================================================================
```

## Troubleshooting

### Issue: Sync Times Out

**Solution:**
- Increase timeout in `db-sync-orchestrator.py`
- Process data in smaller batches
- Run only one database at a time using `--single`

### Issue: Qdrant Sync Fails

**Common Causes:**
- Embedding model not available
- API rate limits
- Collection not initialized

**Solution:**
```bash
# Skip Qdrant temporarily
./scripts/db-sync-orchestrator.py --skip-qdrant

# Check Qdrant health
curl http://localhost:6333/healthz

# Verify collection exists
curl http://localhost:6333/collections
```

### Issue: OpenSearch Sync Fails

**Common Causes:**
- Index mapping conflicts
- Disk space full
- Authentication issues

**Solution:**
```bash
# Check OpenSearch logs
docker logs predator-opensearch

# Check disk space
curl -X GET "http://localhost:9200/_cluster/stats?pretty"

# Recreate index
curl -X DELETE "http://localhost:9200/customs_safe*"
```

### Issue: Celery Task Not Running

**Solution:**
```bash
# Check Celery beat is running
ps aux | grep celery

# Restart Celery worker
docker-compose restart worker scheduler

# Check task schedule
celery -A app.workers.celery_app inspect scheduled
```

## Best Practices

### 1. Scheduling

**Development:**
- Manual sync when needed
- Or every 4 hours to save resources

**Production:**
- OpenSearch: Every 1-2 hours
- Qdrant: Every 2-4 hours
- Redis: After each data sync

### 2. Error Handling

- **Don't use `--fail-fast`** in production (allow other syncs to continue)
- **Monitor logs** regularly
- **Set up alerts** for repeated failures
- **Use selective sync** when troubleshooting

### 3. Performance

- **Run during off-peak hours** when possible
- **Use batch processing** for large datasets
- **Monitor resource usage** (CPU, memory, disk)
- **Consider incremental sync** for large tables

### 4. Maintenance

- **Rotate logs** regularly (use logrotate)
- **Monitor disk space** for OpenSearch and Qdrant
- **Clean up old indices** periodically
- **Test sync after schema changes**

## CI/CD Integration

The sync system is integrated into the CI/CD pipeline via `opsctl`:

```yaml
# .github/workflows/nonstop.yml
- name: Run ETL changed jobs
  run: ./scripts/opsctl etl-run --jobs changed --nonstop
```

This ensures database synchronization happens automatically after deployments.

## Rollback Procedure

If a sync causes issues:

1. **Stop ongoing syncs:**
   ```bash
   # Kill running sync
   pkill -f db-sync-orchestrator.py
   
   # Or stop Celery worker
   docker-compose stop worker
   ```

2. **Revert indices/collections:**
   ```bash
   # OpenSearch: Switch alias back
   curl -X POST "http://localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
   {
     "actions": [
       {"remove": {"index": "customs_safe-20231201", "alias": "customs_safe_current"}},
       {"add": {"index": "customs_safe-20231130", "alias": "customs_safe_current"}}
     ]
   }'
   
   # Qdrant: Delete collection and recreate
   curl -X DELETE "http://localhost:6333/collections/customs_registry_embeddings"
   ```

3. **Clear Redis cache:**
   ```bash
   redis-cli FLUSHDB
   ```

4. **Re-run sync:**
   ```bash
   ./scripts/db-sync-orchestrator.py
   ```

## Future Enhancements

- [ ] Incremental sync (delta updates only)
- [ ] Change Data Capture (CDC) with PostgreSQL logical replication
- [ ] Real-time sync via Kafka/Redpanda
- [ ] Automatic rollback on sync failures
- [ ] Web dashboard for sync monitoring
- [ ] Prometheus metrics export
- [ ] Multi-region sync support

## Support

For issues or questions:
1. Check the logs: `/var/log/predator12/db-sync.log`
2. Review this README
3. Check the scripts: `scripts/db-sync-orchestrator.py`
4. Contact the DevOps team

---

**Last Updated:** 2024-11-09
**Version:** 1.0.0
