from __future__ import annotations

import os
import time
from typing import Callable

import psycopg2
import psycopg2.extras
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator11")


def _pg_conn():
    return psycopg2.connect(DB_URL)


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        start = time.time()
        actor = "anonymous"
        # Try extract user from Keycloak token (already verified earlier in routes via dependency)
        try:
            auth = request.headers.get("authorization") or ""
            if auth.lower().startswith("bearer "):
                # Best-effort: store token hash only, not full token
                actor = f"bearer:{hash(auth[7:].strip())}"
        except Exception:
            pass

        response = None
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            duration_ms = int((time.time() - start) * 1000)
            path = request.url.path
            method = request.method
            ip = request.client.host if request.client else None
            try:
                with _pg_conn() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            CREATE TABLE IF NOT EXISTS audit_api_calls (
                                id SERIAL PRIMARY KEY,
                                ts TIMESTAMP DEFAULT NOW(),
                                actor TEXT,
                                method TEXT,
                                path TEXT,
                                status INTEGER,
                                duration_ms INTEGER,
                                ip TEXT
                            )
                            """
                        )
                        cur.execute(
                            (
                                "INSERT INTO audit_api_calls(actor, method, path, status, duration_ms, ip) "
                                "VALUES (%s, %s, %s, %s, %s, %s)"
                            ),
                            (actor, method, path, status, duration_ms, ip),
                        )
            except Exception:
                # Best-effort; do not break responses due to audit issues
                pass
