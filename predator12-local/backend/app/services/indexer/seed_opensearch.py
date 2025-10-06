from __future__ import annotations

import json
import os
from pathlib import Path

import requests
from opensearchpy import OpenSearch

OS_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
STRICT = os.getenv("OS_SEED_STRICT", "false").lower() in {"1", "true", "yes"}
ROOT = Path(__file__).resolve().parents[4]  # .../Predator11
TEMPLATES_DIR = ROOT / "opensearch" / "index_templates"
POLICIES_DIR = ROOT / "opensearch" / "ism_policies"

# Write aliases to ensure exist with an initial rollover index
WRITE_ALIASES = [
    "customs_safe_current",
    "customs_restricted_current",
    "osint_messages_current",
    "osint_rss_current",
    "anomalies_routes_current",
    "forecast_imports_current",
    "graph_entities_current",
    "customs_safe_newco_spike_current",
    "exports_restricted_current",
    "audit_pii_access_current",
]


def os_client() -> OpenSearch:
    return OpenSearch(hosts=[OS_URL])


def apply_index_templates() -> None:
    if not TEMPLATES_DIR.exists():
        print(f"No templates dir: {TEMPLATES_DIR}")
        return
    for p in TEMPLATES_DIR.glob("*.json"):
        with p.open("r", encoding="utf-8") as f:
            body = json.load(f)
        name = body.get("index_template", {}).get("name") or p.stem
        # Fall back to put via low-level API
        path = f"{OS_URL}/_index_template/{name}"
        r = requests.put(path, json=body)
        if r.status_code >= 300:
            print(f"Failed to apply template {name}: {r.status_code} {r.text}")
        else:
            print(f"Applied template: {name}")


def apply_ism_policies() -> None:
    if not POLICIES_DIR.exists():
        print(f"No ISM policies dir: {POLICIES_DIR}")
        return
    for p in POLICIES_DIR.glob("*.json"):
        with p.open("r", encoding="utf-8") as f:
            body = json.load(f)
        policy_id = body.get("policy_id") or p.stem
        # OpenSearch ISM endpoint
        path = f"{OS_URL}/_plugins/_ism/policies/{policy_id}"
        r = requests.put(path, json=body)
        if r.status_code >= 300:
            print(f"Failed to apply ISM policy {policy_id}: {r.status_code} {r.text}")
        else:
            print(f"Applied ISM policy: {policy_id}")


def ensure_write_alias(alias: str, shards: int = 3, replicas: int = 1) -> None:
    client = os_client()
    # If alias exists, nothing to do
    try:
        exists = client.indices.exists_alias(name=alias)
    except Exception:
        exists = False
    if exists:
        print(f"Alias exists: {alias}")
        return

    # Create initial index <alias>-000001
    index_name = f"{alias.replace('_current','')}-000001"
    settings = {
        "settings": {
            "number_of_shards": shards,
            "number_of_replicas": replicas,
            "index": {
                "routing": {"allocation.include._tier_preference": "data_hot"}
            },
        },
        "aliases": {alias: {"is_write_index": True}},
    }
    try:
        client.indices.create(index=index_name, body=settings, ignore=400)
        print(f"Created index {index_name} with write alias {alias}")
    except Exception as e:
        print(f"Failed to create initial index for {alias}: {e}")


def main() -> None:
    print("Seeding OpenSearch: templates, ISM policies, write aliases ...")
    apply_index_templates()
    apply_ism_policies()
    # Track failures in strict mode
    failures = 0
    for a in WRITE_ALIASES:
        ensure_write_alias(a)
        # verify alias exists
        try:
            client = os_client()
            if not client.indices.exists_alias(name=a):
                print(f"Missing alias after ensure: {a}")
                failures += 1
        except Exception as e:
            print(f"Alias verification failed for {a}: {e}")
            failures += 1
    if STRICT and failures:
        print(f"Strict mode failed: {failures} alias issues detected")
        raise SystemExit(2)
    print("Done.")


if __name__ == "__main__":
    main()
