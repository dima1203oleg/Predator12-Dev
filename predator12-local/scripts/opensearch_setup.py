import json
import os
import sys
from pathlib import Path
from typing import Any

import requests

OS_URL = os.getenv("OPENSEARCH_URL", "http://localhost:9200")
BASE = Path(__file__).resolve().parents[1] / "opensearch"
TEMPLATE_FILE = BASE / "index_templates" / "customs_template.json"
POLICY_FILE = BASE / "ism_policies" / "customs_policy.json"


def put_index_template(name: str, body: Any):
    url = f"{OS_URL}/_index_template/{name}"
    r = requests.put(url, json=body)
    r.raise_for_status()
    print(f"✅ Applied index template: {name}")


def put_ism_policy(name: str, body: Any):
    # OpenSearch ISM endpoint
    url = f"{OS_URL}/_plugins/_ism/policies/{name}"
    r = requests.put(url, json=body)
    if r.status_code not in (200, 201):
        print("⚠️ ISM response:", r.status_code, r.text)
        r.raise_for_status()
    print(f"✅ Applied ISM policy: {name}")


def ensure_index_with_alias(index: str, alias: str):
    # Create index if not exists and point alias
    # We also attach ISM policy via settings if available
    url_idx = f"{OS_URL}/{index}"
    if requests.head(url_idx).status_code == 404:
        settings = {
            "settings": {
                "index": {
                    "opendistro.index_state_management.policy_id": "customs_policy"
                }
            }
        }
        r = requests.put(url_idx, json=settings)
        r.raise_for_status()
        print(f"✅ Created index {index}")
    # Alias
    actions = {"actions": [{"add": {"index": index, "alias": alias, "is_write_index": True}}]}
    r = requests.post(f"{OS_URL}/_aliases", json=actions)
    if r.status_code not in (200, 201):
        print("⚠️ Alias response:", r.status_code, r.text)
        r.raise_for_status()
    print(f"✅ Alias {alias} -> {index}")


def main():
    try:
        with open(TEMPLATE_FILE, "r") as f:
            template_body = json.load(f)
        put_index_template("customs_template", template_body)

        with open(POLICY_FILE, "r") as f:
            policy_body = json.load(f)
        put_ism_policy("customs_policy", policy_body)

        # Bootstrap first index and alias
        ensure_index_with_alias("customs_safe-000001", "customs_safe_current")
        print("🎉 OpenSearch setup completed")
    except Exception as e:
        print("❌ OpenSearch setup failed:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
