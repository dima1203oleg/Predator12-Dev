#!/usr/bin/env python3
import io
import os
import sys
import time
import requests

API_URL = os.environ.get("API_URL", "http://localhost:5001")

CSV = """doc_id,ts,hs_code,amount,qty,country,company_name,edrpou
A1,2024-02-01T12:00:00,1001,11.5,2,UA,ALFA LLC,11111111
A2,2024-02-02T12:00:00,1002,12.0,3,PL,BETA LLC,22222222
"""

def main():
    print(f"[AGENTS-DEMO] Posting sample CSV to {API_URL}/api/ingest ...")
    files = {"file": ("sample.csv", io.BytesIO(CSV.encode("utf-8")), "text/csv")}
    r = requests.post(f"{API_URL}/api/ingest", files=files, timeout=30)
    print("[AGENTS-DEMO] Status:", r.status_code)
    print("[AGENTS-DEMO] Response:", r.text)

if __name__ == "__main__":
    main()
