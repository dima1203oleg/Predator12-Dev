# Agent Orchestrator Runbook

## Common Operations

### Restarting Services
```bash
# Graceful restart of chief orchestrator
sudo systemctl restart predator-chief-orchestrator

# Restart supervisor
sudo systemctl restart predator-supervisor
```

### Monitoring Circuit Breakers
```bash
# Check circuit breaker states
curl http://localhost:9001/metrics | grep circuit_breaker_state

# Expected output:
# circuit_breaker_state{agent_name="AnomalyAgent"} 0  # 0=closed, 1=open, 2=half-open
```

### Clearing Caches
```bash
# Flush Redis cache
redis-cli FLUSHALL

# Verify cache size
curl http://localhost:9001/metrics | grep cache_size_bytes
```

## Troubleshooting

### High Error Rates
1. Check metrics:
   ```bash
   curl http://localhost:9001/metrics | grep '_error'
   ```
2. Identify failing agents
3. Check circuit breaker states
4. Review logs:
   ```bash
   journalctl -u predator-chief-orchestrator -n 100
   ```

### Performance Issues
1. Check latency metrics:
   ```bash
   curl http://localhost:9001/metrics | grep latency
   ```
2. Verify batch processing efficiency
3. Check cache hit rates

## Maintenance Procedures

### Deploying Updates
1. Drain traffic from node
2. Deploy new version
3. Warm up caches
4. Return to service

### Scaling Up
1. Add new orchestrator instance
2. Configure load balancing
3. Verify metrics aggregation

## Emergency Procedures

### Complete Outage
1. Fail over to backup region
2. Disable non-critical agents
3. Gradually restore services
