#!/bin/bash
# Keycloak Initialization Script
# Автоматично створює realm та тестових користувачів

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
KEYCLOAK_ADMIN="${KEYCLOAK_ADMIN:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM_NAME="predator"

echo "🔐 Keycloak Initialization Script"
echo "=================================="
echo ""

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

until curl -sf "${KEYCLOAK_URL}/health/ready" > /dev/null 2>&1; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "❌ Keycloak did not become ready in time"
        exit 1
    fi
    echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS - Keycloak not ready yet..."
    sleep 5
done

echo "✅ Keycloak is ready!"
echo ""

# Get admin access token
echo "🔑 Getting admin access token..."
TOKEN_RESPONSE=$(curl -s -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${KEYCLOAK_ADMIN}" \
    -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to get access token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Access token obtained"
echo ""

# Check if realm already exists
echo "🔍 Checking if realm '${REALM_NAME}' exists..."
REALM_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
    "${KEYCLOAK_URL}/admin/realms/${REALM_NAME}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if [ "$REALM_CHECK" = "200" ]; then
    echo "ℹ️  Realm '${REALM_NAME}' already exists"
else
    echo "📦 Realm not found, it will be imported from realm file"
fi

echo ""
echo "✅ Keycloak initialization completed!"
echo ""
echo "📋 Access Information:"
echo "   Keycloak Admin Console: ${KEYCLOAK_URL}"
echo "   Admin Username: ${KEYCLOAK_ADMIN}"
echo "   Admin Password: ${KEYCLOAK_ADMIN_PASSWORD}"
echo ""
echo "👥 Test Users (after realm import):"
echo "   Admin:   admin@predator.local / admin123"
echo "   Analyst: analyst@predator.local / analyst123"
echo "   Viewer:  viewer@predator.local / viewer123"
echo ""
echo "🔗 Realm URLs:"
echo "   Realm: ${KEYCLOAK_URL}/realms/${REALM_NAME}"
echo "   Login: ${KEYCLOAK_URL}/realms/${REALM_NAME}/protocol/openid-connect/auth"
echo "   Token: ${KEYCLOAK_URL}/realms/${REALM_NAME}/protocol/openid-connect/token"
echo ""
