import pytest
from fastapi import status


def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["service"] == "predator-nexus-core"


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["message"] == "Predator Analytics - Nexus Core API"
    assert data["version"] == "1.0.0"
    assert "endpoints" in data


def test_status_endpoint(client):
    """Test status endpoint"""
    response = client.get("/api/status")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["service"] == "backend"
    assert data["status"] == "running"


def test_metrics_endpoint(client):
    """Test Prometheus metrics endpoint"""
    response = client.get("/metrics")
    assert response.status_code == status.HTTP_200_OK
    assert "http_requests_total" in response.text


def test_not_found_endpoint(client):
    """Test 404 handler"""
    response = client.get("/nonexistent")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert data["error"] == "Not found"
    assert data["path"] == "/nonexistent"
