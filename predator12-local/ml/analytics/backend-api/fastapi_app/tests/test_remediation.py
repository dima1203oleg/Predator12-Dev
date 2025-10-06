import pytest
from unittest.mock import patch
from fastapi_app import auto_remediation

def test_restart_agent_k8s():
    with patch('fastapi_app.auto_remediation.client.CoreV1Api') as mock_k8s:
        mock_api = mock_k8s.return_value
        mock_api.list_namespaced_pod.return_value.items = [type('obj', (object,), {'metadata': type('obj', (object,), {'name': 'agent-1-pod'})})]
        auto_remediation.restart_agent('agent-1', namespace='default')
        mock_api.delete_namespaced_pod.assert_called_with(name='agent-1-pod', namespace='default')
