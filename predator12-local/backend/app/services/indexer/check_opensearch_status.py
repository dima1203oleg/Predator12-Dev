from __future__ import annotations

import json
import os
from pathlib import Path
from typing import List

import requests
from opensearchpy import OpenSearch

OS_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
ROOT = Path(__file__).resolve().parents[4]
TEMPLATES_DIR = ROOT / "opensearch" / "index_templates"
POLICIES_DIR = ROOT / "opensearch" / "ism_policies"

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


def check_cluster_health() -> dict:
    r = requests.get(f"{OS_URL}/_cluster/health")
    return {"ok": r.ok, "status": r.json() if r.ok else r.text}


def list_existing_templates() -> List[str]:
    r = requests.get(f"{OS_URL}/_index_template")
    if not r.ok:
        return []
    data = r.json() or {}
    return [t.get("name") for t in data.get("index_templates", [])]


def list_existing_policies() -> List[str]:
    r = requests.get(f"{OS_URL}/_plugins/_ism/policies")
    if not r.ok:
        return []
    data = r.json() or {}
    return [p.get("_id") for p in data.get("policies", [])]


def alias_status(alias: str) -> dict:
    try:
        r = requests.get(f"{OS_URL}/{alias}/_alias")
        if r.status_code == 404:
            return {"exists": False}
        r.raise_for_status()
        data = r.json()
        # find write_index
        for index_name, val in data.items():
            aliases = val.get("aliases", {})
            meta = aliases.get(alias, {})
            if meta.get("is_write_index"):
                return {"exists": True, "write_index": index_name}
        # alias exists but not marked write
        return {"exists": True, "write_index": None}
    except Exception as e:
        return {"exists": False, "error": str(e)}


def main() -> None:
    report = {"cluster": {}, "templates": {}, "policies": {}, "aliases": {}}

    report["cluster"] = check_cluster_health()

    desired_templates = sorted([p.stem for p in TEMPLATES_DIR.glob("*.json")]) if TEMPLATES_DIR.exists() else []
    existing_templates = set(list_existing_templates())
    report["templates"]["desired"] = desired_templates
    report["templates"]["missing"] = [t for t in desired_templates if t not in existing_templates]

    desired_policies = []
    if POLICIES_DIR.exists():
        for p in POLICIES_DIR.glob("*.json"):
            try:
                body = json.loads(p.read_text())
                desired_policies.append(body.get("policy_id") or p.stem)
            except Exception:
                desired_policies.append(p.stem)
    existing_policies = set(list_existing_policies())
    report["policies"]["desired"] = sorted(desired_policies)
    report["policies"]["missing"] = [p for p in desired_policies if p not in existing_policies]

    for a in WRITE_ALIASES:
        report["aliases"][a] = alias_status(a)

    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
