# ═══════════════════════════════════════════════════════════════════════════════════
#                         🤖 PREDATOR11 AGENTS MAKEFILE 🤖
#                    Multi-Agent System Management Commands
# ═══════════════════════════════════════════════════════════════════════════════════

.PHONY: help up down build logs status test health clean restart scale

# Default target
help: ## Show this help message
	@echo "🤖 Predator11 Agents Management"
	@echo "=================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                              🚀 DEPLOYMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

up: ## Start all agents and infrastructure
	@echo "🚀 Starting Predator11 Agents Stack..."
	docker-compose -f docker-compose.agents.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 30
	@make health

down: ## Stop all agents and infrastructure
	@echo "🛑 Stopping Predator11 Agents Stack..."
	docker-compose -f docker-compose.agents.yml down

build: ## Build all agent images
	@echo "🔨 Building all agent images..."
	docker-compose -f docker-compose.agents.yml build --no-cache

restart: ## Restart all agents
	@echo "♻️ Restarting all agents..."
	@make down
	sleep 5
	@make up

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                            📊 MONITORING & STATUS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

status: ## Show status of all containers
	@echo "📊 Container Status:"
	@echo "==================="
	docker-compose -f docker-compose.agents.yml ps

logs: ## Show logs from all agents
	docker-compose -f docker-compose.agents.yml logs -f --tail=50

logs-agent: ## Show logs from specific agent (usage: make logs-agent AGENT=chief)
	@if [ -z "$(AGENT)" ]; then \
		echo "❌ Please specify AGENT name (chief, model-router, ingest, quality, anomaly, security, healing)"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.agents.yml logs -f predator11-$(AGENT)

health: ## Check health of all agents
	@echo "🏥 Agent Health Check:"
	@echo "======================"
	@echo "Chief Orchestrator:"
	@curl -s http://localhost:9001/chief/health | jq '.' || echo "❌ Not responding"
	@echo ""
	@echo "Model Router:"
	@curl -s http://localhost:9002/router/health | jq '.' || echo "❌ Not responding"
	@echo ""
	@echo "Ingest Agent:"
	@curl -s http://localhost:9010/ingest/health | jq '.' || echo "❌ Not responding"
	@echo ""
	@echo "Data Quality Agent:"
	@curl -s http://localhost:9012/quality/health | jq '.' || echo "❌ Not responding"
	@echo ""
	@echo "Anomaly Agent:"
	@curl -s http://localhost:9020/anomaly/health | jq '.' || echo "❌ Not responding"
	@echo ""
	@echo "Security Agent:"
	@curl -s http://localhost:9050/security/health | jq '.' || echo "❌ Not responding"
	@echo ""
	@echo "Self-Healing Agent:"
	@curl -s http://localhost:9041/healing/health | jq '.' || echo "❌ Not responding"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                               🧪 TESTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

test: ## Run basic functionality tests
	@echo "🧪 Running Agent Tests..."
	@echo "========================="
	@make test-chief
	@make test-router
	@make test-quality
	@make test-anomaly

test-chief: ## Test Chief Orchestrator
	@echo "Testing Chief Orchestrator..."
	curl -X POST http://localhost:9001/chief/ask \
		-H "Content-Type: application/json" \
		-d '{"query": "Test anomaly detection", "channel": "api", "user_id": "test"}' | jq '.'

test-router: ## Test Model Router
	@echo "Testing Model Router..."
	curl -X POST http://localhost:9002/router/route \
		-H "Content-Type: application/json" \
		-d '{"model_type": "fast", "prompt": "Hello, world!", "max_tokens": 50}' | jq '.'

test-quality: ## Test Data Quality Agent
	@echo "Testing Data Quality Agent..."
	curl -X POST http://localhost:9012/quality/run \
		-H "Content-Type: application/json" \
		-d '{"dataset_id": "test_dataset"}' | jq '.'

test-anomaly: ## Test Anomaly Agent
	@echo "Testing Anomaly Agent..."
	curl -X POST http://localhost:9020/anomaly/run \
		-H "Content-Type: application/json" \
		-d '{"index": "test_index", "field": "amount", "method": "z_score"}' | jq '.'

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                            🔧 INDIVIDUAL AGENTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

restart-chief: ## Restart Chief Orchestrator
	docker-compose -f docker-compose.agents.yml restart chief-orchestrator

restart-router: ## Restart Model Router
	docker-compose -f docker-compose.agents.yml restart model-router

restart-ingest: ## Restart Ingest Agent
	docker-compose -f docker-compose.agents.yml restart ingest-agent

restart-quality: ## Restart Data Quality Agent
	docker-compose -f docker-compose.agents.yml restart data-quality-agent

restart-anomaly: ## Restart Anomaly Agent
	docker-compose -f docker-compose.agents.yml restart anomaly-agent

restart-security: ## Restart Security Agent
	docker-compose -f docker-compose.agents.yml restart security-privacy-agent

restart-healing: ## Restart Self-Healing Agent
	docker-compose -f docker-compose.agents.yml restart self-healing-agent

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                              🗄️ DATA & STORAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

seed: ## Seed test data
	@echo "🌱 Seeding test data..."
	@echo "Creating test dataset via Ingest Agent..."
	curl -X POST http://localhost:9010/ingest/upload \
		-F "file=@test_data/sample.csv" \
		-F "user_id=system" \
		-F "tags=test,sample"

redis-cli: ## Open Redis CLI
	docker exec -it predator11-redis redis-cli

opensearch-cli: ## Open OpenSearch dev tools
	@echo "🔍 OpenSearch available at: http://localhost:9200"
	@echo "Sample queries:"
	@echo "  GET /_cluster/health"
	@echo "  GET /_cat/indices"

minio-ui: ## Open MinIO UI
	@echo "🗄️ MinIO UI available at: http://localhost:9001"
	@echo "Credentials: minioadmin / minioadmin"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                             📈 MONITORING ACCESS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

grafana: ## Open Grafana dashboard
	@echo "📈 Grafana available at: http://localhost:3000"
	@echo "Credentials: admin / admin"

prometheus: ## Open Prometheus
	@echo "📊 Prometheus available at: http://localhost:9090"

traefik: ## Open Traefik dashboard
	@echo "🌐 Traefik dashboard available at: http://localhost:8080"

keycloak: ## Open Keycloak admin
	@echo "🔐 Keycloak admin available at: http://localhost:8080"
	@echo "Credentials: admin / admin"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                               🧹 CLEANUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

clean: ## Clean up containers and volumes (WARNING: destroys data)
	@echo "🧹 Cleaning up..."
	docker-compose -f docker-compose.agents.yml down -v --remove-orphans
	docker volume prune -f
	docker image prune -f

clean-logs: ## Clean container logs
	@echo "🧹 Cleaning logs..."
	docker system prune -f --volumes

reset: ## Complete reset (WARNING: destroys all data)
	@echo "⚠️ This will destroy ALL data. Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	@make clean
	docker system prune -a -f --volumes
	@echo "🔥 Complete reset done!"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                            🔧 DEVELOPMENT UTILS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dev-setup: ## Setup development environment
	@echo "🛠️ Setting up development environment..."
	@pip install -r agents/chief/requirements.txt
	@pip install -r agents/model-router/requirements.txt
	@pip install -r agents/ingest/requirements.txt
	@pip install -r agents/data-quality/requirements.txt
	@pip install -r agents/anomaly/requirements.txt

shell-agent: ## Shell into agent container (usage: make shell-agent AGENT=chief)
	@if [ -z "$(AGENT)" ]; then \
		echo "❌ Please specify AGENT name"; \
		exit 1; \
	fi
	docker exec -it predator11-$(AGENT) /bin/bash

scale: ## Scale agent replicas (usage: make scale AGENT=chief REPLICAS=3)
	@if [ -z "$(AGENT)" ] || [ -z "$(REPLICAS)" ]; then \
		echo "❌ Usage: make scale AGENT=chief REPLICAS=3"; \
		exit 1; \
	fi
	docker-compose -f docker-compose.agents.yml up -d --scale $(AGENT)=$(REPLICAS)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#                              📋 INFORMATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

info: ## Show system information
	@echo "🤖 Predator11 Agents System Info"
	@echo "=================================="
	@echo "Docker version:"
	@docker --version
	@echo ""
	@echo "Docker Compose version:"
	@docker-compose --version
	@echo ""
	@echo "Available agents:"
	@echo "  • Chief Orchestrator (port 9001)"
	@echo "  • Model Router (port 9002)"
	@echo "  • Ingest Agent (port 9010)"
	@echo "  • Data Quality Agent (port 9012)"
	@echo "  • Anomaly Agent (port 9020)"
	@echo "  • Security Agent (port 9050)"
	@echo "  • Self-Healing Agent (port 9041)"
	@echo ""
	@echo "Infrastructure services:"
	@echo "  • Redis (port 6379)"
	@echo "  • OpenSearch (port 9200)"
	@echo "  • MinIO (ports 9000, 9001)"
	@echo "  • Keycloak (port 8080)"
	@echo "  • Prometheus (port 9090)"
	@echo "  • Grafana (port 3000)"
	@echo "  • Traefik (ports 80, 8080)"

endpoints: ## Show all API endpoints
	@echo "🔗 Agent API Endpoints"
	@echo "======================"
	@echo "Chief Orchestrator:"
	@echo "  POST /chief/ask - Submit user query"
	@echo "  GET  /chief/status/{task_id} - Get task status"
	@echo "  GET  /chief/health - Health check"
	@echo ""
	@echo "Model Router:"
	@echo "  POST /router/route - Route model request"
	@echo "  GET  /router/models - List available models"
	@echo "  GET  /router/usage - Usage statistics"
	@echo ""
	@echo "Ingest Agent:"
	@echo "  POST /ingest/upload - Upload file"
	@echo "  POST /ingest/commit/{file_id} - Commit and index"
	@echo "  GET  /ingest/profile/{file_id} - Get data profile"
	@echo ""
	@echo "Data Quality Agent:"
	@echo "  POST /quality/run - Run quality check"
	@echo "  GET  /quality/rules - List quality rules"
	@echo "  GET  /quality/report/{dataset_id} - Get quality report"
	@echo ""
	@echo "Anomaly Agent:"
	@echo "  POST /anomaly/run - Run anomaly detection"
	@echo "  GET  /anomaly/methods - List detection methods"
