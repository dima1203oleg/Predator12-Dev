# ==========================================
# PREDATOR12 LOCAL DEVELOPMENT MAKEFILE
# ==========================================

.PHONY: help install initdb migrate backend frontend dev dump restore smoke clean

# Default target
help: ## Show help message
	@echo "🚀 Predator12 Local Development Commands"
	@echo "=================================================="
	@echo
	@echo "Quick Start Commands:"
	@echo "  make setup     - Check prerequisites and setup"
	@echo "  make dev       - Start development environment"
	@echo "  make prod      - Deploy to production"
	@echo "  make test      - Run all tests and load testing"
	@echo "  make security  - Run security audit"
	@echo "  make backup    - Create full system backup"
	@echo "  make monitor   - Start health monitoring"
	@echo "  make clean     - Clean up development environment"
	@echo
	@echo "Interactive Mode:"
	@echo "  make interactive - Launch interactive control center"
	@echo "  ./predator11.sh  - Same as above"
	@echo
	@echo "Advanced Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ================== QUICK START COMMANDS ==================
setup: ## Check prerequisites and show status
	@./predator11.sh check

dev: ## Start development environment
	@./predator11.sh dev

prod: ## Deploy to production
	@./predator11.sh prod

test: ## Run comprehensive testing
	@./predator11.sh test

security: ## Run security audit
	@./predator11.sh security

backup: ## Create full system backup
	@./predator11.sh backup

monitor: ## Start health monitoring
	@./predator11.sh monitor

status: ## Show system status
	@./predator11.sh status

interactive: ## Launch interactive control center
	@./predator11.sh

# ================== DEVELOPMENT COMMANDS ==================
dev-start: ## Start development services
	@./scripts/dev-setup.sh start

dev-stop: ## Stop development services
	@./scripts/dev-setup.sh stop

dev-restart: ## Restart development services
	@./scripts/dev-setup.sh restart

dev-logs: ## View development logs
	@./scripts/dev-setup.sh logs

dev-clean: ## Clean development environment
	@./scripts/dev-setup.sh clean

# ================== PRODUCTION COMMANDS ==================
deploy: ## Deploy to production (full)
	@./scripts/deploy-production.sh

deploy-security: ## Setup security components only
	@./scripts/deploy-production.sh security

deploy-monitoring: ## Setup monitoring only
	@./scripts/deploy-production.sh monitoring

# ================== TESTING COMMANDS ==================
test-load: ## Run load testing
	@./scripts/load-testing.sh all

test-security: ## Run security tests
	@./scripts/security-audit.sh

test-api: ## Test API endpoints only
	@./scripts/load-testing.sh api

test-frontend: ## Test frontend only
	@./scripts/load-testing.sh frontend

# ================== OPERATIONS COMMANDS ==================
health-check: ## Run health check once
	@./scripts/health-monitor.sh check

health-monitor: ## Start continuous monitoring
	@./scripts/health-monitor.sh monitor

backup-full: ## Create full backup
	@./scripts/disaster-recovery.sh backup

backup-test: ## Test backup integrity
	@./scripts/disaster-recovery.sh test

restore-db: ## Restore database (requires BACKUP_FILE)
	@./scripts/disaster-recovery.sh restore-db $(BACKUP_FILE)

# ================== CLEANUP COMMANDS ==================
clean: ## Clean development environment
	@./scripts/dev-setup.sh clean
	@docker system prune -f

clean-all: ## Clean everything including volumes
	@./scripts/dev-setup.sh clean
	@docker system prune -af --volumes

# ================== INFORMATION COMMANDS ==================
docs: ## Open documentation
	@echo "📚 Opening documentation..."
	@if command -v open >/dev/null 2>&1; then \
		open PRODUCTION_DEPLOYMENT_GUIDE.md; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open PRODUCTION_DEPLOYMENT_GUIDE.md; \
	else \
		echo "Please open PRODUCTION_DEPLOYMENT_GUIDE.md manually"; \
	fi

version: ## Show version information
	@echo "Predator11 Production Infrastructure v1.0.0"
	@echo "Built: $(shell date)"
	@echo "Components:"
	@echo "  - Kubernetes/RKE2 with HA"
	@echo "  - Multi-agent system"
	@echo "  - Full security stack"
	@echo "  - Complete monitoring"
	@echo "  - CI/CD pipeline"

# ================== ALIASES ==================
start: dev-start ## Alias for dev-start
stop: dev-stop ## Alias for dev-stop
restart: dev-restart ## Alias for dev-restart
logs: dev-logs ## Alias for dev-logs

# ================== SPECIAL TARGETS ==================
.SILENT: help setup dev prod test security backup monitor status interactive
.EXPORT_ALL_VARIABLES:
