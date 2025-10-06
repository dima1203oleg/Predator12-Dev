import os
import csv
import io
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import execute_values
import requests
import json
from fastapi import APIRouter, UploadFile, File, HTTPException

PG_URI = os.environ.get("BACKEND_PG_URI", "")
OS_URL = os.environ.get("OS_URL", "http://opensearch:9200")

router = APIRouter(prefix="/api", tags=["ingest"])

TABLE_SQL = """
CREATE TABLE IF NOT EXISTS stg_customs (
  doc_id TEXT PRIMARY KEY,
  ts TIMESTAMP NULL,
  hs_code TEXT NULL,
  amount NUMERIC NULL,
  qty NUMERIC NULL,
  country TEXT NULL,
  company_name TEXT NULL,
  edrpou TEXT NULL
);
"""

@router.post("/ingest")
async def ingest_csv(file: UploadFile = File(...)):
    if not PG_URI:
        raise HTTPException(status_code=500, detail="BACKEND_PG_URI not configured")
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid encoding; expected utf-8")

    reader = csv.DictReader(io.StringIO(text))
    required = ["doc_id","ts","hs_code","amount","qty","country","company_name","edrpou"]
    for r in required:
        if r not in reader.fieldnames:
            raise HTTPException(status_code=400, detail=f"Missing column: {r}")

    rows: List[Dict[str, Any]] = list(reader)
    if not rows:
        return {"ingested": 0}

    # Insert into Postgres
    conn = psycopg2.connect(PG_URI)
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(TABLE_SQL)
                values = [(
                    r.get("doc_id"),
                    r.get("ts"),
                    r.get("hs_code"),
                    (r.get("amount") or None),
                    (r.get("qty") or None),
                    r.get("country"),
                    r.get("company_name"),
                    r.get("edrpou"),
                ) for r in rows]
                execute_values(cur,
                    """
                    INSERT INTO stg_customs (doc_id, ts, hs_code, amount, qty, country, company_name, edrpou)
                    VALUES %s
                    ON CONFLICT (doc_id) DO UPDATE SET
                      ts = EXCLUDED.ts,
                      hs_code = EXCLUDED.hs_code,
                      amount = EXCLUDED.amount,
                      qty = EXCLUDED.qty,
                      country = EXCLUDED.country,
                      company_name = EXCLUDED.company_name,
                      edrpou = EXCLUDED.edrpou
                    """,
                    values
                )
    finally:
        conn.close()

    # Index to OpenSearch (reuse alias naming from scripts)
    try:
        bulk_lines = []
        for r in rows:
            meta = {"index": {"_index": "customs_restricted_current", "_id": r.get("doc_id")}}
            bulk_lines.append(meta)
            bulk_lines.append(r)
        ndjson = "\n".join([json.dumps(x, ensure_ascii=False) for x in bulk_lines]) + "\n"
        resp = requests.post(f"{OS_URL}/_bulk", data=ndjson.encode("utf-8"), headers={"Content-Type":"application/x-ndjson"}, timeout=30)
        if resp.status_code >= 300:
            snippet = (resp.text or "")[:300]
            raise HTTPException(status_code=502, detail=f"OpenSearch bulk failed: {resp.status_code} {snippet}")

        # Also index masked version into safe alias (simple masking here for demo)
        masked_lines = []
        for r in rows:
            m = dict(r)
            if m.get("company_name"):
                m["company_name"] = None
            if m.get("edrpou"):
                m["edrpou"] = None
            meta = {"index": {"_index": "customs_safe_current", "_id": r.get("doc_id")}}
            masked_lines.append(meta)
            masked_lines.append(m)
        ndjson2 = "\n".join([json.dumps(x, ensure_ascii=False) for x in masked_lines]) + "\n"
        resp2 = requests.post(f"{OS_URL}/_bulk", data=ndjson2.encode("utf-8"), headers={"Content-Type":"application/x-ndjson"}, timeout=30)
        if resp2.status_code >= 300:
            snippet2 = (resp2.text or "")[:300]
            raise HTTPException(status_code=502, detail=f"OpenSearch bulk (masked) failed: {resp2.status_code} {snippet2}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Indexing error: {e}")

    return {"ingested": len(rows)}
