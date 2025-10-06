    "timestamp": "$timestamp",
    "overall_health": "$health_percentage%",
    "services": {
        "healthy": $HEALTHY_SERVICES,
        "warning": $WARNING_SERVICES,
        "unhealthy": $UNHEALTHY_SERVICES,
        "total": $total_services
    },
    "status": "$(
        if [[ $UNHEALTHY_SERVICES -gt 0 ]]; then
            echo "CRITICAL"
        elif [[ $WARNING_SERVICES -gt 0 ]]; then
            echo "WARNING"
        else
            echo "HEALTHY"
        fi
    )"
}
EOF

    print_status "Health report generated: /tmp/predator11-health-report.json"
}

# Function to run continuous monitoring
continuous_monitoring() {
    print_status "Starting continuous health monitoring (interval: ${HEALTH_CHECK_INTERVAL}s)"

    while true; do
        echo "=========================="
        echo "Health Check: $(date)"
        echo "=========================="

        # Reset counters
        HEALTHY_SERVICES=0
        WARNING_SERVICES=0
        UNHEALTHY_SERVICES=0

        # Run all checks
        main "check"

        generate_health_report

        echo "=========================="
        echo "Next check in ${HEALTH_CHECK_INTERVAL} seconds..."
        echo "=========================="

        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# Main health check function
run_health_checks() {
    print_status "Running comprehensive health checks..."

    # Check deployments
    check_pod_health "predator11-backend" "$NAMESPACE" 3
    check_pod_health "predator11-frontend" "$NAMESPACE" 2
    check_pod_health "predator11-agents-supervisor" "$NAMESPACE" 2
    check_pod_health "predator11-agents-workers" "$NAMESPACE" 5

    # Check services
    check_service_endpoints "predator11-backend" "$NAMESPACE"
    check_service_endpoints "predator11-frontend" "$NAMESPACE"

    # Check external endpoints
    check_http_endpoint "Frontend" "$FRONTEND_URL"
    check_http_endpoint "Backend API" "$API_URL/healthz/readiness"
    check_http_endpoint "Backend Metrics" "$API_URL/metrics" 200

    # Check databases
    check_database
    check_redis
    check_opensearch

    # Check security
    check_vault
    check_certificates

    # Check resources
    check_resource_usage
    check_autoscaling
}

# Main function
main() {
    case "${1:-check}" in
        "check")
            run_health_checks
            generate_health_report
            ;;
        "monitor")
            continuous_monitoring
            ;;
        "pods")
            check_pod_health "predator11-backend" "$NAMESPACE" 3
            check_pod_health "predator11-frontend" "$NAMESPACE" 2
            check_pod_health "predator11-agents-supervisor" "$NAMESPACE" 2
            check_pod_health "predator11-agents-workers" "$NAMESPACE" 5
            ;;
        "endpoints")
            check_http_endpoint "Frontend" "$FRONTEND_URL"
            check_http_endpoint "Backend API" "$API_URL/healthz/readiness"
            ;;
        "databases")
            check_database
            check_redis
            check_opensearch
            ;;
        "security")
            check_vault
            check_certificates
            ;;
        "resources")
            check_resource_usage
            check_autoscaling
            ;;
        *)
            echo "Usage: $0 {check|monitor|pods|endpoints|databases|security|resources}"
            echo
            echo "Commands:"
            echo "  check      - Run full health check once"
            echo "  monitor    - Continuous monitoring mode"
            echo "  pods       - Check pod health only"
            echo "  endpoints  - Check HTTP endpoints only"
            echo "  databases  - Check database services only"
            echo "  security   - Check security services only"
            echo "  resources  - Check resource usage only"
            exit 1
            ;;
    esac

    # Summary
    local total=$((HEALTHY_SERVICES + WARNING_SERVICES + UNHEALTHY_SERVICES))
    if [[ $total -gt 0 ]]; then
        echo
        print_status "Health Check Summary:"
        print_success "Healthy: $HEALTHY_SERVICES"
        print_warning "Warnings: $WARNING_SERVICES"
        print_error "Unhealthy: $UNHEALTHY_SERVICES"

        local health_percentage=$(( (HEALTHY_SERVICES * 100) / total ))
        echo "Overall Health: $health_percentage%"

        if [[ $UNHEALTHY_SERVICES -gt 0 ]]; then
            exit 1
        elif [[ $WARNING_SERVICES -gt 0 ]]; then
            exit 2
        else
            exit 0
        fi
    fi
}

# Install required tools if missing
if ! command -v jq &> /dev/null; then
    print_status "Installing jq..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y jq
    fi
fi

if ! command -v bc &> /dev/null; then
    print_status "Installing bc..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install bc
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y bc
    fi
fi

# Run main function
main "$@"
#!/bin/bash

# ============================================================================
#                    PREDATOR11 SYSTEM HEALTH MONITOR
#           Comprehensive health monitoring and alerting system
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="predator11"
SECURITY_NAMESPACE="predator11-security"
MONITORING_NAMESPACE="predator11-monitoring"
API_URL="https://api.predator11.com"
FRONTEND_URL="https://app.predator11.com"
HEALTH_CHECK_INTERVAL=30
ALERT_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_ALERTS="${EMAIL_ALERTS:-admin@predator11.com}"

# Counters
HEALTHY_SERVICES=0
UNHEALTHY_SERVICES=0
WARNING_SERVICES=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[HEALTHY]${NC} $1"
    ((HEALTHY_SERVICES++))
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    ((WARNING_SERVICES++))
}

print_error() {
    echo -e "${RED}[UNHEALTHY]${NC} $1"
    ((UNHEALTHY_SERVICES++))
}

# Function to send alert
send_alert() {
    local severity=$1
    local message=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Send to Slack if webhook configured
    if [[ -n "$ALERT_WEBHOOK_URL" ]]; then
        local emoji="⚠️"
        local color="warning"

        case $severity in
            "critical") emoji="🚨"; color="danger" ;;
            "warning") emoji="⚠️"; color="warning" ;;
            "info") emoji="ℹ️"; color="good" ;;
        esac

        curl -X POST "$ALERT_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$emoji Predator11 Health Alert\",
                    \"text\": \"$message\",
                    \"footer\": \"Predator11 Health Monitor\",
                    \"ts\": $(date +%s)
                }]
            }" &>/dev/null || true
    fi

    # Log to file
    echo "[$timestamp] [$severity] $message" >> "/var/log/predator11-health.log"
}

# Function to check pod health
check_pod_health() {
    local deployment=$1
    local namespace=$2
    local expected_replicas=$3

    local ready_replicas=$(kubectl get deployment "$deployment" -n "$namespace" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local current_replicas=$(kubectl get deployment "$deployment" -n "$namespace" -o jsonpath='{.status.replicas}' 2>/dev/null || echo "0")

    if [[ "$ready_replicas" -eq "$expected_replicas" ]] && [[ "$current_replicas" -eq "$expected_replicas" ]]; then
        print_success "$deployment: $ready_replicas/$expected_replicas pods ready"
    elif [[ "$ready_replicas" -gt 0 ]] && [[ "$ready_replicas" -lt "$expected_replicas" ]]; then
        print_warning "$deployment: $ready_replicas/$expected_replicas pods ready (degraded)"
        send_alert "warning" "$deployment has $ready_replicas/$expected_replicas pods ready"
    else
        print_error "$deployment: $ready_replicas/$expected_replicas pods ready (down)"
        send_alert "critical" "$deployment is down - $ready_replicas/$expected_replicas pods ready"
    fi
}

# Function to check service endpoints
check_service_endpoints() {
    local service=$1
    local namespace=$2

    local endpoints=$(kubectl get endpoints "$service" -n "$namespace" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null | wc -w)

    if [[ $endpoints -gt 0 ]]; then
        print_success "$service: $endpoints endpoints available"
    else
        print_error "$service: no endpoints available"
        send_alert "critical" "Service $service has no available endpoints"
    fi
}

# Function to check HTTP endpoints
check_http_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    local timeout=${4:-10}

    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" 2>/dev/null || echo "000")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$timeout" "$url" 2>/dev/null || echo "999")

    if [[ "$response_code" == "$expected_status" ]]; then
        if (( $(echo "$response_time < 1.0" | bc -l) )); then
            print_success "$name: HTTP $response_code (${response_time}s)"
        else
            print_warning "$name: HTTP $response_code (${response_time}s - slow)"
            send_alert "warning" "$name response time is slow: ${response_time}s"
        fi
    else
        print_error "$name: HTTP $response_code (expected $expected_status)"
        send_alert "critical" "$name returned HTTP $response_code (expected $expected_status)"
    fi
}

# Function to check database connectivity
check_database() {
    print_status "Checking PostgreSQL database..."

    if kubectl exec -n "$NAMESPACE" predator11-postgresql-0 -- pg_isready -U predator11 &>/dev/null; then
        # Check connection count
        local connections=$(kubectl exec -n "$NAMESPACE" predator11-postgresql-0 -- \
            psql -U predator11 -d predator11 -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ' || echo "0")

        if [[ $connections -lt 50 ]]; then
            print_success "PostgreSQL: healthy ($connections connections)"
        else
            print_warning "PostgreSQL: high connection count ($connections connections)"
            send_alert "warning" "PostgreSQL has high connection count: $connections"
        fi
    else
        print_error "PostgreSQL: connection failed"
        send_alert "critical" "PostgreSQL database connection failed"
    fi
}

# Function to check Redis
check_redis() {
    print_status "Checking Redis cache..."

    if kubectl exec -n "$NAMESPACE" predator11-redis-master-0 -- redis-cli ping 2>/dev/null | grep -q "PONG"; then
        # Check memory usage
        local memory_used=$(kubectl exec -n "$NAMESPACE" predator11-redis-master-0 -- \
            redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r' || echo "unknown")

        print_success "Redis: healthy (memory: $memory_used)"
    else
        print_error "Redis: connection failed"
        send_alert "critical" "Redis connection failed"
    fi
}

# Function to check OpenSearch
check_opensearch() {
    print_status "Checking OpenSearch cluster..."

    local cluster_health=$(kubectl exec -n "$NAMESPACE" predator11-opensearch-0 -- \
        curl -s -k https://localhost:9200/_cluster/health | jq -r '.status' 2>/dev/null || echo "unknown")

    case $cluster_health in
        "green")
            print_success "OpenSearch: cluster healthy (green)"
            ;;
        "yellow")
            print_warning "OpenSearch: cluster degraded (yellow)"
            send_alert "warning" "OpenSearch cluster status is yellow"
            ;;
        "red"|"unknown")
            print_error "OpenSearch: cluster unhealthy ($cluster_health)"
            send_alert "critical" "OpenSearch cluster status is $cluster_health"
            ;;
    esac
}

# Function to check Vault
check_vault() {
    print_status "Checking HashiCorp Vault..."

    local vault_status=$(kubectl exec -n "$SECURITY_NAMESPACE" vault-0 -- \
        vault status -format=json 2>/dev/null | jq -r '.sealed' 2>/dev/null || echo "unknown")

    if [[ "$vault_status" == "false" ]]; then
        print_success "Vault: unsealed and healthy"
    elif [[ "$vault_status" == "true" ]]; then
        print_error "Vault: sealed"
        send_alert "critical" "Vault is sealed and needs manual unsealing"
    else
        print_error "Vault: status unknown"
        send_alert "critical" "Cannot determine Vault status"
    fi
}

# Function to check certificates
check_certificates() {
    print_status "Checking TLS certificates..."

    local certs=$(kubectl get certificates -n "$NAMESPACE" --no-headers 2>/dev/null)

    if [[ -n "$certs" ]]; then
        while IFS= read -r cert_line; do
            local cert_name=$(echo "$cert_line" | awk '{print $1}')
            local ready=$(echo "$cert_line" | awk '{print $2}')

            if [[ "$ready" == "True" ]]; then
                # Check expiry (if possible)
                local secret_name=$(kubectl get certificate "$cert_name" -n "$NAMESPACE" -o jsonpath='{.spec.secretName}' 2>/dev/null)
                if [[ -n "$secret_name" ]]; then
                    local cert_data=$(kubectl get secret "$secret_name" -n "$NAMESPACE" -o jsonpath='{.data.tls\.crt}' 2>/dev/null | base64 -d)
                    local expiry_date=$(echo "$cert_data" | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "unknown")
                    print_success "Certificate $cert_name: valid (expires: $expiry_date)"
                else
                    print_success "Certificate $cert_name: ready"
                fi
            else
                print_error "Certificate $cert_name: not ready"
                send_alert "critical" "Certificate $cert_name is not ready"
            fi
        done <<< "$certs"
    else
        print_warning "No certificates found"
    fi
}

# Function to check resource usage
check_resource_usage() {
    print_status "Checking resource usage..."

    # Check node resources
    local node_usage=$(kubectl top nodes --no-headers 2>/dev/null | while read -r line; do
        local node=$(echo "$line" | awk '{print $1}')
        local cpu=$(echo "$line" | awk '{print $2}' | sed 's/%//')
        local memory=$(echo "$line" | awk '{print $4}' | sed 's/%//')

        if [[ $cpu -gt 80 ]] || [[ $memory -gt 80 ]]; then
            echo "WARNING $node CPU:${cpu}% Memory:${memory}%"
        else
            echo "OK $node CPU:${cpu}% Memory:${memory}%"
        fi
    done)

    echo "$node_usage" | while IFS= read -r usage_line; do
        local status=$(echo "$usage_line" | awk '{print $1}')
        local details=$(echo "$usage_line" | cut -d' ' -f2-)

        if [[ "$status" == "WARNING" ]]; then
            print_warning "Node resources: $details"
            send_alert "warning" "High resource usage on $details"
        else
            print_success "Node resources: $details"
        fi
    done
}

# Function to check auto-scaling
check_autoscaling() {
    print_status "Checking auto-scaling status..."

    local hpas=$(kubectl get hpa -n "$NAMESPACE" --no-headers 2>/dev/null)

    if [[ -n "$hpas" ]]; then
        while IFS= read -r hpa_line; do
            local hpa_name=$(echo "$hpa_line" | awk '{print $1}')
            local current=$(echo "$hpa_line" | awk '{print $2}')
            local min=$(echo "$hpa_line" | awk '{print $4}')
            local max=$(echo "$hpa_line" | awk '{print $5}')

            if [[ "$current" -eq "$max" ]]; then
                print_warning "HPA $hpa_name: at maximum scale ($current/$max)"
                send_alert "warning" "HPA $hpa_name is at maximum scale"
            elif [[ "$current" -eq "$min" ]]; then
                print_success "HPA $hpa_name: at minimum scale ($current replicas)"
            else
                print_success "HPA $hpa_name: scaled to $current replicas ($min-$max)"
            fi
        done <<< "$hpas"
    else
        print_warning "No HPA configurations found"
    fi
}

# Function to generate health report
generate_health_report() {
    local timestamp=$(date)
    local total_services=$((HEALTHY_SERVICES + WARNING_SERVICES + UNHEALTHY_SERVICES))
    local health_percentage=$(( (HEALTHY_SERVICES * 100) / total_services ))

    cat > "/tmp/predator11-health-report.json" <<EOF
{
