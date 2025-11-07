# Моніторинг та Алерти

## Система спостереження

Predator11 має повний стек моніторингу для забезпечення надійності та продуктивності системи.

## Компоненти моніторингу

### Prometheus

- Збір метрик з усіх сервісів
- Налаштовані правила алертів
- Retention: 15 днів

### Grafana

Доступні дашборди:

- **System Overview** - загальний стан системи
- **Agent Performance** - метрики агентів
- **OpenSearch Cluster** - стан кластера
- **ETL Pipeline** - статус ETL процесів

### Alertmanager

Автоматичні сповіщення у Telegram:

- 🚨 **CRITICAL** - падіння сервісу, помилки PII
- ⚠️ **WARNING** - високе навантаження, довгі відповіді
- 🔧 **AutoHeal** - автоматичне відновлення

## Ключові метрики

```prometheus
# Приклади метрик
agent_response_time_seconds{agent_name="NEXUS_SUPERVISOR"}
pii_detection_failures_total
etl_records_processed_total
model_inference_duration_seconds{model_name="phi-4-reasoning"}
opensearch_cluster_health
system_memory_usage_percent
```

## Налаштування алертів

Конфігурація в `observability/prometheus/rules/alerts.yml`:

```yaml
groups:
  - name: system_alerts
    rules:
      - alert: HighMemoryUsage
        expr: system_memory_usage_percent > 85
        for: 5m
        annotations:
          summary: "Високе використання пам'яті"
```

## Логування

### Loki

- Централізоване збирання логів
- Структуровані JSON логи
- Інтеграція з Grafana

### Доступ до логів:

```bash
# Системні логи
make export-logs

# Логи конкретного сервісу
docker-compose logs -f backend
```
