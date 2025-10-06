# Tiered Cache v2 Upgrade Guide

## Upgrade Steps

1. **Build new image**:
   ```bash
   docker build -t predator/orchestrator:v2 -f backend/Dockerfile .
   ```

2. **Deploy gradually**:
   ```bash
   # Stage 1: 25% traffic
   kubectl set image deployment/predator-orchestrator \
     orchestrator=predator/orchestrator:v2 --replicas=1
   
   # Stage 2: 50% traffic
   kubectl scale deployment/predator-orchestrator --replicas=2
   
   # Full rollout
   kubectl rollout restart deployment/predator-orchestrator
   ```

3. **Verify metrics**:
   ```bash
   # Check cache hit rates
   curl http://metrics:9001/metrics | grep cache_hits
   ```

## Rollback Procedure

```bash
# Revert to previous version
kubectl rollout undo deployment/predator-orchestrator
```

## Expected Impact

- 10-30% faster response times
- 20% lower Redis load
- No downtime during upgrade

## Monitoring Checklist

1. Cache hit rate > 80%
2. Error rate < 0.1%
3. Memory usage stable
4. CPU utilization normal
