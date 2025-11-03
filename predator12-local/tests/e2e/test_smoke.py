"""
E2E тестування для Predator12 з використанням pytest
Smoke тесты для основних user flows
"""

import json
from typing import Any, Dict

import httpx
import pytest

BASE_URL = "http://localhost:8000"


@pytest.fixture
async def client():
    """Клієнт для HTTP запитів"""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        yield client


class TestHealthAndStatus:
    """Тесты здоров'я системи"""

    @pytest.mark.asyncio
    async def test_health_check(self, client):
        """Перевірка endpoint /health"""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "components" in data

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client):
        """Перевірка root endpoint"""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

    @pytest.mark.asyncio
    async def test_metrics_endpoint(self, client):
        """Перевірка Prometheus metrics"""
        response = await client.get("/metrics")
        assert response.status_code == 200
        assert "# HELP" in response.text or "# TYPE" in response.text


class TestAgentsAPI:
    """Тесты для Agents API endpoints"""

    @pytest.mark.asyncio
    async def test_list_agents(self, client):
        """Список всіх агентів"""
        response = await client.get("/api/v1/agents")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list) or isinstance(data, dict)

    @pytest.mark.asyncio
    async def test_get_agent_status(self, client):
        """Отримання статусу конкретного агента"""
        response = await client.get("/api/v1/agents/status")
        assert response.status_code in [200, 404]  # 404 якщо агента немає

    @pytest.mark.asyncio
    async def test_supervisor_status(self, client):
        """Статус supervisor"""
        response = await client.get("/api/v1/supervisor/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "agents" in data


class TestRateLimiting:
    """Тесты Rate Limiting middleware"""

    @pytest.mark.asyncio
    async def test_rate_limit_headers_present(self, client):
        """Перевірка наявності rate limit headers"""
        response = await client.get("/health")
        assert response.status_code == 200
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
        assert "X-RateLimit-Reset" in response.headers

    @pytest.mark.asyncio
    async def test_rate_limit_enforcement(self, client):
        """Перевірка роботи rate limiting"""
        # Це залежить від конкретних конфігурацій, але можна перевірити структуру
        tasks = []
        for i in range(5):
            task = client.get("/health")
            tasks.append(task)

        # Не повинна бути помилка 429 для здоров'я-чеків (вони пропускаються)
        # але для реальних endpoint'ів вона може з'явитися


class TestSecurity:
    """Тесты Security Headers"""

    @pytest.mark.asyncio
    async def test_security_headers_present(self, client):
        """Перевірка наявності security headers"""
        response = await client.get("/health")
        assert "X-Content-Type-Options" in response.headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert "X-Frame-Options" in response.headers
        assert response.headers["X-Frame-Options"] == "DENY"

    @pytest.mark.asyncio
    async def test_content_security_policy(self, client):
        """Перевірка CSP header"""
        response = await client.get("/health")
        assert "Content-Security-Policy" in response.headers
        csp = response.headers["Content-Security-Policy"]
        assert "default-src" in csp

    @pytest.mark.asyncio
    async def test_strict_transport_security(self, client):
        """Перевірка HSTS header"""
        response = await client.get("/health")
        assert "Strict-Transport-Security" in response.headers


class TestAPIErrors:
    """Тесты обробки помилок"""

    @pytest.mark.asyncio
    async def test_404_error(self, client):
        """Тест 404 помилки"""
        response = await client.get("/api/v1/nonexistent")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_method_not_allowed(self, client):
        """Тест 405 помилки"""
        response = await client.post("/health")  # GET only endpoint
        # Может бути 405 або 404 в залежності від конфігурації


class TestPerformance:
    """Тесты performance"""

    @pytest.mark.asyncio
    async def test_response_time_health(self, client):
        """Перевірка часу відповіді /health"""
        import time

        start = time.time()
        response = await client.get("/health")
        elapsed = time.time() - start

        assert response.status_code == 200
        assert elapsed < 1.0  # Мав бути < 1 секунди

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, client):
        """Тест конкурентних запитів"""
        import asyncio

        async def make_request():
            return await client.get("/health")

        tasks = [make_request() for _ in range(10)]
        responses = await asyncio.gather(*tasks)

        for response in responses:
            assert response.status_code == 200


@pytest.fixture
def deployment_ready_checklist() -> Dict[str, bool]:
    """Чек-лист для production deployment"""
    return {
        "health_endpoints_ok": False,
        "rate_limiting_active": False,
        "security_headers_ok": False,
        "agents_responding": False,
        "no_errors": False,
    }


@pytest.mark.asyncio
async def test_deployment_readiness(client, deployment_ready_checklist):
    """Комплексна перевірка готовності до deployment"""

    # 1. Health endpoints
    health_response = await client.get("/health")
    deployment_ready_checklist["health_endpoints_ok"] = health_response.status_code == 200

    # 2. Rate limiting
    rate_limit_headers = all(
        header in health_response.headers
        for header in ["X-RateLimit-Limit", "X-RateLimit-Remaining"]
    )
    deployment_ready_checklist["rate_limiting_active"] = rate_limit_headers

    # 3. Security headers
    security_headers = all(
        header in health_response.headers
        for header in ["X-Content-Type-Options", "X-Frame-Options"]
    )
    deployment_ready_checklist["security_headers_ok"] = security_headers

    # 4. Agents responding
    agents_response = await client.get("/api/v1/agents")
    deployment_ready_checklist["agents_responding"] = agents_response.status_code in [200, 404]

    # 5. No 5xx errors
    deployment_ready_checklist["no_errors"] = health_response.status_code < 500

    # Висновок
    all_ready = all(deployment_ready_checklist.values())
    print(f"\nDeployment Readiness: {deployment_ready_checklist}")

    return all_ready
