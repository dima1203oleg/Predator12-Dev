#!/bin/bash

# Predator Analytics - Development Startup Script
# This script starts all services for local development

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Predator Analytics - Development Setup             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env files exist
echo -e "\n${BLUE}Checking environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}! Creating backend/.env from template${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${GREEN}✓ backend/.env exists${NC}"
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}! Creating frontend/.env from template${NC}"
    cat > frontend/.env << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ frontend/.env exists${NC}"
fi

# Stop any existing containers
echo -e "\n${BLUE}Stopping existing containers...${NC}"
docker-compose down > /dev/null 2>&1 || true

# Start services
echo -e "\n${BLUE}Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "\n${BLUE}Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "PostgreSQL: "
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Redis
echo -n "Redis: "
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Backend
echo -n "Backend API: "
for i in {1..60}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Frontend
echo -n "Frontend: "
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Display service URLs
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  Services are ready! 🚀                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Available Services:${NC}"
echo -e "  • Frontend:       ${GREEN}http://localhost:3000${NC}"
echo -e "  • Backend API:    ${GREEN}http://localhost:8000${NC}"
echo -e "  • API Docs:       ${GREEN}http://localhost:8000/api/docs${NC}"
echo -e "  • Grafana:        ${GREEN}http://localhost:3001${NC} (admin/admin)"
echo -e "  • Prometheus:     ${GREEN}http://localhost:9090${NC}"
echo -e "  • Flower (Celery):${GREEN}http://localhost:5555${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs:      ${YELLOW}docker-compose logs -f${NC}"
echo -e "  • Stop services:  ${YELLOW}docker-compose down${NC}"
echo -e "  • Restart:        ${YELLOW}docker-compose restart${NC}"
echo ""
echo -e "${GREEN}Happy coding! 💻🇺🇦${NC}"
