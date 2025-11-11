# Database Synchronization System

Automated synchronization between PostgreSQL, OpenSearch, Qdrant, and Redis for the Predator12 platform.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL (Source)                      │
│                  Primary Database of Record                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Sync Orchestrator
                      │ (db-sync-orchestrator.py)
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│OpenSearch │ │  Qdrant   │ │   Redis   │ │   MinIO   │
│           │ │           │ │           │ │           │
│Full-Text  │ │  Vector   │ │   Cache   │ │  Object   │
│  Search   │ │Embeddings │ │Invalidate │ │ Metadata  │
└───────────┘ └───────────┘ └───────────┘ └───────────┘
```

### Data Flow

1. **PostgreSQL → OpenSearch**
   - Syncs relational data for full-text search
   - Indexes documents with search-optimized fields
   - Updates search index incrementally

2. **PostgreSQL → Qdrant**
   - Generates vector embeddings from text data
   - Stores embeddings for similarity search
   - Supports semantic search capabilities

3. **Redis Cache Invalidation**
   - Invalidates cached entries for updated records
   - Maintains cache consistency
   - Selective invalidation based on change patterns

4. **MinIO Metadata Sync**
   - Synchronizes file metadata (optional)
   - Updates object storage indexes
   - Maintains file-database consistency

## Features

### Core Capabilities

- ✅ **Full Sync**: Complete database synchronization
- ✅ **Incremental Sync**: Only changed records since last sync
- ✅ **Selective Sync**: Target specific databases
- ✅ **Skip Options**: Skip Qdrant or OpenSearch as needed
- ✅ **Fail-Fast Mode**: Stop on first error for quick feedback
- ✅ **Graceful Degradation**: Continue on non-critical failures
- ✅ **Comprehensive Logging**: Detailed colored output
- ✅ **CI/CD Support**: Detects CI environment, disables colors
- ✅ **Health Checks**: Built-in status monitoring

### Automation

- **Celery Integration**: Automated background execution
- **Cron Support**: Traditional scheduled execution
- **Beat Schedule**: Every 2 hours by default
- **Event-Driven**: Trigger on database changes

## Usage

### Command Line

#### Full Sync (All Databases)

```bash
python scripts/db-sync-orchestrator.py
```

#### Skip Specific Databases

```bash
# Skip Qdrant
python scripts/db-sync-orchestrator.py --skip-qdrant

# Skip OpenSearch
python scripts/db-sync-orchestrator.py --skip-opensearch

# Skip both (Redis only)
python scripts/db-sync-orchestrator.py --skip-qdrant --skip-opensearch
```

#### Single Database Sync

```bash
# Sync only OpenSearch
python scripts/db-sync-orchestrator.py --single opensearch

# Sync only Qdrant
python scripts/db-sync-orchestrator.py --single qdrant

# Sync only Redis
python scripts/db-sync-orchestrator.py --single redis
```

#### Fail-Fast Mode

```bash
# Stop on first error
python scripts/db-sync-orchestrator.py --fail-fast
```

#### Save Results to File

```bash
# Export results as JSON
python scripts/db-sync-orchestrator.py --output results.json
```

### Via Celery Task

```python
from app.workers.tasks import database_sync_task

# Trigger sync task
result = database_sync_task.delay()

# Wait for result
sync_result = result.get(timeout=300)  # 5 minute timeout
print(sync_result['status'])
```

### Via opsctl

```bash
# Run ETL with database sync
./scripts/opsctl etl-run --jobs all --nonstop
```

## Configuration

### Environment Variables

#### PostgreSQL (Source)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/predator12"
```

#### OpenSearch
```bash
OPENSEARCH_URL="http://localhost:9200"
OPENSEARCH_USERNAME="admin"
OPENSEARCH_PASSWORD="admin"
```

#### Qdrant
```bash
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="your-api-key"  # Optional
```

#### Redis
```bash
REDIS_URL="redis://:password@localhost:6379/0"
```

#### MinIO (Optional)
```bash
MINIO_URL="http://localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### Celery Configuration

Edit `predator12-local/backend/app/workers/celery_app.py`:

```python
# Beat schedule - database sync every 2 hours
celery_app.conf.beat_schedule = {
    'database-sync': {
        'task': 'app.workers.tasks.database_sync_task',
        'schedule': 7200.0,  # 2 hours
    },
}
```

### Cron Configuration

See `scripts/db-sync-cron.example` for cron job templates:

```bash
# Copy example to system cron
sudo cp scripts/db-sync-cron.example /etc/cron.d/predator12-db-sync

# Edit and customize
sudo nano /etc/cron.d/predator12-db-sync
```

## Monitoring

### Health Checks

Check sync status via API endpoint:

```bash
curl http://localhost:8000/api/v1/health/db-sync
```

Response:
```json
{
  "status": "healthy",
  "last_sync": "2024-11-11T23:00:00Z",
  "next_sync": "2024-11-12T01:00:00Z",
  "databases": {
    "opensearch": {"status": "ok", "records": 1250},
    "qdrant": {"status": "ok", "vectors": 890},
    "redis": {"status": "ok", "keys_invalidated": 450}
  }
}
```

### Logs

View Celery worker logs:

```bash
# Docker
docker logs -f predator12-celery-worker

# Local
tail -f logs/celery-worker.log
```

View Beat scheduler logs:

```bash
# Docker
docker logs -f predator12-celery-beat

# Local
tail -f logs/celery-beat.log
```

### Metrics

Monitor via Prometheus/Grafana:

```prometheus
# Sync duration
celery_task_duration_seconds{task="database_sync_task"}

# Sync success rate
rate(celery_task_success_total{task="database_sync_task"}[5m])

# Sync failure rate
rate(celery_task_failure_total{task="database_sync_task"}[5m])
```

## Troubleshooting

### Common Issues

#### 1. OpenSearch Connection Failed

**Symptom:**
```
✗ OpenSearch sync failed: Connection refused
```

**Solution:**
```bash
# Check OpenSearch is running
curl http://localhost:9200

# Check credentials
export OPENSEARCH_USERNAME=admin
export OPENSEARCH_PASSWORD=admin

# Restart OpenSearch
docker restart opensearch
```

#### 2. Qdrant Connection Timeout

**Symptom:**
```
✗ Qdrant sync failed: Connection timeout
```

**Solution:**
```bash
# Check Qdrant is running
curl http://localhost:6333/health

# Increase timeout in code
# Or skip Qdrant temporarily
python scripts/db-sync-orchestrator.py --skip-qdrant
```

#### 3. Redis Cache Issues

**Symptom:**
```
⚠ Redis cache invalidation failed: Authentication required
```

**Solution:**
```bash
# Check Redis password
redis-cli -a your-password ping

# Update REDIS_URL with password
export REDIS_URL="redis://:your-password@localhost:6379/0"
```

#### 4. Sync Takes Too Long

**Symptom:**
Sync exceeds timeout (5 minutes default)

**Solution:**
```python
# Increase timeout in celery task
result = database_sync_task.delay()
sync_result = result.get(timeout=600)  # 10 minutes
```

Or use fail-fast mode to identify bottleneck:
```bash
python scripts/db-sync-orchestrator.py --fail-fast
```

#### 5. Partial Sync Failure

**Symptom:**
```
✓ OpenSearch sync completed
✗ Qdrant sync failed
✓ Redis cache invalidation completed
```

**Solution:**
Run single database sync to isolate issue:
```bash
# Retry failed database only
python scripts/db-sync-orchestrator.py --single qdrant
```

### Debug Mode

Enable detailed logging:

```bash
# Set log level
export LOG_LEVEL=DEBUG

# Run sync with verbose output
python scripts/db-sync-orchestrator.py --fail-fast
```

### Manual Verification

Verify sync results:

```bash
# Check OpenSearch index count
curl http://localhost:9200/predator12_docs/_count

# Check Qdrant collection count
curl http://localhost:6333/collections/predator12_vectors

# Check Redis keys
redis-cli KEYS "cache:*" | wc -l
```

## Best Practices

### 1. Scheduling

- **Production**: Every 2 hours (default)
- **Development**: Every 4-6 hours
- **High-Traffic**: Every hour
- **Low-Priority**: Daily at off-peak hours

### 2. Error Handling

- Use `--fail-fast` in CI/CD for quick feedback
- Use graceful degradation in production
- Monitor sync success rates
- Set up alerts for consecutive failures

### 3. Performance Optimization

- Schedule during off-peak hours
- Use `--single` for targeted updates
- Consider incremental sync for large datasets
- Monitor sync duration trends

### 4. Security

- Use environment variables for credentials
- Rotate database passwords regularly
- Use TLS/SSL for connections
- Implement IP whitelisting

### 5. Testing

Before deploying changes:

```bash
# Test in development
python scripts/db-sync-orchestrator.py --single redis

# Test with fail-fast
python scripts/db-sync-orchestrator.py --fail-fast

# Run integration tests
pytest tests/integration/test_db_sync.py
```

### 6. Rollback Strategy

If sync causes issues:

```bash
# Stop Celery Beat (prevents new syncs)
celery -A app.workers.celery_app control shutdown

# Restore from backup
pg_restore -d predator12 backup.sql

# Rebuild indexes
curl -X POST http://localhost:9200/predator12_docs/_refresh
```

## Integration Examples

### Python API

```python
from scripts.db_sync_orchestrator import DatabaseSyncOrchestrator

# Create orchestrator
config = {'fail_fast': True}
orchestrator = DatabaseSyncOrchestrator(config)

# Run full sync
success = orchestrator.run_sync()

# Get detailed results
results = orchestrator.get_results()
print(f"Status: {results['overall_status']}")
print(f"Duration: {results['end_time'] - results['start_time']}")
```

### REST API Endpoint

```python
from fastapi import APIRouter
from app.workers.tasks import database_sync_task

router = APIRouter()

@router.post("/api/v1/admin/db-sync")
async def trigger_db_sync():
    """Trigger manual database synchronization"""
    task = database_sync_task.delay()
    return {"task_id": task.id, "status": "queued"}

@router.get("/api/v1/admin/db-sync/{task_id}")
async def get_sync_status(task_id: str):
    """Get synchronization status"""
    result = database_sync_task.AsyncResult(task_id)
    return {
        "task_id": task_id,
        "status": result.state,
        "result": result.result if result.ready() else None
    }
```

## Support

For issues or questions:

- Check troubleshooting guide above
- Review logs: `logs/celery-worker.log`
- Check health endpoint: `/api/v1/health/db-sync`
- Open issue on GitHub with logs and error messages

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-11  
**Maintained by**: Predator12 DevOps Team
