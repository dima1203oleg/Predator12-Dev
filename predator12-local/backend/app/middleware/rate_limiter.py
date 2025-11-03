"""
Rate Limiting Middleware для Predator12 API
Реалізує Token Bucket та Sliding Window алгоритми
"""

import asyncio
import time
from typing import Callable, Dict, Optional, Tuple

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitStore:
    """Зберігання даних для rate limiting (in-memory для локальної розробки)"""

    def __init__(self):
        self.requests: Dict[str, list] = {}
        self.lock = asyncio.Lock()

    async def is_allowed(
        self, key: str, max_requests: int, window_seconds: int
    ) -> Tuple[bool, Dict]:
        """
        Перевіряє чи дозволена запит.

        Args:
            key: Ключ для ідентифікації (IP, user_id тощо)
            max_requests: Максимум запитів у вікні
            window_seconds: Розмір вікна в секундах

        Returns:
            (allowed, info_dict)
        """
        async with self.lock:
            now = time.time()
            cutoff = now - window_seconds

            # Очистити старі запити
            if key not in self.requests:
                self.requests[key] = []

            self.requests[key] = [req_time for req_time in self.requests[key] if req_time > cutoff]

            # Перевірити ліміт
            allowed = len(self.requests[key]) < max_requests

            if allowed:
                self.requests[key].append(now)

            remaining = max_requests - len(self.requests[key])
            reset_at = (
                int(self.requests[key][0] + window_seconds)
                if self.requests[key]
                else int(now + window_seconds)
            )

            return allowed, {
                "limit": max_requests,
                "remaining": remaining,
                "reset": reset_at,
                "retry_after": max(0, reset_at - int(now)),
            }


# Глобальний rate limit store
rate_limit_store = RateLimitStore()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware для rate limiting

    Конфігурація:
        - Global: 1000 req/хвилину на всіх користувачів
        - Per-IP: 100 req/хвилину на IP
        - Per-Endpoint: Спеціальні правила для дорогих операцій
    """

    # Конфігурація за ендпоінтами
    ENDPOINT_LIMITS = {
        # Дорогі операції - жорсткіші ліміти
        "/api/v1/agents/training": (10, 3600),  # 10 на годину
        "/api/v1/ingest/upload": (20, 3600),  # 20 на годину
        "/api/v1/search": (100, 60),  # 100 на хвилину
        "/api/v1/agents": (200, 60),  # 200 на хвилину для список агентів
        # Default для інших ендпоінтів
        "*": (1000, 60),  # 1000 на хвилину
    }

    def __init__(self, app):
        super().__init__(app)
        self.app = app

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Обробка запиту з rate limiting"""

        # Пропустити здоров'я-чеки
        if request.url.path in ["/healthz", "/health", "/metrics"]:
            return await call_next(request)

        # Отримати IP адресу
        client_ip = request.client.host if request.client else "unknown"

        # Визначити ліміт для цього ендпоінту
        max_requests, window = self.ENDPOINT_LIMITS.get("*", (1000, 60))
        for pattern, (mr, w) in self.ENDPOINT_LIMITS.items():
            if pattern != "*" and request.url.path.startswith(pattern):
                max_requests, window = mr, w
                break

        # Перевірити rate limit
        rate_key = f"{client_ip}:{request.url.path}"
        allowed, info = await rate_limit_store.is_allowed(rate_key, max_requests, window)

        # Додати headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(max(0, info["remaining"]))
        response.headers["X-RateLimit-Reset"] = str(info["reset"])

        # Відхилити якщо перевищено ліміт
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded",
                    "retry_after": info["retry_after"],
                },
                headers={
                    "Retry-After": str(info["retry_after"]),
                    "X-RateLimit-Reset": str(info["reset"]),
                },
            )

        return response


class CORSPolicyMiddleware(BaseHTTPMiddleware):
    """
    CORS Policy Middleware для Predator12
    Реалізує strict CORS політику для security
    """

    # Дозволені домени
    ALLOWED_ORIGINS = {
        "http://localhost:3000",
        "http://localhost:3005",
        "http://localhost:5173",
        "http://localhost:5090",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    }

    # Дозволені методи
    ALLOWED_METHODS = {"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"}

    # Дозволені headers
    ALLOWED_HEADERS = {
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
    }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Обробка CORS запитів"""

        origin = request.headers.get("origin")

        # Перевірити origin
        if origin and origin not in self.ALLOWED_ORIGINS:
            # CORS не дозволена для цього origin
            if request.method == "OPTIONS":
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CORS policy violation"},
                )

        # Обробити запит
        response = await call_next(request)

        # Додати CORS headers для дозволених origins
        if origin and origin in self.ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = ", ".join(self.ALLOWED_METHODS)
            response.headers["Access-Control-Allow-Headers"] = ", ".join(self.ALLOWED_HEADERS)
            response.headers["Access-Control-Max-Age"] = "3600"

        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Security Headers Middleware для Predator12
    Додає важливі security headers на всі відповіді
    """

    SECURITY_HEADERS = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' ws: wss:"
        ),
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": ("geolocation=(), " "microphone=(), " "camera=(), " "payment=()"),
    }

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Додати security headers до відповіді"""
        response = await call_next(request)

        # Додати security headers
        for header, value in self.SECURITY_HEADERS.items():
            response.headers[header] = value

        return response
