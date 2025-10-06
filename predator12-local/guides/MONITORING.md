# Monitoring Stack (Prometheus, Grafana, Alertmanager)

This guide describes the built-in monitoring stack configured via `observability/`.

## Components

- Prometheus: scraping metrics and evaluating rules
- Alertmanager: receiving alerts from Prometheus (dev-null receiver by default)
- Grafana: dashboards with a pre-provisioned Prometheus datasource
- Node Exporter: host/container basic metrics (inside Docker network)
- cAdvisor: container-level metrics

## Prometheus

Config file: `observability/prometheus/prometheus.yml`

Scrape targets:
- `mcp-server:3010/metrics`
- `keycloak:8080/metrics`
- `minio:9000/minio/v2/metrics/cluster`
- `node-exporter:9100`
- `cadvisor:8080`

Open UI: `http://localhost:9090`

## Grafana

Provisioned via:
- Datasource: `observability/grafana/provisioning/datasources/datasource.yml`
- Dashboards provider: `observability/grafana/provisioning/dashboards/dashboards.yml`
- Example dashboard: `observability/grafana/dashboards/mcp-overview.json`

Open UI: `http://localhost:3000`

Default admin user: `admin` with password from `GF_SECURITY_ADMIN_PASSWORD` (default `admin`).

## Alertmanager

Config file: `observability/alertmanager/alertmanager.yml`

Default receiver is `dev-null`. To enable real notifications, add a receiver (e.g., Slack, Email):

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: https://hooks.slack.com/services/XXX/YYY/ZZZ
        channel: '#alerts'
```

Then set `route.receiver: 'slack'`.

Open UI: `http://localhost:9093`

## Adding more metrics

- Add new scrape targets to `prometheus.yml` under `scrape_configs`
- Expose `/metrics` in your apps (e.g., use `prometheus-client` for Python / `prom-client` for Node)
- Import more Grafana dashboards (`.json`) into `observability/grafana/dashboards/`
