#!/usr/bin/env bash

# Predator12 Health Check Script
# Comprehensive system health monitoring and diagnostics

set -Eeuo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
TIMEOUT=10

echo -e "${BLUE}🏥 Predator11 System Health Check${NC}"
echo "=================================="
echo "Timestamp: $(date)"
echo ""

# Function to check HTTP endpoint
check_http_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    local timeout=${4:-$TIMEOUT}
    
    echo -n "[$name] "
    
    if response=$(curl -s -w "%{http_code}" -m "$timeout" "$url" 2>/dev/null); then
        status_code="${response: -3}"
        if [ "$status_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ Healthy${NC} (HTTP $status_code)"
            return 0
        else
            echo -e "${YELLOW}⚠️  Warning${NC} (HTTP $status_code, expected $expected_status)"
            return 1
        fi
    else
        echo -e "${RED}❌ Unreachable${NC}"
        return 1
    fi
}

# Function to check TCP port
check_tcp_port() {
    local name=$1
    local host=$2
    local port=$3
    local timeout=${4:-$TIMEOUT}
    
    echo -n "[$name] "
    
    if timeout "$timeout" bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "${GREEN}✅ Reachable${NC} ($host:$port)"
        return 0
    else
        echo -e "${RED}❌ Unreachable${NC} ($host:$port)"
        return 1
    fi
}

# Function to check container status
check_container_status() {
    local service_name=$1
    
    if docker-compose -f "$COMPOSE_FILE" ps "$service_name" | grep -q "Up"; then
        echo -e "[$service_name] ${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "[$service_name] ${RED}❌ Not running${NC}"
        return 1
    fi
}

# Function to get container resource usage
get_container_resources() {
    local service_name=$1
    
    if docker-compose -f "$COMPOSE_FILE" ps -q "$service_name" >/dev/null 2>&1; then
        container_id=$(docker-compose -f "$COMPOSE_FILE" ps -q "$service_name")
        if [ -n "$container_id" ]; then
            docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" "$container_id" | tail -n +2
        else
            echo "N/A"
        fi
    else
        echo "Container not found"
    fi
}

# Check Docker and Docker Compose
echo -e "${PURPLE}🐳 Docker Environment${NC}"
echo "========================"

if command -v docker &> /dev/null; then
    echo -e "[Docker] ${GREEN}✅ Installed${NC} ($(docker --version | cut -d' ' -f3 | cut -d',' -f1))"
else
    echo -e "[Docker] ${RED}❌ Not installed${NC}"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo -e "[Docker Compose] ${GREEN}✅ Installed${NC} ($(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1))"
else
    echo -e "[Docker Compose] ${RED}❌ Not installed${NC}"
    exit 1
fi

# Check if compose file exists
if [ -f "$COMPOSE_FILE" ]; then
    echo -e "[Compose File] ${GREEN}✅ Found${NC} ($COMPOSE_FILE)"
else
    echo -e "[Compose File] ${RED}❌ Not found${NC} ($COMPOSE_FILE)"
    exit 1
fi

echo ""

# Container Status Check
echo -e "${PURPLE}📦 Container Status${NC}"
echo "======================"

services=(
    "db" "redis" "opensearch" "minio" "qdrant" "redpanda"
    "backend" "frontend" "worker" "beat" "agent-supervisor"
    "keycloak" "prometheus" "grafana" "loki" "tempo" "alertmanager"
    "node-exporter" "cadvisor" "opensearch-exporter" "blackbox-exporter"
    "promtail"
)

container_health=0
total_containers=${#services[@]}

for service in "${services[@]}"; do
    if check_container_status "$service"; then
        ((container_health++))
    fi
done

echo ""
echo -e "Container Health: ${container_health}/${total_containers} services running"

# Core Services Health Check
echo ""
echo -e "${PURPLE}🌐 HTTP Endpoints${NC}"
echo "===================="

http_health=0
total_http_checks=0

# Core application services
((total_http_checks++))
if check_http_endpoint "Backend API" "http://localhost:8000/health"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "Frontend" "http://localhost:3000"; then
    ((http_health++))
fi

# Infrastructure services
((total_http_checks++))
if check_http_endpoint "OpenSearch" "http://localhost:9200/_cluster/health"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "Grafana" "http://localhost:3001/api/health"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "Prometheus" "http://localhost:9090/-/healthy"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "MinIO" "http://localhost:9000/minio/health/live"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "Keycloak" "http://localhost:8080/health"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "Qdrant" "http://localhost:6333/health"; then
    ((http_health++))
fi

((total_http_checks++))
if check_http_endpoint "Alertmanager" "http://localhost:9093/-/healthy"; then
    ((http_health++))
fi

echo ""
echo -e "HTTP Health: ${http_health}/${total_http_checks} endpoints healthy"

# TCP Port Check
echo ""
echo -e "${PURPLE}🔌 TCP Connectivity${NC}"
echo "======================"

tcp_health=0
total_tcp_checks=0

# Database and cache
((total_tcp_checks++))
if check_tcp_port "PostgreSQL" "localhost" "5432"; then
    ((tcp_health++))
fi

((total_tcp_checks++))
if check_tcp_port "Redis" "localhost" "6379"; then
    ((tcp_health++))
fi

# Message broker
((total_tcp_checks++))
if check_tcp_port "Redpanda" "localhost" "19092"; then
    ((tcp_health++))
fi

# Observability
((total_tcp_checks++))
if check_tcp_port "Loki" "localhost" "3100"; then
    ((tcp_health++))
fi

((total_tcp_checks++))
if check_tcp_port "Tempo" "localhost" "3200"; then
    ((tcp_health++))
fi

echo ""
echo -e "TCP Health: ${tcp_health}/${total_tcp_checks} ports reachable"

# System Resources
echo ""
echo -e "${PURPLE}💻 System Resources${NC}"
echo "======================"

# Check disk space
echo -n "[Disk Space] "
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo -e "${GREEN}✅ OK${NC} (${disk_usage}% used)"
elif [ "$disk_usage" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  Warning${NC} (${disk_usage}% used)"
else
    echo -e "${RED}❌ Critical${NC} (${disk_usage}% used)"
fi

# Check memory usage
echo -n "[Memory Usage] "
if command -v free &> /dev/null; then
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$memory_usage" -lt 80 ]; then
        echo -e "${GREEN}✅ OK${NC} (${memory_usage}% used)"
    elif [ "$memory_usage" -lt 90 ]; then
        echo -e "${YELLOW}⚠️  Warning${NC} (${memory_usage}% used)"
    else
        echo -e "${RED}❌ Critical${NC} (${memory_usage}% used)"
    fi
else
    echo -e "${YELLOW}⚠️  Unknown${NC} (free command not available)"
fi

# Check CPU load
echo -n "[CPU Load] "
if command -v uptime &> /dev/null; then
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    cpu_cores=$(nproc 2>/dev/null || echo "1")
    load_percentage=$(echo "$load_avg * 100 / $cpu_cores" | bc -l 2>/dev/null | cut -d. -f1)
    
    if [ "$load_percentage" -lt 70 ]; then
        echo -e "${GREEN}✅ OK${NC} (${load_avg} avg, ${cpu_cores} cores)"
    elif [ "$load_percentage" -lt 90 ]; then
        echo -e "${YELLOW}⚠️  Warning${NC} (${load_avg} avg, ${cpu_cores} cores)"
    else
        echo -e "${RED}❌ Critical${NC} (${load_avg} avg, ${cpu_cores} cores)"
    fi
else
    echo -e "${YELLOW}⚠️  Unknown${NC} (uptime command not available)"
fi

# Docker Resource Usage
echo ""
echo -e "${PURPLE}🐳 Container Resources${NC}"
echo "========================="

if docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null | head -6; then
    echo ""
else
    echo -e "${YELLOW}⚠️  Unable to retrieve container stats${NC}"
fi

# Application-Specific Checks
echo ""
echo -e "${PURPLE}🎯 Application Health${NC}"
echo "======================="

# Check if Celery workers are active
echo -n "[Celery Workers] "
if docker-compose -f "$COMPOSE_FILE" exec -T worker celery -A app.workers.celery_app inspect active 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✅ Active${NC}"
else
    echo -e "${YELLOW}⚠️  Unknown${NC} (unable to check)"
fi

# Check OpenSearch cluster health
echo -n "[OpenSearch Cluster] "
if cluster_health=$(curl -s "http://localhost:9200/_cluster/health" 2>/dev/null); then
    status=$(echo "$cluster_health" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    case "$status" in
        "green")
            echo -e "${GREEN}✅ Green${NC}"
            ;;
        "yellow")
            echo -e "${YELLOW}⚠️  Yellow${NC}"
            ;;
        "red")
            echo -e "${RED}❌ Red${NC}"
            ;;
        *)
            echo -e "${YELLOW}⚠️  Unknown${NC} (status: $status)"
            ;;
    esac
else
    echo -e "${RED}❌ Unreachable${NC}"
fi

# Check Redis connectivity
echo -n "[Redis Connection] "
if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

# Overall Health Score
echo ""
echo -e "${PURPLE}📊 Overall Health Score${NC}"
echo "========================="

total_checks=$((container_health + http_health + tcp_health))
max_checks=$((total_containers + total_http_checks + total_tcp_checks))
health_percentage=$((total_checks * 100 / max_checks))

echo "Containers: ${container_health}/${total_containers}"
echo "HTTP Endpoints: ${http_health}/${total_http_checks}"
echo "TCP Ports: ${tcp_health}/${total_tcp_checks}"
echo ""

if [ "$health_percentage" -ge 90 ]; then
    echo -e "Overall Health: ${GREEN}${health_percentage}% - Excellent${NC} 🎉"
    exit_code=0
elif [ "$health_percentage" -ge 75 ]; then
    echo -e "Overall Health: ${YELLOW}${health_percentage}% - Good${NC} 👍"
    exit_code=0
elif [ "$health_percentage" -ge 50 ]; then
    echo -e "Overall Health: ${YELLOW}${health_percentage}% - Fair${NC} ⚠️"
    exit_code=1
else
    echo -e "Overall Health: ${RED}${health_percentage}% - Poor${NC} ❌"
    exit_code=1
fi

echo ""
echo -e "${BLUE}💡 Troubleshooting Tips:${NC}"
echo "========================="
echo "• Check logs: docker-compose -f $COMPOSE_FILE logs [service]"
echo "• Restart service: docker-compose -f $COMPOSE_FILE restart [service]"
echo "• View resource usage: docker stats"
echo "• Check disk space: df -h"
echo "• Monitor in Grafana: http://localhost:3001"

exit $exit_code
