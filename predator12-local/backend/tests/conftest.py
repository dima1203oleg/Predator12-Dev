import pytest
from fastapi.testclient import TestClient
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

# Setup test client
@pytest.fixture
def client():
    """Test client fixture"""
    from app.main import app
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def mock_supervisor():
    """Mock supervisor for testing"""
    mock = AsyncMock()
    mock.get_status.return_value = {
        "status": "operational",
        "agents": {
            "dataset": {"status": "active", "tasks_pending": 0},
            "anomaly": {"status": "active", "tasks_pending": 1},
            "forecast": {"status": "idle", "tasks_pending": 0}
        }
    }
    return mock

@pytest.fixture
def mock_celery_task():
    """Mock Celery task for testing"""
    mock = MagicMock()
    mock.id = "test-task-123"
    mock.status = "PENDING"
    mock.result = None
    return mock

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Test configuration
TEST_DATABASE_URL = "sqlite:///./test.db"
TEST_REDIS_URL = "redis://localhost:6379/1"
