# Runbook: Ingest Stalled or Failing

- **Symptoms**
Ingest job stuck, no progress updates on `/ws/progress`, delayed indices in OpenSearch.

- **Immediate checks**
1. Check Redis queue length and worker health.
2. Inspect backend logs for exceptions (Loki if available).
3. Verify MinIO connectivity and object size.

- **Diagnostics**
- Validate dataset config in `etl/config/datasets.yml`.
- Verify OpenSearch write-alias points to correct index (`*_current`).

- **Remediation**
- Restart worker container; requeue failed tasks.
- Re-run ingest from the last successful chunk.
- Increase chunk size/timeouts if network slow.

- **Prevention**
- Add SLAs/alerts for ETL lag in Prometheus.
- Enable retries with exponential backoff.
