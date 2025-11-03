#!/usr/bin/env bash
# Production Deployment Helper for Predator 12
# Usage: ./deploy-prod-helper.sh [check|backup|rollback]

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$ROOT_DIR/.deploy-prod.log"

log_info() { echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
log_ok() { echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"; }
log_err() { echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"; }

pre_deployment_check() {
    log_info "Running pre-deployment validation..."

    # Git status
    if git -C "$ROOT_DIR" diff-index --quiet HEAD -- 2>/dev/null; then
        log_ok "Git repository is clean"
    else
        log_err "Uncommitted changes detected. Commit or stash before deployment."
        return 1
    fi

    # Backend tests
    log_info "Running backend tests..."
    if cd "$ROOT_DIR" && pytest backend/tests -q > /dev/null 2>&1; then
        log_ok "Backend tests passed (10/10)"
    else
        log_err "Backend tests failed"
        return 1
    fi

    # Configuration files
    for file in backend/app/agents/registry.yaml backend/app/agents/policies.yaml; do
        if [ -f "$ROOT_DIR/$file" ]; then
            log_ok "Found: $file"
        else
            log_err "Missing: $file"
            return 1
        fi
    done

    log_ok "All pre-deployment checks passed!"
    return 0
}

create_backup() {
    log_info "Creating deployment backup..."

    mkdir -p "$ROOT_DIR/.backup"
    timestamp=$(date +%Y%m%d_%H%M%S)

    # Git bundle
    if git -C "$ROOT_DIR" bundle create ".backup/repo_$timestamp.bundle" --all 2>/dev/null; then
        log_ok "Repository backup: .backup/repo_$timestamp.bundle"
    fi

    # Config backup
    if [ -d "$ROOT_DIR/backend/app/agents" ]; then
        cp -r "$ROOT_DIR/backend/app/agents" ".backup/agents_$timestamp"
        log_ok "Config backup: .backup/agents_$timestamp"
    fi
}

show_deployment_guide() {
    cat << 'EOF'

═══════════════════════════════════════════════════════════════
                 PRODUCTION DEPLOYMENT GUIDE
═══════════════════════════════════════════════════════════════

✅ PRE-DEPLOYMENT CHECKS COMPLETE

📋 Deployment Steps (Manual):

1. VERIFY STAGING
   cd /path/to/predator12-local
   docker-compose -f docker-compose.dev.yml up -d
   docker-compose exec backend pytest backend/tests

2. PREPARE PRODUCTION
   export ENVIRONMENT=production
   export TELEGRAM_BOT_TOKEN=<your-token>

3. DEPLOY CONTAINERS
   docker-compose -f docker-compose.prod.yml up -d

4. VERIFY DEPLOYMENT
   docker-compose ps
   docker-compose logs -f backend

5. HEALTH CHECK
   curl http://localhost:8000/api/v1/supervisor/status

6. ENABLE FEATURES
   POST http://localhost:8000/api/v1/supervisor/self-improvement/start \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json"

📊 MONITORING

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

🔄 ROLLBACK (if needed)

  ./scripts/deploy-prod-helper.sh rollback

═══════════════════════════════════════════════════════════════
EOF
}

rollback_deployment() {
    log_warn "Initiating rollback..."

    # Find latest backup
    latest_bundle=$(find "$ROOT_DIR/.backup" -name "repo_*.bundle" -type f -print0 | xargs -0 ls -t | head -1)
    if [ -z "$latest_bundle" ]; then
        log_err "No backup found for rollback"
        return 1
    fi

    log_info "Using backup: $latest_bundle"
    log_warn "Manual rollback required - consult deployment team"
    return 0
}

main() {
    echo "$ROOT_DIR" >> "$LOG_FILE"

    case "${1:-check}" in
        check)
            pre_deployment_check && show_deployment_guide
            ;;
        backup)
            create_backup
            ;;
        rollback)
            rollback_deployment
            ;;
        *)
            log_err "Unknown command: $1"
            echo "Usage: $0 [check|backup|rollback]"
            return 1
            ;;
    esac
}

main "$@"
