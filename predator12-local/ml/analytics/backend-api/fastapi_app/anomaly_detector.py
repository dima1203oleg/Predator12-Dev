import os
import time
import requests
import numpy as np
import logging
from prometheus_client import Gauge, start_http_server
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from keras.models import Model, Sequential
from keras.layers import Dense, Input

try:
    from timeseries_explainer import TimeseriesExplainer
    HAS_EXPLAINER = True
except ImportError:
    HAS_EXPLAINER = False

PROMETHEUS_URL = os.getenv('PROMETHEUS_URL', 'http://prometheus:9090')
AGENT_LABEL = os.getenv('AGENT_LABEL', 'agent')

# Prometheus gauge for anomaly detection
anomaly_gauge = Gauge('mas_anomaly_detected', 'MAS anomaly detected', ['agent', 'metric'])

def fetch_prometheus_metrics(query):
    resp = requests.get(f"{PROMETHEUS_URL}/api/v1/query", params={'query': query})
    result = resp.json()
    if result['status'] == 'success':
        return result['data']['result']
    return []

def detect_anomalies(agent, metric, values, method="zscore"):
    """Detect anomalies using Z-score, Isolation Forest, Autoencoder, or One-Class SVM."""
    arr = np.array(values).reshape(-1, 1)
    if len(arr) < 5:
        return False
    anomaly = False
    explanation = None
    if method == "zscore":
        mean = np.mean(arr)
        std = np.std(arr)
        if std == 0:
            return False
        z_scores = np.abs((arr - mean) / std)
        anomaly = np.any(z_scores > 3)
    elif method == "isolation_forest":
        clf = IsolationForest(contamination=0.1, random_state=42)
        preds = clf.fit_predict(arr)
        anomaly = np.any(preds == -1)
    elif method == "one_class_svm":
        clf = OneClassSVM(nu=0.1, kernel="rbf", gamma='scale')
        preds = clf.fit_predict(arr)
        anomaly = np.any(preds == -1)
    elif method == "autoencoder":
        # Simple dense autoencoder for demonstration
        model = Sequential([
            Dense(8, activation='relu', input_shape=(1,)),
            Dense(1, activation='linear')
        ])
        model.compile(optimizer='adam', loss='mse')
        model.fit(arr, arr, epochs=10, verbose=0)
        reconstructed = model.predict(arr)
        mse = np.mean(np.square(arr - reconstructed), axis=1)
        anomaly = np.any(mse > np.percentile(mse, 90))
    else:
        logging.warning(f"Unknown anomaly detection method: {method}")
        return False
    if anomaly:
        anomaly_gauge.labels(agent=agent, metric=metric).set(1)
        logging.warning(f"Anomaly detected for {agent} - {metric} using {method}")
        if HAS_EXPLAINER:
            explainer = TimeseriesExplainer()
            explanation = explainer.explain(arr.flatten().tolist())
            logging.info(f"Anomaly explanation: {explanation}")
    else:
        anomaly_gauge.labels(agent=agent, metric=metric).set(0)
    return anomaly

def main():
    metrics = [
        ('cpu', 'agent_cpu_usage'),
        ('ram', 'agent_ram_usage'),
        ('disk', 'agent_disk_usage'),
        ('latency', 'agent_ping_latency'),
    ]
    start_http_server(9105)  # Expose custom metrics
    print('Anomaly detector started. Monitoring agents...')
    while True:
        for metric_name, prom_metric in metrics:
            results = fetch_prometheus_metrics(prometheus_url, f'{prom_metric}')
            for item in results:
                agent = item['metric'].get(agent_label, 'unknown')
                # Prometheus returns a list of vectors, get recent values
                values = []
                # If using instant vector, just use current value
                try:
                    value = float(item['value'][1])
                    values.append(value)
                except Exception:
                    continue
                # Anomaly detection (can be extended to time-series)
                anomalies = detect_anomalies(values)
                if len(anomalies) > 0:
                    g_anomaly_detected.labels(agent=agent, metric=metric_name).set(1)
                    print(f"Anomaly detected for {agent} on {metric_name}: {values}")
                else:
                    g_anomaly_detected.labels(agent=agent, metric=metric_name).set(0)
        time.sleep(30)

if __name__ == '__main__':
    main()
