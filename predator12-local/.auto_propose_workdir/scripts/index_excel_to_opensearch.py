import os
import sys
import json
from typing import Any, Dict, List

import pandas as pd
import requests

OS_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
ALIAS_NAME = os.getenv("OS_ALIAS", "customs_safe_current")
EXCEL_FILE = os.getenv("EXCEL_FILE", "")
SHEET_NAME = os.getenv("SHEET_NAME", None)  # optional; if None pick first sheet
BATCH = int(os.getenv("BATCH", "2000"))

# Map Ukrainian column names to internal schema
UA_TO_INTERNAL = {
    "номер митної декларації": "doc_id",
    "дата оформлення": "ts",
    "код товару": "hs_code",
    "фактурна вартість, валюта контракту": "amount",
    "країна походження": "country",
    "одержувач": "company_name",
}


def to_internal_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename: Dict[str, str] = {}
    lower_map = {c: str(c).strip().lower() for c in df.columns}
    for orig, low in lower_map.items():
        if low in UA_TO_INTERNAL:
            rename[orig] = UA_TO_INTERNAL[low]
    out = df.rename(columns=rename).copy()

    # Ensure expected columns exist
    for c in ["doc_id", "ts", "hs_code", "amount", "country", "company_name"]:
        if c not in out.columns:
            out[c] = None

    # Parse/clean
    out["ts"] = pd.to_datetime(out["ts"], errors="coerce")
    out["amount"] = pd.to_numeric(out["amount"], errors="coerce")

    for c in ["doc_id", "hs_code", "country", "company_name"]:
        out[c] = out[c].astype(object)
        m = out[c].notna()
        out.loc[m, c] = out.loc[m, c].astype(str)

    if "pii_person_name" not in out.columns:
        out["pii_person_name"] = None

    out = out.where(out.notna(), None)

    return out[["doc_id", "ts", "hs_code", "amount", "country", "company_name", "pii_person_name"]]


def bulk_index(rows: List[Dict[str, Any]]):
    if not rows:
        return 0, 0
    ndjson_lines: List[str] = []
    for r in rows:
        ndjson_lines.append(json.dumps({"index": {"_index": ALIAS_NAME}}, ensure_ascii=False))
        if r.get("ts") is not None:
            try:
                r["ts"] = pd.to_datetime(r["ts"]).isoformat()
            except Exception:
                r["ts"] = None
        # Clean NaN/NaT values to None to comply with JSON and OpenSearch
        for k, v in list(r.items()):
            try:
                if pd.isna(v):
                    r[k] = None
            except Exception:
                pass
        ndjson_lines.append(json.dumps(r, ensure_ascii=False, allow_nan=False))
    payload = "\n".join(ndjson_lines) + "\n"
    resp = requests.post(
        f"{OS_URL}/_bulk",
        data=payload.encode("utf-8"),
        headers={"Content-Type": "application/x-ndjson"},
    )
    resp.raise_for_status()
    j = resp.json()
    errors = j.get("errors")
    success = 0
    failed = 0
    for item in j.get("items", []):
        op = next(iter(item.values()))
        if "error" in op:
            failed += 1
        else:
            success += 1
    if errors:
        print(f"⚠️ Bulk had errors: success={success}, failed={failed}")
        shown = 0
        for item in j.get("items", []):
            op = next(iter(item.values()))
            if "error" in op:
                print(json.dumps(op["error"], ensure_ascii=False))
                shown += 1
                if shown >= 5:
                    break
    return success, failed


def main():
    try:
        path = EXCEL_FILE or (sys.argv[1] if len(sys.argv) > 1 else "")
        if not path:
            print("❌ Please provide EXCEL_FILE env or first arg path to .xlsx")
            sys.exit(2)
        if not os.path.exists(path):
            print(f"❌ File not found: {path}")
            sys.exit(2)
        print(f"📄 Reading Excel: {path}")
        df_read = pd.read_excel(path, sheet_name=SHEET_NAME if SHEET_NAME else None, engine="openpyxl")
        if isinstance(df_read, dict):
            # No explicit sheet requested -> take the first sheet present
            if not df_read:
                print("❌ Excel file has no sheets")
                sys.exit(2)
            first_key = next(iter(df_read.keys()))
            print(f"ℹ️ Using first sheet: {first_key}")
            df = df_read[first_key]
        else:
            df = df_read
        df = to_internal_columns(df)
        total_ok = 0
        total_failed = 0
        # Chunk in batches
        for i in range(0, len(df), BATCH):
            rows = df.iloc[i : i + BATCH].to_dict(orient="records")
            ok, failed = bulk_index(rows)
            total_ok += ok
            total_failed += failed
        # refresh alias' backing index
        try:
            requests.post(f"{OS_URL}/{ALIAS_NAME}/_refresh").raise_for_status()
        except Exception:
            pass
        print(f"🎉 Indexed OK={total_ok}, Failed={total_failed} into alias {ALIAS_NAME}")
    except Exception as e:
        print("❌ Excel indexing failed:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
