.PHONY: help install dev up down logs clean test build deploy

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '${BLUE}Predator Analytics - Available Commands${NC}'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# Development Commands

install: ## Install dependencies for local development
	@echo "${BLUE}Installing backend dependencies...${NC}"
	cd backend && pip install -r requirements.txt
	@echo "${BLUE}Installing frontend dependencies...${NC}"
	cd frontend && npm install
	@echo "${GREEN}✓ Dependencies installed${NC}"

dev: ## Start development environment with Docker Compose
	@echo "${BLUE}Starting development environment...${NC}"
	docker-compose up -d
	@echo "${GREEN}✓ Services started${NC}"
	@echo ""
	@echo "Frontend:    http://localhost:3000"
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs:    http://localhost:8000/api/docs"
	@echo "Grafana:     http://localhost:3001 (admin/admin)"
	@echo "Prometheus:  http://localhost:9090"
	@echo "Flower:      http://localhost:5555"

up: dev ## Alias for 'dev'

down: ## Stop all services
	@echo "${BLUE}Stopping services...${NC}"
	docker-compose down
	@echo "${GREEN}✓ Services stopped${NC}"

stop: down ## Alias for 'down'

restart: ## Restart all services
	@echo "${BLUE}Restarting services...${NC}"
	docker-compose restart
	@echo "${GREEN}✓ Services restarted${NC}"

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

logs-celery: ## Show Celery worker logs
	docker-compose logs -f celery-worker

status: ## Show status of all services
	@echo "${BLUE}Service Status:${NC}"
	@docker-compose ps

ps: status ## Alias for 'status'

# Testing

test: ## Run all tests
	@echo "${BLUE}Running backend tests...${NC}"
	cd backend && pytest tests/ -v
	@echo "${BLUE}Running frontend tests...${NC}"
	cd frontend && npm run test
	@echo "${GREEN}✓ All tests passed${NC}"

test-backend: ## Run backend tests only
	cd backend && pytest tests/ -v --cov

test-frontend: ## Run frontend tests only
	cd frontend && npm run test

lint: ## Run linters
	@echo "${BLUE}Linting backend...${NC}"
	cd backend && flake8 .
	@echo "${BLUE}Linting frontend...${NC}"
	cd frontend && npm run lint
	@echo "${GREEN}✓ Linting complete${NC}"

# Building

build: ## Build Docker images
	@echo "${BLUE}Building Docker images...${NC}"
	docker-compose build
	@echo "${GREEN}✓ Images built${NC}"

build-backend: ## Build backend image
	docker-compose build backend

build-frontend: ## Build frontend image
	docker-compose build frontend

# Database

db-migrate: ## Run database migrations
	docker-compose exec backend alembic upgrade head

db-rollback: ## Rollback last migration
	docker-compose exec backend alembic downgrade -1

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d predator_analytics

db-backup: ## Backup database
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U postgres predator_analytics > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}✓ Database backed up to backups/backup_$(shell date +%Y%m%d_%H%M%S).sql${NC}"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/backup.sql)
	docker-compose exec -T postgres psql -U postgres predator_analytics < $(FILE)
	@echo "${GREEN}✓ Database restored from $(FILE)${NC}"

# Redis

redis-cli: ## Open Redis CLI
	docker-compose exec redis redis-cli

redis-flush: ## Flush Redis cache
	docker-compose exec redis redis-cli FLUSHALL
	@echo "${GREEN}✓ Redis cache flushed${NC}"

# Kubernetes/Helm

k8s-install: ## Install to Kubernetes using Helm
	@echo "${BLUE}Installing to Kubernetes...${NC}"
	cd helm/predator-analytics && \
	helm dependency update && \
	helm install predator-analytics . \
		-f values.yaml \
		-f values-prod.yaml \
		--namespace predator-analytics-production \
		--create-namespace
	@echo "${GREEN}✓ Installed to Kubernetes${NC}"

k8s-upgrade: ## Upgrade Kubernetes deployment
	@echo "${BLUE}Upgrading Kubernetes deployment...${NC}"
	cd helm/predator-analytics && \
	helm dependency update && \
	helm upgrade predator-analytics . \
		-f values.yaml \
		-f values-prod.yaml \
		--namespace predator-analytics-production
	@echo "${GREEN}✓ Deployment upgraded${NC}"

k8s-uninstall: ## Uninstall from Kubernetes
	helm uninstall predator-analytics --namespace predator-analytics-production

k8s-status: ## Show Kubernetes deployment status
	kubectl get all -n predator-analytics-production

k8s-logs: ## Show logs from Kubernetes pods
	kubectl logs -f deployment/predator-analytics-backend -n predator-analytics-production

# Terraform

tf-init: ## Initialize Terraform
	cd terraform && terraform init

tf-plan: ## Show Terraform plan
	cd terraform && terraform plan -var-file="production.tfvars"

tf-apply: ## Apply Terraform changes
	cd terraform && terraform apply -var-file="production.tfvars"

tf-destroy: ## Destroy Terraform infrastructure
	cd terraform && terraform destroy -var-file="production.tfvars"

# Monitoring

monitor: ## Open Grafana dashboard
	@echo "${BLUE}Opening Grafana...${NC}"
	open http://localhost:3001

prometheus: ## Open Prometheus
	open http://localhost:9090

# Cleanup

clean: ## Stop services and remove volumes
	@echo "${RED}Stopping services and removing volumes...${NC}"
	docker-compose down -v
	@echo "${GREEN}✓ Cleanup complete${NC}"

clean-all: clean ## Remove all Docker resources
	@echo "${RED}Removing Docker images...${NC}"
	docker-compose down -v --rmi all
	@echo "${GREEN}✓ All resources removed${NC}"

prune: ## Clean up Docker system
	docker system prune -af --volumes
	@echo "${GREEN}✓ Docker system pruned${NC}"

# Utility

shell-backend: ## Open shell in backend container
	docker-compose exec backend /bin/bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

shell-postgres: ## Open shell in PostgreSQL container
	docker-compose exec postgres /bin/bash

format: ## Format code
	@echo "${BLUE}Formatting backend code...${NC}"
	cd backend && black . && isort .
	@echo "${BLUE}Formatting frontend code...${NC}"
	cd frontend && npm run format
	@echo "${GREEN}✓ Code formatted${NC}"

env-check: ## Check environment configuration
	@echo "${BLUE}Checking environment...${NC}"
	@test -f backend/.env || (echo "${RED}✗ backend/.env not found${NC}" && exit 1)
	@test -f frontend/.env || (echo "${RED}✗ frontend/.env not found${NC}" && exit 1)
	@echo "${GREEN}✓ Environment files present${NC}"

health: ## Check health of all services
	@echo "${BLUE}Checking service health...${NC}"
	@curl -s http://localhost:8000/health | jq . || echo "${RED}✗ Backend not healthy${NC}"
	@echo "${GREEN}✓ Health check complete${NC}"

version: ## Show version information
	@echo "Predator Analytics v1.0.0"
	@echo "Docker: $(shell docker --version)"
	@echo "Docker Compose: $(shell docker-compose --version)"
	@echo "kubectl: $(shell kubectl version --client --short 2>/dev/null || echo 'not installed')"
	@echo "Helm: $(shell helm version --short 2>/dev/null || echo 'not installed')"
