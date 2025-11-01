import pytest
from fastapi_app.anomaly_detector import detect_anomalies

def test_zscore_anomaly():
    values = [1, 1, 1, 1, 10]
    assert detect_anomalies('agent-1', 'cpu', values, method="zscore")

def test_isolation_forest_anomaly():
    values = [1, 1, 1, 1, 10]
    assert detect_anomalies('agent-1', 'cpu', values, method="isolation_forest")

def test_one_class_svm_anomaly():
    values = [1, 1, 1, 1, 10]
    assert detect_anomalies('agent-1', 'cpu', values, method="one_class_svm")

def test_autoencoder_anomaly():
    values = [1, 1, 1, 1, 10]
    assert detect_anomalies('agent-1', 'cpu', values, method="autoencoder")
