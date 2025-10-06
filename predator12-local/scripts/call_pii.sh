#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   TOKEN=$(./scripts/get_kc_token.sh)
#   ./scripts/call_pii.sh "$TOKEN"

TOKEN=${1:?Access token required}
API_URL=${API_URL:-http://localhost:5001}

curl -fsS -H "Authorization: Bearer $TOKEN" "$API_URL/api/pii" | jq .
