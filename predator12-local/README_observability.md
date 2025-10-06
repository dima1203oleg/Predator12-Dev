# PredatorAnalytics Observability, Indexing & Self-Healing

## Overview

This setup provides comprehensive monitoring, alerting, and self-healing capabilities for the PredatorAnalytics stack. It includes:

- **Monitoring**: Prometheus with exporters for system, containers, and applications
- **Visualization**: Grafana with pre-configured dashboards
- **Alerting**: Prometheus rules + Alertmanager with Slack/Telegram integration
- **Indexing**: Excel data import into OpenSearch with proper schema
- **Self-Healing**: Automated remediation webhooks for common issues

## Quick Start

### 1. Start the Stack

```bash
cd /Users/dima/projects/AAPredator8.0/PredatorAnalytics
docker compose up -d prometheus grafana opensearch minio keycloak node_exporter cadvisor alertmanager
```

### 2. Verify Services

```bash
# Check container status
docker compose ps

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | .labels.job + " -> " + .labels.instance + " (" + .health + ")"'

# Check Grafana health
curl http://localhost:3000/api/health
```

### 3. Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Alertmanager**: http://localhost:9093

## Data Indexing

### Index from Excel File

```bash
docker run --rm --name excel-indexer --network predatoranalytics_predator-net \
  -v /Users/dima/projects/AAPredator8.0:/work \
  -v "/path/to/your/file.xlsx":/data/file.xlsx:ro \
  -e OPENSEARCH_URL=http://opensearch:9200 \
  -e OS_ALIAS=customs_safe_current \
  -e EXCEL_FILE=/data/file.xlsx \
  python:3.11 bash -lc "pip install -q pandas openpyxl requests && python /work/scripts/index_excel_to_opensearch.py"
```

### Index from Postgres Table

```bash
docker run --rm --name pg-indexer --network predatoranalytics_predator-net \
  -v /Users/dima/projects/AAPredator8.0:/work \
  -e OPENSEARCH_URL=http://opensearch:9200 \
  -e POSTGRES_CONN=postgresql+psycopg2://predator:predatorpass@postgres:5432/predator \
  -e PG_TABLE=stg_customs \
  python:3.11 bash -lc "pip install -q pandas requests sqlalchemy psycopg2-binary && python /work/scripts/index_pg_to_opensearch.py"
```

## Configuration Management

### Reload Prometheus Configuration

```bash
curl -X POST http://localhost:9090/-/reload
```

### Update Grafana Dashboards

Dashboards are auto-provisioned from `/observability/grafana/dashboards/`. To update:

1. Modify JSON files in the dashboards directory
2. Restart Grafana: `docker compose restart grafana`

### Manage Alert Rules

Rules are loaded from `/observability/prometheus.yml/rules/`. After changes:

```bash
curl -X POST http://localhost:9090/-/reload
```

## Alerting Setup

### Slack Integration

1. Create a Slack webhook: https://api.slack.com/apps/A0F7XDUAZ-incoming-webhooks
2. Set environment variable:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
   ```
3. Update Alertmanager config and restart:
   ```bash
   docker compose restart alertmanager
   ```

### Telegram Integration

1. Create a bot: https://t.me/BotFather
2. Get bot token and chat ID
3. Set environment variables:
   ```bash
   export TELEGRAM_BOT_TOKEN="your_bot_token"
   export TELEGRAM_CHAT_ID="your_chat_id"
   ```

## Self-Healing

The autoheal webhook service listens for alerts and executes remediation actions:

### Start Self-Healing Service

```bash
cd /Users/dima/projects/AAPredator8.0/services/autoheal_webhook
docker build -t autoheal-webhook .
docker run -d --name autoheal-webhook --network predatoranalytics_predator-net \
  -e SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL" \
  -e TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
  -e TELEGRAM_CHAT_ID="$TELEGRAM_CHAT_ID" \
  -p 8088:8088 \
  autoheal-webhook
```

### Test Self-Healing

```bash
# Simulate an alert
curl -X POST http://localhost:8088/alert \
  -H "Content-Type: application/json" \
  -d '{
    "alerts": [
      {
        "labels": {
          "alertname": "OpenSearchClusterRed",
          "instance": "opensearch:9200"
        },
        "annotations": {
          "summary": "Test alert for self-healing"
        }
      }
    ]
  }'
```

## Troubleshooting

### Check Logs

```bash
# Prometheus logs
docker logs prometheus

# Grafana logs
docker logs grafana

# OpenSearch logs
docker logs opensearch

# Alertmanager logs
docker logs alertmanager
```

### Debug Indexing

```bash
# Check OpenSearch alias
curl http://localhost:9200/_alias/customs_safe_current

# Count documents
curl http://localhost:9200/customs_safe_current/_count

# Search documents
curl -X POST http://localhost:9200/customs_safe_current/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}, "size": 5}'
```

### Common Issues

1. **MinIO unhealthy**: The healthcheck uses curl which isn't available in the container. This is cosmetic - MinIO works fine.

2. **Grafana datasource not found**: Restart Grafana after provisioning changes:
   ```bash
   docker compose restart grafana
   ```

3. **Alertmanager not receiving alerts**: Check Prometheus configuration:
   ```bash
   curl http://localhost:9090/api/v1/alertmanagers
   ```

## Environment Variables

Create a `.env` file in the PredatorAnalytics directory:

```bash
# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Grafana Security
GRAFANA_ADMIN_PASSWORD=your_secure_password

# Self-Healing
K8S_ENDPOINT=http://localhost:8001
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Excel/PG      │───▶│   Prometheus     │───▶│   Alertmanager  │
│   Data Source   │    │   + Exporters    │    │   + Webhooks    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   OpenSearch    │◀───│   Grafana        │    │   AutoHeal      │
│   (Indexing)    │    │   Dashboards     │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Performance Tuning

### Prometheus Retention

Adjust retention in docker-compose.yml:
```yaml
prometheus:
  command:
    - "--storage.tsdb.retention.time=30d"
```

### OpenSearch Optimization

- Monitor cluster health: http://localhost:9200/_cluster/health
- Check shard allocation: http://localhost:9200/_cat/shards
- Adjust ISM policies in `/opensearch/ism_policies/`

## Security Considerations

1. Change default passwords:
   - Grafana: Set `GF_SECURITY_ADMIN_PASSWORD`
   - OpenSearch: Use strong `OPENSEARCH_INITIAL_ADMIN_PASSWORD`

2. Enable authentication for production:
   - Grafana: Configure OAuth/OIDC
   - OpenSearch: Enable security plugin

3. Network security:
   - Use internal Docker networks
   - Implement network policies in Kubernetes

## Development

### VS Code Extensions Recommended

- Python (ms-python.python)
- Docker (ms-azuretools.vscode-docker)
- YAML (redhat.vscode-yaml)
- JSON (ms-vscode.json)

### Debug Commands

```bash
# Test Prometheus queries
curl 'http://localhost:9090/api/v1/query?query=up'

# Test Alertmanager
curl -X POST http://localhost:9093/api/v1/alerts \
  -d '[{"labels":{"alertname":"TestAlert"}}]'

# Check Grafana datasources
curl -u admin:admin http://localhost:3000/api/datasources
```

## Support

For issues or questions:

1. Check logs: `docker compose logs [service_name]`
2. Verify configurations in `/observability/` directory
3. Test individual components before full stack restart
4. Monitor resource usage: `docker stats`
