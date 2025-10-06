# Runbook: OpenSearch Slow Aggregations

- **Symptoms**
High p95 latency (>3s), dashboard timeouts, heap pressure.

- **Immediate checks**
1. Cluster health (`/_cluster/health`).
2. Node JVM heap and cache stats.
3. Shard counts per index and rollover status.

- **Diagnostics**
- Review ILM/ISM policy and segment merges.
- Check query cache/hit ratio and hot/warm/cold tiering.

- **Remediation**
- Force-merge warm indices, increase shards for hot indices.
- Optimize aggregations (filters/keyword fields, runtime fields avoidance).
- Increase query result cache size carefully.

- **Prevention**
- Apply correct index templates and rollover at 40–60GB.
- Enable request caching on aggregation-heavy indices.
