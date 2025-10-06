# Grafana ML Anomaly Detection

Grafana має вбудовані ML-плагіни для anomaly detection (наприклад, Grafana Machine Learning, Prometheus Machine Learning).

## Встановлення Grafana ML plugin

1. Відкрийте Grafana → Plugins → Find more plugins → Machine Learning
2. Встановіть та активуйте плагін
3. Додайте новий ML Job (наприклад, anomaly detection для метрик FastAPI, Kafka, Redis)

## Приклад використання
- Виберіть метрику (наприклад, http_requests_total)
- Налаштуйте job на anomaly detection
- Grafana автоматично створить алерти при виявленні аномалій

[Документація Grafana ML](https://grafana.com/docs/grafana/latest/machine-learning/)
