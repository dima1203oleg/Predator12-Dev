#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   KEYCLOAK_URL=${KEYCLOAK_URL:-http://localhost:8080} \
#   REALM=${REALM:-predator} \
#   CLIENT_ID=${CLIENT_ID:-predator-web} \
#   USERNAME=${USERNAME:-admin} \
#   PASSWORD=${PASSWORD:-admin} \
#   ./scripts/get_kc_token.sh

KC_URL=${KEYCLOAK_URL:-http://localhost:8080}
REALM=${REALM:-predator}
CLIENT_ID=${CLIENT_ID:-predator-web}
USERNAME=${USERNAME:-admin}
PASSWORD=${PASSWORD:-admin}

TOKEN_URL="$KC_URL/realms/$REALM/protocol/openid-connect/token"

curl -sS -X POST "$TOKEN_URL" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=password&client_id=$CLIENT_ID&username=$USERNAME&password=$PASSWORD" | jq -r '.access_token'
