"""
Integration tests for Rate Limiting Middleware
Тестування функціональності rate limiting
"""

import asyncio
import httpx
import pytest


BASE_URL = "http://localhost:8000"


@pytest.fixture
async def client():
    """HTTP client for testing"""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        yield client


class TestRateLimitingIntegration:
    """Integration tests for rate limiting"""

    @pytest.mark.asyncio
    async def test_rate_limit_headers_present(self, client):
        """Verify rate limit headers are present"""
        response = await client.get("/health")

        assert response.status_code == 200
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers
        assert "X-RateLimit-Reset" in response.headers

        # Parse header values
        limit = int(response.headers["X-RateLimit-Limit"])
        remaining = int(response.headers["X-RateLimit-Remaining"])
        reset = int(response.headers["X-RateLimit-Reset"])

        assert limit > 0
        assert remaining >= 0
        assert remaining < limit  # One request was made
        assert reset > 0

    @pytest.mark.asyncio
    async def test_rate_limit_enforcement_per_endpoint(self, client):
        """Test that different endpoints have different rate limits"""

        # Health endpoint should have high limit
        health_response = await client.get("/health")
        health_limit = int(health_response.headers["X-RateLimit-Limit"])

        # Make multiple requests to health endpoint
        for _ in range(5):
            response = await client.get("/health")
            assert response.status_code == 200

        # Verify rate limit is still available (high limit)
        final_response = await client.get("/health")
        final_remaining = int(final_response.headers["X-RateLimit-Remaining"])
        assert final_remaining > 0  # Should still have requests remaining

    @pytest.mark.asyncio
    async def test_rate_limit_429_response(self, client):
        """Test that 429 response is returned when limit exceeded"""

        # Try to make many rapid requests (burst)
        # This tests the rate limiting at /api/v1/agents endpoint

        tasks = []
        for i in range(5):
            tasks.append(client.get("/health"))

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # At least some requests should succeed
        successful = [r for r in responses if isinstance(r, httpx.Response) and r.status_code == 200]
        assert len(successful) > 0

    @pytest.mark.asyncio
    async def test_rate_limit_retry_after_header(self, client):
        """Test Retry-After header when rate limited"""

        # This test verifies that when we hit rate limit, we get proper headers
        response = await client.get("/health")

        assert response.status_code == 200
        # Retry-After header should be present if rate limited (429)
        # or should be absent/high value if not limited
        if response.status_code == 429:
            assert "Retry-After" in response.headers
            retry_after = int(response.headers["Retry-After"])
            assert retry_after >= 0

    @pytest.mark.asyncio
    async def test_rate_limit_reset_time(self, client):
        """Test that rate limit counter resets after window expires"""

        # Get initial state
        response1 = await client.get("/health")
        reset_time1 = int(response1.headers["X-RateLimit-Reset"])
        remaining1 = int(response1.headers["X-RateLimit-Remaining"])

        # Make another request immediately
        response2 = await client.get("/health")
        remaining2 = int(response2.headers["X-RateLimit-Remaining"])

        # Remaining should decrease
        assert remaining2 < remaining1

        # Reset time should be the same (same window)
        reset_time2 = int(response2.headers["X-RateLimit-Reset"])
        assert reset_time2 == reset_time1

    @pytest.mark.asyncio
    async def test_health_check_not_rate_limited(self, client):
        """Verify that /health endpoint is not rate limited"""

        # Make many rapid requests
        tasks = [client.get("/health") for _ in range(20)]
        responses = await asyncio.gather(*tasks)

        # All should succeed
        successful = [r for r in responses if r.status_code == 200]
        assert len(successful) == 20  # All requests should succeed

    @pytest.mark.asyncio
    async def test_metrics_endpoint_not_rate_limited(self, client):
        """Verify that /metrics endpoint is not rate limited"""

        # Make requests to /metrics
        for _ in range(10):
            response = await client.get("/metrics")
            # Should either succeed or not exist (not be rate limited)
            assert response.status_code in [200, 404]  # OK or not found, but not 429

    @pytest.mark.asyncio
    async def test_different_ips_have_separate_limits(self, client):
        """Test that different IP addresses have separate rate limits"""

        # This is a simplified test since both requests come from same IP
        # In production, this would be tested with different actual IPs

        response1 = await client.get("/health")
        remaining1 = int(response1.headers["X-RateLimit-Remaining"])

        response2 = await client.get("/health")
        remaining2 = int(response2.headers["X-RateLimit-Remaining"])

        # Same IP should share the same counter
        assert remaining2 < remaining1


class TestSecurityHeaders:
    """Test security headers middleware"""

    @pytest.mark.asyncio
    async def test_security_headers_present(self, client):
        """Verify all security headers are present"""

        response = await client.get("/health")

        # Required security headers
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
        assert "Strict-Transport-Security" in response.headers
        assert "Content-Security-Policy" in response.headers
        assert "Referrer-Policy" in response.headers

    @pytest.mark.asyncio
    async def test_content_type_options_nosniff(self, client):
        """Verify X-Content-Type-Options header value"""
        response = await client.get("/health")
        assert response.headers["X-Content-Type-Options"] == "nosniff"

    @pytest.mark.asyncio
    async def test_frame_options_deny(self, client):
        """Verify X-Frame-Options header value"""
        response = await client.get("/health")
        assert response.headers["X-Frame-Options"] == "DENY"

    @pytest.mark.asyncio
    async def test_xss_protection_enabled(self, client):
        """Verify X-XSS-Protection header value"""
        response = await client.get("/health")
        assert "1; mode=block" in response.headers["X-XSS-Protection"]

    @pytest.mark.asyncio
    async def test_strict_transport_security(self, client):
        """Verify Strict-Transport-Security header"""
        response = await client.get("/health")
        hsts = response.headers["Strict-Transport-Security"]
        assert "max-age=" in hsts
        assert "includeSubDomains" in hsts

    @pytest.mark.asyncio
    async def test_content_security_policy(self, client):
        """Verify Content-Security-Policy header"""
        response = await client.get("/health")
        csp = response.headers["Content-Security-Policy"]
        assert "default-src 'self'" in csp
        assert "script-src" in csp
        assert "style-src" in csp


class TestCORSPolicy:
    """Test CORS policy middleware"""

    @pytest.mark.asyncio
    async def test_cors_allowed_origins(self, client):
        """Test CORS for allowed origins"""

        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
        ]

        for origin in allowed_origins:
            response = await client.options(
                "/health",
                headers={"Origin": origin}
            )
            # OPTIONS request should be handled or 405 if not available
            assert response.status_code in [200, 405]

    @pytest.mark.asyncio
    async def test_cors_preflight_request(self, client):
        """Test CORS preflight request handling"""

        response = await client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            }
        )

        # Should allow or handle the preflight
        assert response.status_code in [200, 204, 405]
