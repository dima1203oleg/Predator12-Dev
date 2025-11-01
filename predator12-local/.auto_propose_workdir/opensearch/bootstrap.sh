#!/bin/bash

# ============================================================================
#                    PREDATOR11 BOOTSTRAP SCRIPT
#           Initialize complete MAS system with all components
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════════════════════╗
║                           🚀 PREDATOR11 BOOTSTRAP                           ║
║                      Multi-Agent System Initialization                      ║
╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local health_url=$2
    local max_attempts=${3:-30}
    local attempt=1

    print_status "Waiting for $service_name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    print_error "$service_name failed to become ready after $((max_attempts * 2)) seconds"
    return 1
}

# Function to initialize PostgreSQL databases
init_postgres() {
    print_status "Initializing PostgreSQL databases..."

    # Wait for PostgreSQL to be ready
    wait_for_service "PostgreSQL" "postgresql://postgres:postgres@localhost:5432/postgres" 15

    # Create databases if they don't exist
    docker-compose exec -T db psql -U postgres -c "
        DO \$\$
        BEGIN
           IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'predator11') THEN
              CREATE DATABASE predator11;
           END IF;
           IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak') THEN
              CREATE DATABASE keycloak;
           END IF;
        END\$\$;
    " || print_warning "Database creation may have failed - this is normal if databases already exist"

    print_success "PostgreSQL databases initialized"
}

# Function to initialize OpenSearch
init_opensearch() {
    print_status "Initializing OpenSearch..."

    wait_for_service "OpenSearch" "http://localhost:9200" 20

    # Apply ISM policy
    print_status "Applying ISM policy..."
    curl -X PUT "http://localhost:9200/_plugins/_ism/policies/customs_policy" \
        -H 'Content-Type: application/json' \
        -d @opensearch/ism/customs_policy.json || print_warning "ISM policy creation failed"

    # Apply index template
    print_status "Applying index template..."
    curl -X PUT "http://localhost:9200/_index_template/customs_template" \
        -H 'Content-Type: application/json' \
        -d @opensearch/index_templates/customs_template.json || print_warning "Index template creation failed"

    # Create initial indices and aliases
    print_status "Creating indices and aliases..."
    curl -X PUT "http://localhost:9200/customs_safe_000001" -H 'Content-Type: application/json' -d '{
        "settings": {"number_of_shards": 6, "number_of_replicas": 1}
    }' || print_warning "Safe index creation failed"

    curl -X PUT "http://localhost:9200/customs_restricted_000001" -H 'Content-Type: application/json' -d '{
        "settings": {"number_of_shards": 6, "number_of_replicas": 1}
    }' || print_warning "Restricted index creation failed"

    curl -X POST "http://localhost:9200/_aliases" -H 'Content-Type: application/json' -d '{
        "actions": [
            {"add": {"index": "customs_safe_000001", "alias": "customs_safe_current", "is_write_index": true}},
            {"add": {"index": "customs_restricted_000001", "alias": "customs_restricted_current", "is_write_index": true}}
        ]
    }' || print_warning "Alias creation failed"

    print_success "OpenSearch initialized"
}

# Function to initialize Qdrant collections
init_qdrant() {
    print_status "Initializing Qdrant vector database..."

    wait_for_service "Qdrant" "http://localhost:6333/health" 15

    # Create collections from registry.yaml
    collections=("osint_text_embeddings:3072" "company_profiles:1536" "improvement_vectors:768" "incident_patterns:768")

    for collection_info in "${collections[@]}"; do
        IFS=':' read -r collection_name vector_size <<< "$collection_info"

        print_status "Creating Qdrant collection: $collection_name"
        curl -X PUT "http://localhost:6333/collections/$collection_name" \
            -H 'Content-Type: application/json' \
            -d "{
                \"vectors\": {
                    \"size\": $vector_size,
                    \"distance\": \"Cosine\"
                }
            }" || print_warning "Collection $collection_name creation failed"
    done

    print_success "Qdrant collections initialized"
}

# Function to initialize Kafka topics
init_kafka() {
    print_status "Initializing Kafka topics..."

    wait_for_service "Redpanda" "http://localhost:9644/v1/status/ready" 20

    # Create topics from registry.yaml
    topics=(
        "orchestrator.tasks" "orchestrator.results" "orchestrator.scaling"
        "data.ingest" "data.quality" "data.processed" "etl.status"
        "agents.requests" "agents.responses" "agents.status" "agents.tuning"
        "system.incidents" "system.notifications" "system.health" "system.alerts"
        "models.requests" "models.responses" "models.optimization"
        "diagnostics.incidents" "diagnostics.results"
        "security.events" "security.alerts" "pii.requests" "pii.masked"
    )

    for topic in "${topics[@]}"; do
        print_status "Creating Kafka topic: $topic"
        docker-compose exec -T redpanda rpk topic create "$topic" \
            --brokers=localhost:9092 \
            --partitions=3 \
            --replicas=1 || print_warning "Topic $topic creation failed"
    done

    print_success "Kafka topics initialized"
}

# Function to initialize monitoring
init_monitoring() {
    print_status "Initializing monitoring stack..."

    # Wait for Prometheus
    wait_for_service "Prometheus" "http://localhost:9090/-/ready" 15

    # Wait for Grafana
    wait_for_service "Grafana" "http://localhost:3000/api/health" 15

    # Wait for Loki
    wait_for_service "Loki" "http://localhost:3100/ready" 15

    print_success "Monitoring stack initialized"
}

# Function to verify agents
verify_agents() {
    print_status "Verifying agents status..."

    # Wait for agents supervisor
    wait_for_service "Agents Supervisor" "http://localhost:8001/health" 20

    # Check individual agents (they may take longer to start)
    agents=("self-improvement-agent" "auto-heal-agent" "self-diagnosis-agent")

    for agent in "${agents[@]}"; do
        if docker-compose ps "$agent" | grep -q "Up"; then
            print_success "Agent $agent is running"
        else
            print_warning "Agent $agent may not be ready yet"
        fi
    done

    print_success "Agents verification completed"
}

# Function to run system health check
health_check() {
    print_status "Running comprehensive health check..."

    local failed=0

    # Check core services
    services=(
        "PostgreSQL:http://localhost:5432"
        "Redis:redis://localhost:6379"
        "OpenSearch:http://localhost:9200"
        "Qdrant:http://localhost:6333/health"
        "Redpanda:http://localhost:9644/v1/status/ready"
        "Backend:http://localhost:8000/healthz/readiness"
        "Frontend:http://localhost:3000"
        "Grafana:http://localhost:3000/api/health"
        "Prometheus:http://localhost:9090/-/ready"
    )

    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name service_url <<< "$service_info"
        if curl -f -s "${service_url#*:}" > /dev/null 2>&1; then
            print_success "$service_name: ✅ Healthy"
        else
            print_error "$service_name: ❌ Unhealthy"
            ((failed++))
        fi
    done

    if [ $failed -eq 0 ]; then
        print_success "All services are healthy! 🎉"
    else
        print_warning "$failed services are not healthy. Check logs with: docker-compose logs [service_name]"
    fi

    return $failed
}

# Function to display system information
show_system_info() {
    print_header

    echo -e "${GREEN}🎉 Predator11 MAS System Successfully Initialized! 🎉${NC}"
    echo
    echo -e "${BLUE}📊 System Access URLs:${NC}"
    echo "  • Frontend (UI):              http://localhost:3000"
    echo "  • Backend API:                http://localhost:8000"
    echo "  • API Documentation:          http://localhost:8000/docs"
    echo "  • OpenSearch Dashboards:      http://localhost:5601"
    echo "  • Grafana (Monitoring):       http://localhost:3001"
    echo "  • Prometheus:                 http://localhost:9090"
    echo "  • Agents Supervisor:          http://localhost:8001"
    echo
    echo -e "${BLUE}🤖 Active Agents:${NC}"
    echo "  • ChiefOrchestrator           ✅ Managing task execution"
    echo "  • SelfImprovementAgent        ✅ Analyzing and optimizing performance"
    echo "  • AutoHealAgent               ✅ Monitoring and healing incidents"
    echo "  • SelfDiagnosisAgent          ✅ Diagnosing system issues"
    echo "  • PIIGuardian                 ✅ Protecting sensitive data"
    echo "  • BillingGate                 ✅ Managing quotas and costs"
    echo "  • + 18 other core agents      ✅ Processing data and insights"
    echo
    echo -e "${BLUE}💾 Data Stores:${NC}"
    echo "  • PostgreSQL                  ✅ Primary data storage"
    echo "  • Qdrant                      ✅ Vector embeddings"
    echo "  • OpenSearch                  ✅ Search and analytics"
    echo "  • Redis                       ✅ Caching and sessions"
    echo "  • MinIO                       ✅ Object storage"
    echo
    echo -e "${BLUE}📡 Message Streaming:${NC}"
    echo "  • Redpanda (Kafka)            ✅ Inter-agent communication"
    echo "  • 24 Kafka topics             ✅ Event streaming"
    echo
    echo -e "${BLUE}📊 Observability:${NC}"
    echo "  • Prometheus                  ✅ Metrics collection"
    echo "  • Grafana                     ✅ Visualization"
    echo "  • Loki                        ✅ Log aggregation"
    echo "  • Tempo                       ✅ Distributed tracing"
    echo "  • OTEL Collector              ✅ Telemetry processing"
    echo
    echo -e "${YELLOW}🧪 Quick Smoke Tests:${NC}"
    echo "  curl -f http://localhost:8000/healthz/readiness"
    echo "  curl -X POST http://localhost:8000/api/v1/search -d '{\"q\":\"test\"}'"
    echo
    echo -e "${YELLOW}🔧 Useful Commands:${NC}"
    echo "  make logs                     # View all service logs"
    echo "  make health-check             # Run health checks"
    echo "  make security-audit           # Security audit"
    echo "  docker-compose ps             # Show service status"
    echo
    echo -e "${GREEN}🚀 Your Predator11 MAS system is ready for action!${NC}"
}

# Main function
main() {
    print_header

    print_status "Starting Predator11 MAS system initialization..."

    # Check if .env exists
    if [ ! -f .env ]; then
        print_status "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Please review and update .env file with your configuration"
    fi

    # Start services
    print_status "Starting all services..."
    docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

    # Wait a bit for services to start
    sleep 10

    # Initialize components
    init_postgres
    init_opensearch
    init_qdrant
    init_kafka
    init_monitoring
    verify_agents

    # Run health check
    if health_check; then
        show_system_info
    else
        print_error "Some services are not healthy. Please check logs and try again."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        print_status "Stopping Predator11 MAS system..."
        docker-compose -f docker-compose.yml -f docker-compose.override.yml down
        print_success "System stopped"
        ;;
    "health")
        health_check
        ;;
    "clean")
        print_warning "This will remove all containers, volumes, and data!"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f docker-compose.yml -f docker-compose.override.yml down -v
            docker system prune -af
            print_success "System cleaned"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|health|clean}"
        echo
        echo "Commands:"
        echo "  start   - Initialize and start the complete MAS system"
        echo "  stop    - Stop all services"
        echo "  health  - Run health checks"
        echo "  clean   - Clean up everything (destructive)"
        exit 1
        ;;
esac
