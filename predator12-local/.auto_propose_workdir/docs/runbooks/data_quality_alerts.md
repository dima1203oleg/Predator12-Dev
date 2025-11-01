# Data Quality Alert Runbook

## High Error Rate

### Symptoms
- Prometheus alert: `HighErrorRate`
- Validation failures > 0.1/sec

### Investigation
```bash
# Check error types:
curl http://prometheus:9090/api/v1/query?query=dq_validation_errors_total

# View recent logs:
kubectl logs -l app=etl-processor --tail=100
```

### Resolution
1. **Temporary fix**:
   ```python
   # Disable strict validation
   VALIDATION_MODE = "warn"
   ```

2. **Permanent fix**:
   - Repair source data
   - Update validation rules

---

## Low Completeness

### Symptoms
- Field completeness < 90%
- `LowCompleteness` alert

### Actions
1. Identify affected fields:
   ```bash
   curl http://prometheus:9090/api/v1/query?query=dq_field_completeness_ratio
   ```

2. Check extractor logic
3. Verify source systems

---

## ETL Delay

### Recovery Steps
1. Check last success:
   ```bash
   curl http://prometheus:9090/api/v1/query?query=dq_last_success_timestamp
   ```

2. Restart pipeline:
   ```bash
   kubectl rollout restart deployment/etl-processor
   ```

3. Force full refresh if needed:
   ```bash
   redis-cli DEL etl:last_success
   ```
