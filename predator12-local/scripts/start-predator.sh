#!/bin/bash

# Predator11 Production Startup Script
# This script starts all services and performs health checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
HEALTH_CHECK_TIMEOUT=300
HEALTH_CHECK_INTERVAL=10

echo -e "${BLUE}🚀 Starting Predator11 Production Environment${NC}"
echo "=================================================="

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $ENV_FILE file not found${NC}"
    echo "Please create .env file from .env.example and configure your secrets"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: $COMPOSE_FILE not found${NC}"
    exit 1
fi

# Function to check if a service is healthy
check_service_health() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name health... "
    
    for i in $(seq 1 30); do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
            echo -e "${GREEN}✅ Healthy${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ Unhealthy${NC}"
    return 1
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local host=${3:-localhost}
    
    echo -n "Waiting for $service_name to be ready... "
    
    for i in $(seq 1 60); do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo -e "${GREEN}✅ Ready${NC}"
            return 0
        fi
        sleep 2
    done
    
    echo -e "${RED}❌ Timeout${NC}"
    return 1
}

# Pre-flight checks
echo -e "${YELLOW}🔍 Running pre-flight checks...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Check available disk space (minimum 10GB)
available_space=$(df / | awk 'NR==2 {print $4}')
if [ "$available_space" -lt 10485760 ]; then  # 10GB in KB
    echo -e "${YELLOW}⚠️  Warning: Less than 10GB disk space available${NC}"
fi

# Check available memory (minimum 4GB)
available_memory=$(free -m | awk 'NR==2{print $7}')
if [ "$available_memory" -lt 4096 ]; then
    echo -e "${YELLOW}⚠️  Warning: Less than 4GB memory available${NC}"
fi

echo -e "${GREEN}✅ Pre-flight checks completed${NC}"

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p logs
mkdir -p observability/{db/init,opensearch/policies,loki,promtail,tempo,prometheus/rules,grafana/{provisioning,dashboards},alertmanager,blackbox}

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest Docker images...${NC}"
docker-compose -f "$COMPOSE_FILE" pull

# Start core infrastructure services first
echo -e "${YELLOW}🏗️  Starting core infrastructure services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d db redis

# Wait for core services
wait_for_service "PostgreSQL" 5432
wait_for_service "Redis" 6379

# Start search and storage services
echo -e "${YELLOW}🔍 Starting search and storage services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d opensearch minio qdrant

# Wait for search and storage services
wait_for_service "OpenSearch" 9200
wait_for_service "MinIO" 9000
wait_for_service "Qdrant" 6333

# Start message broker
echo -e "${YELLOW}📨 Starting message broker...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d redpanda

wait_for_service "Redpanda" 19092

# Start observability stack
echo -e "${YELLOW}📊 Starting observability stack...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d prometheus grafana loki tempo alertmanager

# Wait for observability services
wait_for_service "Prometheus" 9090
wait_for_service "Grafana" 3001
wait_for_service "Loki" 3100

# Start exporters
echo -e "${YELLOW}📈 Starting Prometheus exporters...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d node-exporter cadvisor opensearch-exporter blackbox-exporter

# Start authentication
echo -e "${YELLOW}🔐 Starting authentication service...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d keycloak

wait_for_service "Keycloak" 8080

# Start application services
echo -e "${YELLOW}🚀 Starting application services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d backend frontend

# Wait for application services
wait_for_service "Backend" 8000
wait_for_service "Frontend" 3000

# Start worker services
echo -e "${YELLOW}⚙️  Starting worker services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d worker beat agent-supervisor

# Start remaining services
echo -e "${YELLOW}🔧 Starting remaining services...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d promtail opensearch-setup

# Comprehensive health checks
echo -e "${YELLOW}🏥 Running comprehensive health checks...${NC}"

# Core services health checks
check_service_health "Backend API" "http://localhost:8000/health"
check_service_health "Frontend" "http://localhost:3000"
check_service_health "OpenSearch" "http://localhost:9200/_cluster/health"
check_service_health "Grafana" "http://localhost:3001/api/health"
check_service_health "Prometheus" "http://localhost:9090/-/healthy"
check_service_health "MinIO" "http://localhost:9000/minio/health/live"
check_service_health "Keycloak" "http://localhost:8080/health"
check_service_health "Qdrant" "http://localhost:6333/health"

# Check if all containers are running
echo -e "${YELLOW}🐳 Checking container status...${NC}"
failed_containers=$(docker-compose -f "$COMPOSE_FILE" ps --filter "status=exited" --format "table {{.Service}}")

if [ -n "$failed_containers" ] && [ "$failed_containers" != "SERVICE" ]; then
    echo -e "${RED}❌ Some containers failed to start:${NC}"
    echo "$failed_containers"
    echo -e "${YELLOW}💡 Check logs with: docker-compose -f $COMPOSE_FILE logs [service_name]${NC}"
else
    echo -e "${GREEN}✅ All containers are running${NC}"
fi

# Display service URLs
echo -e "${BLUE}🌐 Service URLs:${NC}"
echo "================================"
echo -e "Frontend:           ${GREEN}http://localhost:3000${NC}"
echo -e "Backend API:        ${GREEN}http://localhost:8000${NC}"
echo -e "API Documentation:  ${GREEN}http://localhost:8000/docs${NC}"
echo -e "Grafana:           ${GREEN}http://localhost:3001${NC} (admin/admin)"
echo -e "Prometheus:        ${GREEN}http://localhost:9090${NC}"
echo -e "OpenSearch:        ${GREEN}http://localhost:9200${NC}"
echo -e "OpenSearch Dashboards: ${GREEN}http://localhost:5601${NC}"
echo -e "MinIO Console:     ${GREEN}http://localhost:9001${NC}"
echo -e "Keycloak:          ${GREEN}http://localhost:8080${NC}"
echo -e "Alertmanager:      ${GREEN}http://localhost:9093${NC}"
echo -e "Qdrant:            ${GREEN}http://localhost:6333/dashboard${NC}"

# Display monitoring information
echo ""
echo -e "${BLUE}📊 Monitoring & Logs:${NC}"
echo "================================"
echo -e "View logs:         ${YELLOW}docker-compose -f $COMPOSE_FILE logs -f [service]${NC}"
echo -e "Check status:      ${YELLOW}docker-compose -f $COMPOSE_FILE ps${NC}"
echo -e "Stop all:          ${YELLOW}docker-compose -f $COMPOSE_FILE down${NC}"
echo -e "Restart service:   ${YELLOW}docker-compose -f $COMPOSE_FILE restart [service]${NC}"

# Final status
echo ""
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Predator11 started successfully!${NC}"
    echo -e "${GREEN}✅ All services are healthy and ready to use${NC}"
    
    # Show resource usage
    echo ""
    echo -e "${BLUE}💻 Resource Usage:${NC}"
    echo "================================"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10
    
else
    echo -e "${RED}❌ Some services failed to start properly${NC}"
    echo -e "${YELLOW}💡 Check the logs above and run health checks manually${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Next Steps:${NC}"
echo "================================"
echo "1. Open Grafana and import dashboards"
echo "2. Configure Keycloak realms and users"
echo "3. Test API endpoints with sample data"
echo "4. Monitor system health in Grafana"
echo "5. Check application logs for any warnings"

echo ""
echo -e "${GREEN}Happy analyzing with Predator11! 🎯${NC}"
