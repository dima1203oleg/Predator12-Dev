# Runbook: SDK Rate Limit or Timeouts

- **Symptoms**
Model calls fail with 429/5xx, UI stalls.

- **Immediate checks**
1. Inspect `/metrics` for router RPS and error rate.
2. Check exporter `opensearch_exporter` and backend logs.
3. Validate `MODEL_SDK_BASE_URL` and `MODEL_SDK_KEY`.

- **Diagnostics**
- Review `backend/model_registry.yaml` limits and fallbacks.
- Ensure Redis is healthy (cache/idempotency).

- **Remediation**
- Lower RPS in router env (`MODEL_ROUTER_RPS`).
- Increase backoff, rely on fallbacks, extend cache TTL.
- Apply plan-based quotas to reduce load.

- **Prevention**
- Grafana dashboards for SDK latency/tokens/min.
- Alertmanager rules on rate limit spikes.
