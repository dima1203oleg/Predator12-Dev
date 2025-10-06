import os
import sys
import json
from datetime import datetime
from typing import Any, Dict, List

import pandas as pd
import requests
from sqlalchemy import create_engine, text

OS_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
PG_CONN = os.getenv(
    "POSTGRES_CONN",
    "postgresql+psycopg2://predator_user:predator_password@localhost:5432/predator_analytics",
)
INDEX_NAME = os.getenv("OS_INDEX", f"customs_safe-{datetime.utcnow().strftime('%Y%m%d')}")
ALIAS_NAME = os.getenv("OS_ALIAS", "customs_safe_current")
TABLE = os.getenv("PG_TABLE", "declarations")
BATCH = int(os.getenv("BATCH", "2000"))
LIMIT = int(os.getenv("LIMIT", "10000"))

UA_TO_INTERNAL = {
    "номер митної декларації": "doc_id",
    "дата оформлення": "ts",
    "код товару": "hs_code",
    "фактурна вартість, валюта контракту": "amount",
    "країна походження": "country",
    "одержувач": "company_name",
}


def to_internal_columns(df: pd.DataFrame) -> pd.DataFrame:
    cols = {c: c for c in df.columns}
    # lower/strip for matching
    lower_map = {c: str(c).strip().lower() for c in df.columns}
    rename: Dict[str, str] = {}
    for orig, low in lower_map.items():
        if low in UA_TO_INTERNAL:
            rename[orig] = UA_TO_INTERNAL[low]
    out = df.rename(columns=rename).copy()

    # Ensure expected columns exist
    for c in ["doc_id", "ts", "hs_code", "amount", "country", "company_name"]:
        if c not in out.columns:
            out[c] = None

    # Parse dates (NaT for invalid)
    out["ts"] = pd.to_datetime(out["ts"], errors="coerce")
    # Numeric amount (NaN for invalid)
    out["amount"] = pd.to_numeric(out["amount"], errors="coerce")

    # Keep identifiers as strings only if present
    for c in ["doc_id", "hs_code", "country", "company_name"]:
        out[c] = out[c].astype(object)
        mask = out[c].notna()
        out.loc[mask, c] = out.loc[mask, c].astype(str)

    # Optional PII placeholder
    if "pii_person_name" not in out.columns:
        out["pii_person_name"] = None

    # Replace NaN with None for JSON serialization compatibility
    out = out.where(out.notna(), None)

    # Select only mapped columns for indexing
    return out[["doc_id", "ts", "hs_code", "amount", "country", "company_name", "pii_person_name"]]


def ensure_index_and_alias() -> None:
    # If alias already exists, assume environment is bootstrapped
    alias_resp = requests.get(f"{OS_URL}/_alias/{ALIAS_NAME}")
    if alias_resp.status_code == 200:
        print(f"ℹ️ Alias {ALIAS_NAME} already exists")
        return
    if alias_resp.status_code not in (200, 404):
        alias_resp.raise_for_status()

    # Bootstrap a stable first write index and attach alias
    base_index = f"{ALIAS_NAME}-000001"
    r = requests.head(f"{OS_URL}/{base_index}")
    if r.status_code == 404:
        settings = {
            "settings": {
                "index": {"opendistro.index_state_management.policy_id": "customs_policy"}
            }
        }
        cr = requests.put(f"{OS_URL}/{base_index}", json=settings)
        cr.raise_for_status()
        print(f"✅ Created index {base_index}")
    actions = {"actions": [{"add": {"index": base_index, "alias": ALIAS_NAME, "is_write_index": True}}]}
    ar = requests.post(f"{OS_URL}/_aliases", json=actions)
    if ar.status_code not in (200, 201):
        print("⚠️ Alias resp:", ar.status_code, ar.text)
        ar.raise_for_status()
    print(f"✅ Alias {ALIAS_NAME} -> {base_index}")


def bulk_index(rows: List[Dict[str, Any]]):
    if not rows:
        return
    # Prepare NDJSON
    ndjson_lines: List[str] = []
    for r in rows:
        # Always index via alias so the current write index is used
        action = {"index": {"_index": ALIAS_NAME}}
        ndjson_lines.append(json.dumps(action, ensure_ascii=False))
        # ISO format for ts
        if r.get("ts") is not None:
            try:
                r["ts"] = pd.to_datetime(r["ts"]).isoformat()
            except Exception:
                r["ts"] = None
        ndjson_lines.append(json.dumps(r, ensure_ascii=False))
    payload = "\n".join(ndjson_lines) + "\n"
    resp = requests.post(f"{OS_URL}/_bulk", data=payload.encode("utf-8"), headers={"Content-Type": "application/x-ndjson"})
    resp.raise_for_status()
    j = resp.json()
    if j.get("errors"):
        print("⚠️ Bulk had errors, sample:")
        err_shown = 0
        for item in j.get("items", []):
            op = next(iter(item.values()))
            if "error" in op:
                print(json.dumps(op["error"], ensure_ascii=False))
                err_shown += 1
                if err_shown >= 5:
                    break
    print(f"✅ Indexed batch of {len(rows)} docs")


def main():
    try:
        ensure_index_and_alias()
        engine = create_engine(PG_CONN)
        with engine.connect() as conn:
            # Stream in batches
            offset = 0
            total = 0
            while offset < LIMIT:
                q = text(f"SELECT * FROM {TABLE} OFFSET :off LIMIT :lim")
                df = pd.read_sql(q, conn, params={"off": offset, "lim": BATCH})
                if df.empty:
                    break
                df = to_internal_columns(df)
                # Convert to list of dicts
                rows = df.to_dict(orient="records")
                bulk_index(rows)
                total += len(rows)
                offset += BATCH
            print(f"🎉 Indexed total {total} docs into alias {ALIAS_NAME}")
    except Exception as e:
        print("❌ Indexing failed:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
