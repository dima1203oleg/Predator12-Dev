from __future__ import annotations

import os
from typing import Any

import psycopg2
import psycopg2.extras
from fastapi import APIRouter, Depends, HTTPException, Request
from opensearchpy import OpenSearch
from pydantic import BaseModel, Field

from app.auth import verify_token_required
from app.services.security.pii import mask_document


class SearchQuery(BaseModel):
    index: str = Field(..., description="Index or alias to query (e.g., customs_safe_current)")
    filters: dict[str, Any] = Field(default_factory=dict)
    group_by: list[str] = Field(default_factory=list)
    metrics: dict[str, str] = Field(default_factory=dict)
    include_pii: bool = False
    size: int = 50


router = APIRouter(prefix="/search", tags=["search"])

OS_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator11")


def _os_client() -> OpenSearch:
    return OpenSearch(hosts=[OS_URL])


def _pg_conn():
    return psycopg2.connect(DB_URL)


def _build_os_query(q: SearchQuery) -> dict[str, Any]:
    must = []
    for k, v in q.filters.items():
        if isinstance(v, list):
            must.append({"terms": {k: v}})
        else:
            must.append({"term": {k: v}})
    body: dict[str, Any] = {"query": {"bool": {"must": must}}}

    # Simple aggregations if group_by is provided
    if q.group_by:
        # Single-level terms agg chain
        aggs: dict[str, Any] = {}
        current = aggs
        for i, field in enumerate(q.group_by):
            key = f"group_{i}_{field}"
            current[key] = {"terms": {"field": field, "size": 100}}
            if i < len(q.group_by) - 1:
                current[key]["aggs"] = {}
                current = current[key]["aggs"]
        # Optional metrics (count/avg/sum over a field)
        if q.metrics:
            # attach to deepest level
            deepest = current if current else aggs
            for name, expr in q.metrics.items():
                # expr like: "sum:amount" or "avg:value"
                try:
                    fn, fld = expr.split(":", 1)
                except ValueError:
                    continue
                metric_key = f"metric_{name}"
                deepest[metric_key] = {fn: {"field": fld}}
        body["aggs"] = aggs
        body["size"] = 0
    else:
        body["size"] = q.size

    return body


def _is_allowed_to_view_pii(user_roles: list[str], billing_plan: str) -> bool:
    # Minimal gate: require role with 'view_pii' OR plan in {pro, gov}
    if any(r.lower() == "view_pii" for r in user_roles):
        return True
    return billing_plan.lower() in {"pro", "gov", "lea"}


def _audit_pii_access(
    request: Request,
    index: str,
    filters: dict[str, Any],
    actor: str,
    allowed: bool,
) -> None:
    try:
        with _pg_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS audit_pii_access (
                        id SERIAL PRIMARY KEY,
                        ts TIMESTAMP DEFAULT NOW(),
                        actor TEXT,
                        index_name TEXT,
                        filters JSONB,
                        allowed BOOLEAN,
                        ip TEXT
                    )
                    """
                )
                cur.execute(
                    (
                        "INSERT INTO audit_pii_access(actor, index_name, filters, allowed, ip) "
                        "VALUES (%s, %s, %s, %s, %s)"
                    ),
                    (
                        actor,
                        index,
                        psycopg2.extras.Json(filters),
                        allowed,
                        request.client.host if request.client else None,
                    ),
                )
    except Exception:
        # Best-effort; do not fail query due to audit failure
        pass


@router.post("/query")
async def search_query(
    q: SearchQuery,
    request: Request,
    payload: dict = Depends(verify_token_required),
):
    client = _os_client()

    # Access control
    allowed = False
    if q.include_pii:
        # Extract roles from Keycloak token
        roles = []
        try:
            realm_access = payload.get("realm_access", {}) or {}
            roles.extend(realm_access.get("roles", []) or [])
        except Exception:
            roles = []

        # Billing plan from token custom claim (default to free)
        plan = (payload.get("billing_plan") or "free").lower()

        # Actor (user) id from token (sub/preferred_username)
        actor = payload.get("preferred_username") or payload.get("sub") or "anonymous"

        allowed = _is_allowed_to_view_pii(roles, plan)
        _audit_pii_access(request, q.index, q.filters, actor, allowed)
        if not allowed:
            raise HTTPException(status_code=403, detail="PII access denied by role/plan policy")

    # Build and execute OS query
    body = _build_os_query(q)
    try:
        resp = client.search(index=q.index, body=body)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenSearch error: {e}")

    # If aggregations, return as-is
    if "aggregations" in resp:
        return {"took_ms": resp.get("took"), "aggregations": resp["aggregations"]}

    # Else return hits, with PII masked by default
    hits = resp.get("hits", {}).get("hits", [])
    docs = [h.get("_source", {}) for h in hits]

    if not q.include_pii:
        docs = [mask_document(d) for d in docs]

    return {
        "took_ms": resp.get("took"),
        "total": resp.get("hits", {}).get("total", {}).get("value", len(docs)),
        "documents": docs,
    }
