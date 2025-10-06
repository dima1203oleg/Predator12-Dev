#!/bin/bash
set -euo pipefail

# Sealed Secrets Setup for ArgoCD
# This script helps manage secrets in GitOps workflow

echo "🔐 Predator12 Sealed Secrets Setup"
echo "===================================="
echo ""

# Check if sealed secrets is installed
if ! kubectl get crd sealedsecrets.bitnami.com &>/dev/null; then
    echo "❌ SealedSecrets CRD not found!"
    echo "Installing Sealed Secrets controller..."
    
    helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
    helm repo update
    
    helm install sealed-secrets sealed-secrets/sealed-secrets \
        --namespace kube-system \
        --set-string fullnameOverride=sealed-secrets-controller
    
    echo "✅ Sealed Secrets controller installed"
    echo ""
fi

# Get the public key
echo "📝 Fetching Sealed Secrets public key..."
kubeseal --fetch-cert > /tmp/sealed-secrets-pub.pem
echo "✅ Public key saved to /tmp/sealed-secrets-pub.pem"
echo ""

# Function to seal a secret
seal_secret() {
    local namespace=$1
    local secret_name=$2
    local secret_file=$3
    local output_file=$4
    
    echo "🔒 Sealing secret: $secret_name in namespace $namespace"
    
    kubectl create secret generic "$secret_name" \
        --from-env-file="$secret_file" \
        --namespace="$namespace" \
        --dry-run=client \
        -o yaml | \
    kubeseal \
        --format yaml \
        --cert /tmp/sealed-secrets-pub.pem \
        > "$output_file"
    
    echo "✅ Sealed secret saved to $output_file"
}

# Create sealed secrets directory
mkdir -p infra/secrets/sealed

# Seal ArgoCD admin password
echo ""
echo "Creating ArgoCD admin secret..."
if [ -f ".env.argocd" ]; then
    seal_secret \
        "argocd" \
        "argocd-secret" \
        ".env.argocd" \
        "infra/secrets/sealed/argocd-secret.yaml"
else
    echo "⚠️  .env.argocd not found, skipping"
fi

# Seal GitHub credentials
echo ""
echo "Creating GitHub credentials secret..."
if [ -f ".env.github" ]; then
    seal_secret \
        "argocd" \
        "github-credentials" \
        ".env.github" \
        "infra/secrets/sealed/github-credentials.yaml"
else
    echo "⚠️  .env.github not found, skipping"
fi

# Seal Slack webhook
echo ""
echo "Creating Slack webhook secret..."
if [ -f ".env.slack" ]; then
    seal_secret \
        "argocd" \
        "slack-credentials" \
        ".env.slack" \
        "infra/secrets/sealed/slack-credentials.yaml"
else
    echo "⚠️  .env.slack not found, skipping"
fi

# Seal PostgreSQL credentials
echo ""
echo "Creating PostgreSQL credentials secret..."
if [ -f ".env.postgres" ]; then
    seal_secret \
        "predator12-prod" \
        "postgres-credentials" \
        ".env.postgres" \
        "infra/secrets/sealed/postgres-credentials.yaml"
else
    echo "⚠️  .env.postgres not found, skipping"
fi

# Seal Redis credentials
echo ""
echo "Creating Redis credentials secret..."
if [ -f ".env.redis" ]; then
    seal_secret \
        "predator12-prod" \
        "redis-credentials" \
        ".env.redis" \
        "infra/secrets/sealed/redis-credentials.yaml"
else
    echo "⚠️  .env.redis not found, skipping"
fi

# Create example env files
if [ ! -f ".env.argocd" ]; then
    cat > .env.argocd.example << 'EOF'
# ArgoCD Admin Credentials
admin.password=changeme
admin.passwordMtime=2024-01-01T00:00:00Z
server.secretkey=changeme-random-secret
EOF
    echo "📝 Created .env.argocd.example"
fi

if [ ! -f ".env.github" ]; then
    cat > .env.github.example << 'EOF'
# GitHub Credentials for ArgoCD
username=github-bot
password=ghp_xxxxxxxxxxxxxxxxxxxx
EOF
    echo "📝 Created .env.github.example"
fi

if [ ! -f ".env.slack" ]; then
    cat > .env.slack.example << 'EOF'
# Slack Webhook for Notifications
webhook-url=https://hooks.slack.com/services/xxx/yyy/zzz
signing-secret=xxxxxxxxxx
EOF
    echo "📝 Created .env.slack.example"
fi

echo ""
echo "✅ Sealed Secrets setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env.* files with your actual credentials"
echo "2. Run this script again to seal the secrets"
echo "3. Commit infra/secrets/sealed/*.yaml to git"
echo "4. Delete .env.* files (NEVER commit them!)"
echo ""
echo "🔑 To decrypt a secret (for debugging):"
echo "   kubeseal --recovery-unseal --recovery-private-key <key> < sealed-secret.yaml"
echo ""
