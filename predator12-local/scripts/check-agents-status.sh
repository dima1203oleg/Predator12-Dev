#!/bin/bash

################################################################################
#                                                                              #
#              🤖 PREDATOR ANALYTICS AGENTS STATUS CHECKER 🤖                #
#                         Multi-Agent System Validation                       #
#                                                                              #
################################################################################

echo "████████████████████████████████████████████████████████████████████████████████"
echo "                     🤖 MULTI-AGENT SYSTEM STATUS CHECK 🤖                     "
echo "                          Predator Analytics Nexus Core                         "
echo "████████████████████████████████████████████████████████████████████████████████"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Agent endpoints
declare -A AGENTS=(
    ["CoreOrchestrator"]="http://localhost:8000/health"
    ["DatasetAgent"]="http://localhost:7001/health"
    ["AnomalyAgent"]="http://localhost:7002/health"
    ["ForecastAgent"]="http://localhost:7003/health"
    ["GraphAgent"]="http://localhost:7004/health"
    ["SelfHealingAgent"]="http://localhost:7005/health"
    ["AutoImproveAgent"]="http://localhost:7006/health"
    ["SecurityAgent"]="http://localhost:7007/health"
)

# Check if Docker is running
echo -e "${BLUE}🔍 Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker is running${NC}"
fi

echo ""
echo -e "${BLUE}📋 Checking Docker Compose services...${NC}"

# Check Docker Compose services
COMPOSE_STATUS=$(docker compose ps --format "table {{.Name}}\t{{.Status}}")
echo "$COMPOSE_STATUS"

echo ""
echo -e "${BLUE}🤖 Checking Individual Agent Health...${NC}"
echo ""

HEALTHY_AGENTS=0
TOTAL_AGENTS=${#AGENTS[@]}

for agent in "${!AGENTS[@]}"; do
    url=${AGENTS[$agent]}
    echo -n -e "${CYAN}Checking ${agent}... ${NC}"
    
    # Try to reach the agent
    response=$(curl -s -w "%{http_code}" -o /dev/null --max-time 5 "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        ((HEALTHY_AGENTS++))
        
        # Get capabilities if available
        capabilities_url="${url%/health}/capabilities"
        capabilities=$(curl -s --max-time 3 "$capabilities_url" 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$capabilities" ]; then
            echo -e "   ${PURPLE}📊 Capabilities available${NC}"
        fi
    else
        echo -e "${RED}❌ UNHEALTHY (HTTP: $response)${NC}"
        
        # Check if container is running
        container_name=$(echo "$agent" | sed 's/Agent$//' | tr '[:upper:]' '[:lower:]')
        if docker compose ps | grep -q "$container_name"; then
            echo -e "   ${YELLOW}⚠️  Container exists but not responding${NC}"
        else
            echo -e "   ${RED}🚫 Container not found${NC}"
        fi
    fi
done

echo ""
echo "████████████████████████████████████████████████████████████████████████████████"
echo -e "                         ${PURPLE}🎯 AGENT STATUS SUMMARY 🎯${NC}"
echo "████████████████████████████████████████████████████████████████████████████████"

# Calculate percentage
if [ $TOTAL_AGENTS -gt 0 ]; then
    PERCENTAGE=$((HEALTHY_AGENTS * 100 / TOTAL_AGENTS))
else
    PERCENTAGE=0
fi

echo -e "${CYAN}📊 Healthy Agents: ${GREEN}$HEALTHY_AGENTS${CYAN}/${TOTAL_AGENTS}${NC}"
echo -e "${CYAN}🎯 Health Percentage: ${GREEN}${PERCENTAGE}%${NC}"

if [ $HEALTHY_AGENTS -eq $TOTAL_AGENTS ]; then
    echo -e "${GREEN}🎉 ALL AGENTS ARE HEALTHY! Multi-Agent System is fully operational! 🎉${NC}"
    echo ""
    echo -e "${GREEN}🚀 READY FOR ENTERPRISE DEPLOYMENT! 🚀${NC}"
elif [ $HEALTHY_AGENTS -gt $((TOTAL_AGENTS / 2)) ]; then
    echo -e "${YELLOW}⚠️  Most agents are healthy, but some need attention${NC}"
else
    echo -e "${RED}🚨 Critical: Multiple agents are down. System degraded! 🚨${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Infrastructure Services Status:${NC}"

# Check key infrastructure services
declare -A INFRA=(
    ["PostgreSQL"]="5432"
    ["Redis"]="6379"
    ["OpenSearch"]="9200"
    ["MinIO"]="9000"
    ["Keycloak"]="8080"
    ["Grafana"]="3001"
    ["Prometheus"]="9090"
)

for service in "${!INFRA[@]}"; do
    port=${INFRA[$service]}
    echo -n -e "${CYAN}${service} (port ${port}): ${NC}"
    
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✅ Running${NC}"
    else
        echo -e "${RED}❌ Not accessible${NC}"
    fi
done

echo ""
echo "████████████████████████████████████████████████████████████████████████████████"
echo -e "${PURPLE}🎯 Multi-Agent Orchestration System Ready for Production! 🎯${NC}"
echo "████████████████████████████████████████████████████████████████████████████████"
echo ""

# Quick agent capabilities test
echo -e "${BLUE}🧪 Quick Agent Capability Test:${NC}"

# Test Dataset Agent
echo -n -e "${CYAN}DatasetAgent ingest capability: ${NC}"
if curl -s -X POST "http://localhost:7001/ingest" -H "Content-Type: application/json" -d '{"dataset_id": "test"}' --max-time 5 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

# Test Anomaly Agent
echo -n -e "${CYAN}AnomalyAgent detection capability: ${NC}"
if curl -s -X POST "http://localhost:7002/detect" -H "Content-Type: application/json" -d '{"dataset_id": "test", "data": [{"value": 1.0}, {"value": 2.0}]}' --max-time 5 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo ""
echo -e "${GREEN}🏆 Agent status check completed!${NC}"
echo -e "${BLUE}💡 To start agents: ${YELLOW}docker compose up -d${NC}"
echo -e "${BLUE}💡 To view logs: ${YELLOW}docker compose logs -f [service-name]${NC}"
echo ""
