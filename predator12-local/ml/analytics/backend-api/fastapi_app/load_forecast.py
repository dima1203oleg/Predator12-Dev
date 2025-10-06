import os
import requests
import numpy as np
from prometheus_client import Gauge, start_http_server
from datetime import datetime
import time

# Custom Prometheus metric for forecasted overload/failure risk
g_forecast_risk = Gauge('mas_forecast_risk', 'MAS forecasted risk (1=high, 0=normal)', ['agent', 'metric'])

def fetch_prometheus_range(prometheus_url, query, start, end, step='60s'):
    resp = requests.get(f"{prometheus_url}/api/v1/query_range", params={
        'query': query,
        'start': start,
        'end': end,
        'step': step
    })
    resp.raise_for_status()
    data = resp.json()
    if data['status'] == 'success':
        return data['data']['result']
    return []

def simple_forecast(values, threshold=0.8):
    # Predict risk if moving average > threshold (e.g., 80% CPU)
    if len(values) < 5:
        return 0
    avg = np.mean(values[-5:])
    return int(avg > threshold)

def main():
    prometheus_url = os.getenv('PROMETHEUS_URL', 'http://prometheus:9090')
    agent_label = os.getenv('AGENT_LABEL', 'agent')
    metrics = [
        ('cpu', 'agent_cpu_usage', 0.8),
        ('ram', 'agent_ram_usage', 0.85),
        ('latency', 'agent_ping_latency', 0.5),
    ]
    start_http_server(9106)
    print('Load forecast started. Monitoring agents...')
    while True:
        now = int(time.time())
        start_range = now - 3600  # last hour
        for metric_name, prom_metric, threshold in metrics:
            results = fetch_prometheus_range(prometheus_url, prom_metric, start_range, now)
            for item in results:
                agent = item['metric'].get(agent_label, 'unknown')
                values = [float(v[1]) for v in item['values'] if v[1] is not None]
                risk = simple_forecast(values, threshold)
                g_forecast_risk.labels(agent=agent, metric=metric_name).set(risk)
                if risk:
                    print(f"[Forecast] High risk for {agent} on {metric_name} (avg={np.mean(values[-5:]):.2f})")
        time.sleep(300)

if __name__ == '__main__':
    main()
