#!/bin/bash

# Predator11 Quick Setup Script
# Performs initial setup and deployment of the Predator11 system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << 'EOF'
 ____                 _       _             _ _
|  _ \ _ __ ___  ____ | | __ _| |_ ___  _ __/ / |
| |_) | '__/ _ \/ _  || |/ _  | __/ _ \| '__| | |
|  __/| | |  __/ (_| || | (_| | || (_) | |  | | |
|_|   |_|  \___|\__,_||_|\__,_|\__\___/|_|  |_|_|

🚀 Predator11 Quick Setup & Deploy
EOF
echo -e "${NC}"

# Check prerequisites
echo -e "${BLUE}=== Checking Prerequisites ===${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python3 not found. Some scripts may not work.${NC}"
else
    echo -e "${GREEN}✅ Python3 found${NC}"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. MCP server may not work.${NC}"
else
    echo -e "${GREEN}✅ Node.js found${NC}"
fi

echo -e "\n${BLUE}=== Environment Setup ===${NC}"

# Create .env from example if it doesn't exist
if [[ ! -f ".env" ]]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with your API keys and tokens${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p logs/{agents,etl,api,autoheal}
mkdir -p data/{models,uploads,exports,backups}
mkdir -p observability/{prometheus/data,grafana/data,opensearch/data}
mkdir -p backend/app/{api,core,models,schemas,services,workers}
mkdir -p tests/{unit,integration,e2e}

echo -e "${GREEN}✅ Directory structure created${NC}"

echo -e "\n${BLUE}=== Docker Environment Setup ===${NC}"

# Pull required images
echo "Pulling Docker images..."
docker compose pull

echo -e "${GREEN}✅ Docker images pulled${NC}"

# Build custom images if needed
echo "Building custom images..."
docker compose build --no-cache

echo -e "${GREEN}✅ Custom images built${NC}"

echo -e "\n${BLUE}=== Services Initialization ===${NC}"

# Start core services first
echo "Starting core infrastructure services..."
docker compose up -d postgres redis opensearch minio keycloak

echo "Waiting for core services to be ready..."
sleep 30

# Check if services are healthy
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if docker compose ps "$service" | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅ $service is ready${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    echo -e "${YELLOW}⚠️  $service may not be fully ready${NC}"
}

check_service_health "postgres"
check_service_health "opensearch"
check_service_health "minio"

# Initialize databases and indices
echo -e "\n${BLUE}=== Database Initialization ===${NC}"

# Run database migrations if they exist
if [[ -f "backend/alembic/env.py" ]]; then
    echo "Running database migrations..."
    docker compose exec -T backend alembic upgrade head || true
    echo -e "${GREEN}✅ Database migrations completed${NC}"
fi

# Initialize OpenSearch indices
echo "Setting up OpenSearch indices..."
curl -X PUT "localhost:9200/customs_safe_current" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "doc_id": {"type": "keyword"},
      "ts": {"type": "date"},
      "hs_code": {"type": "keyword"},
      "amount": {"type": "double"},
      "qty": {"type": "double"},
      "country": {"type": "keyword"},
      "company_mask": {"type": "keyword"},
      "edrpou_mask": {"type": "keyword"}
    }
  }
}' 2>/dev/null || echo "Index may already exist"

curl -X PUT "localhost:9200/customs_restricted_current" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "doc_id": {"type": "keyword"},
      "ts": {"type": "date"},
      "hs_code": {"type": "keyword"},
      "amount": {"type": "double"},
      "qty": {"type": "double"},
      "country": {"type": "keyword"},
      "company_name": {"type": "text"},
      "edrpou": {"type": "keyword"}
    }
  }
}' 2>/dev/null || echo "Index may already exist"

echo -e "${GREEN}✅ OpenSearch indices created${NC}"

# Start monitoring services
echo -e "\n${BLUE}=== Starting Monitoring Stack ===${NC}"
docker compose up -d prometheus grafana alertmanager

sleep 15

# Start application services
echo -e "\n${BLUE}=== Starting Application Services ===${NC}"
docker compose up -d backend frontend autoheal

sleep 10

# Final service startup
echo -e "\n${BLUE}=== Final Services ===${NC}"
docker compose up -d

echo -e "\n${BLUE}=== Setup Verification ===${NC}"

# Wait for everything to be ready
echo "Waiting for all services to be ready..."
sleep 30

# Run basic health checks
./scripts/test_system.sh

echo -e "\n${GREEN}🎉 Predator11 Setup Completed! 🎉${NC}"

cat << EOF

📋 SETUP SUMMARY
================

🌐 Web Interfaces:
   • Frontend:     http://localhost:3000
   • Grafana:      http://localhost:3001 (admin/admin)
   • Keycloak:     http://localhost:8080 (admin/admin)
   • OpenSearch:   http://localhost:9200
   • MinIO:        http://localhost:9000 (minioadmin/minioadmin)

🔌 API Endpoints:
   • Backend API:  http://localhost:8000
   • Health:       http://localhost:8000/health
   • Chat API:     http://localhost:8000/api/v1/chat
   • MCP Server:   http://localhost:3010 (if enabled)

📊 Monitoring:
   • Prometheus:   http://localhost:9090
   • Alertmanager: http://localhost:9093

🔧 Next Steps:
   1. Edit .env file with your API tokens:
      • GITHUB_TOKEN
      • OPENAI_API_KEY
      • TELEGRAM_BOT_TOKEN
      • TELEGRAM_CHAT_ID

   2. Configure Keycloak:
      • Create predator11 realm
      • Set up users and roles

   3. Test the system:
      • make test
      • ./scripts/test_system.sh

   4. Load sample data:
      • python3 scripts/indexing/discover_pg_schema.py
      • python3 scripts/indexing/index_pg_to_opensearch.py

📖 Documentation:
   • README.md - Main documentation
   • docs/ - Detailed guides
   • guides/ - User guides

🆘 Troubleshooting:
   • Check logs: docker compose logs -f
   • Restart services: make restart
   • Clean setup: make clean && make start

EOF

echo -e "${BLUE}💡 To restart everything: make restart${NC}"
echo -e "${BLUE}💡 To view logs: make logs${NC}"
echo -e "${BLUE}💡 To stop everything: make stop${NC}"
