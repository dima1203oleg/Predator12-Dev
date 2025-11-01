#!/bin/bash

# Exit on error
set -e

echo "🚀 Initializing Predator Monitoring Stack..."

# Create necessary directories
echo "📂 Creating directories..."
mkdir -p observability/prometheus/rules
mkdir -p observability/alertmanager/templates
mkdir -p observability/loki
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards

# Set permissions
echo "🔒 Setting permissions..."
chmod -R 777 grafana/
chmod -R 777 observability/

# Create Prometheus configuration
echo "📝 Generating Prometheus configuration..."
cat > observability/prometheus/prometheus.yml << 'EOL'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s
  external_labels:
    monitor: 'predator-monitor'
    environment: 'development'

rule_files:
  - '/etc/prometheus/rules/*.yml'
  - '/etc/prometheus/rules/recording.yml'
  - '/etc/prometheus/rules/alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 15s
    scrape_timeout: 10s

  - job_name: 'opensearch'
    metrics_path: '/_prometheus/metrics'
    static_configs:
      - targets: ['opensearch:9200']
    scheme: https
    tls_config:
      insecure_skip_verify: true
    basic_auth:
      username: '${OPENSEARCH_USER}'
      password: '${OPENSEARCH_PASSWORD}'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'opensearch:9200'

  - job_name: 'opensearch_exporter'
    static_configs:
      - targets: ['opensearch_exporter:9114']
    scrape_interval: 30s

  - job_name: 'grafana'
    metrics_path: /metrics
    static_configs:
      - targets: ['grafana:3000']

  - job_name: 'minio'
    metrics_path: /minio/v2/metrics/cluster
    static_configs:
      - targets: ['minio:9000']

  - job_name: 'keycloak'
    metrics_path: /metrics
    static_configs:
      - targets: ['keycloak:8080']

  - job_name: 'node_exporter'
    static_configs:
      - targets: ['node_exporter:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: '${HOSTNAME}:9100'

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    scheme: http
    metrics_path: /metrics
    scrape_interval: 15s
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: '${HOSTNAME}:8080'
EOL

# Create Alertmanager configuration
echo "📝 Generating Alertmanager configuration..."
cat > observability/alertmanager/alertmanager.yml << 'EOL'
global:
  resolve_timeout: 5m
  smtp_smarthost: '${SMTP_SERVER}:${SMTP_PORT}'
  smtp_from: '${EMAIL_FROM}'
  smtp_auth_username: '${SMTP_USER}'
  smtp_auth_password: '${SMTP_PASSWORD}'
  smtp_require_tls: true

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: 'critical'
      receiver: 'critical-notifications'
      continue: true
    - match:
        severity: 'warning'
      receiver: 'warning-notifications'
      continue: true

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '${SLACK_CHANNEL:-#alerts}'
        send_resolved: true
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
        color: '{{ if eq .Status "firing" }}{{ if eq .CommonLabels.severity "critical" }}danger{{ else }}warning{{ end }}{{ else }}good{{ end }}'
  - name: 'critical-notifications'
    email_configs:
      - to: '${EMAIL_TO}'
        send_resolved: true
  - name: 'warning-notifications'
    email_configs:
      - to: '${EMAIL_TO}'
        send_resolved: true

templates:
  - '/etc/alertmanager/templates/*.tmpl'
EOL

# Create Slack template for Alertmanager
echo "📝 Generating Slack template..."
cat > observability/alertmanager/templates/slack.tmpl << 'EOL'
{{ define "slack.default.title" }}{{ .CommonLabels.alertname }} - {{ .CommonLabels.severity | toUpper }}{{ end }}

{{ define "slack.default.text" }}
{{ range .Alerts }}
*Alert:* {{ .Annotations.summary }}
*Description:* {{ .Annotations.description }}
*Status:* {{ .Status | toUpper }}
*Starts at:* {{ .StartsAt.Format "2006-01-02 15:04:05 UTC" }}
{{ if gt (len .Labels) 0 }}*Labels:*
{{ range .Labels.SortedPairs }}• {{ .Name }}: `{{ .Value }}`
{{ end }}
{{ end }}
{{ end }}
{{ end }}
EOL

# Create Grafana datasource configuration
echo "📝 Generating Grafana datasource configuration..."
cat > grafana/provisioning/datasources/datasource.yml << 'EOL'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    version: 1
    editable: true
    jsonData:
      timeInterval: "15s"
      httpMethod: "POST"
      manageAlerts: true
      alertmanagerUid: "alertmanager"

  - name: Alertmanager
    type: alertmanager
    access: proxy
    url: http://alertmanager:9093
    jsonData:
      implementation: "prometheus"
      httpMethod: "POST"

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    version: 1
    editable: true
    jsonData:
      maxLines: 1000
      derivedFields:
        - datasourceUid: "prometheus"
          matcherRegex: "traceID=(\\w+)"
          name: "TraceID"
          url: "$${__value.raw}"
EOL

# Create Grafana dashboard provider configuration
echo "📝 Generating Grafana dashboard provider configuration..."
cat > grafana/provisioning/dashboards/dashboard.yml << 'EOL'
apiVersion: 1

providers:
  - name: 'Predator Dashboards'
    orgId: 1
    folder: 'Predator'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
      foldersFromFilesStructure: true
EOL

echo "✅ Monitoring stack initialization complete!"
