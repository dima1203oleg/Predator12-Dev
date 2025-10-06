from __future__ import annotations

import os
import time
from typing import Any, Iterable

import psycopg2
from opensearchpy import OpenSearch, helpers


def _pg_connect() -> psycopg2.extensions.connection:
    dsn = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator11")
    return psycopg2.connect(dsn)


def _os_client() -> OpenSearch:
    base = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
    return OpenSearch(hosts=[base])


def stream_pg_rows(query: str, fetch_size: int = 1000) -> Iterable[dict[str, Any]]:
    with _pg_connect() as conn:
        with conn.cursor(name="idx_cur") as cur:  # server-side cursor
            cur.itersize = fetch_size
            cur.execute(query)
            colnames = [d.name for d in cur.description]
            for row in cur:
                yield dict(zip(colnames, row))


def index_bulk(index: str, docs: Iterable[dict[str, Any]], id_field: str | None = None) -> tuple[int, int]:
    client = _os_client()
    actions = (
        {
            "_index": index,
            "_id": (doc.get(id_field) if id_field else None),
            "_source": doc,
        }
        for doc in docs
    )
    success, failed = helpers.bulk(client, actions, stats_only=True)
    return success, failed


def run_index_pg_to_opensearch(
    source_query: str,
    target_index: str,
    id_field: str | None = None,
    fetch_size: int = 1000,
) -> dict[str, Any]:
    start = time.time()
    docs = stream_pg_rows(source_query, fetch_size=fetch_size)
    success, failed = index_bulk(target_index, docs, id_field=id_field)
    return {
        "index": target_index,
        "success": success,
        "failed": failed,
        "duration_sec": round(time.time() - start, 2),
    }
