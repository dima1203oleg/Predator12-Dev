#!/usr/bin/env python3
"""
Скрипт консолідації проекту Predator11
Переносить файли з AAPredator8.0 та codespaces-models у відповідну структуру
"""

import os
import shutil
import logging
from pathlib import Path
import json
from typing import List, Dict

# Налаштування логування
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProjectConsolidator:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.source_paths = {
            'AAPredator8.0': self.base_path / 'AAPredator8.0',
            'codespaces-models': self.base_path / 'codespaces-models'
        }
        
        # Файли та папки для ігнорування
        self.ignore_patterns = {
            'directories': {
                '__pycache__', '.pytest_cache', '.venv', 'node_modules',
                '.git', '.vscode', '.cursor', '.qodo', '.sonarlint',
                'logs', '.DS_Store', 'minikube-darwin-amd64'
            },
            'files': {
                '*.pyc', '*.pyo', '*.log', '*.tmp', '.env',
                'terraform_1.5.7_darwin_arm64.zip', 'KUBECONFIG'
            }
        }

    def create_target_structure(self):
        """Створює цільову структуру папок"""
        target_dirs = [
            'backend/app/api',
            'backend/app/core', 
            'backend/app/models',
            'backend/app/schemas',
            'backend/app/services',
            'backend/app/workers',
            'backend/app/agents/orchestrator',
            'backend/app/agents/adapters',
            'backend/app/agents/handlers',
            'backend/tests',
            'backend/alembic',
            'frontend/src/components',
            'frontend/src/pages',
            'frontend/src/hooks',
            'frontend/src/store',
            'frontend/public',
            'etl/dags',
            'etl/jobs',
            'etl/transforms',
            'ml/pipelines',
            'ml/notebooks', 
            'ml/models',
            'opensearch/mappings',
            'opensearch/dashboards',
            'observability/prometheus',
            'observability/grafana/dashboards',
            'observability/grafana/provisioning',
            'observability/alertmanager',
            'infra/docker',
            'infra/k8s',
            'infra/helm',
            'scripts/migration',
            'scripts/indexing',
            'docs/architecture',
            'docs/api',
            '.vscode',
            'tests/integration',
            'tests/unit'
        ]
        
        for dir_path in target_dirs:
            full_path = self.base_path / dir_path
            full_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created directory: {dir_path}")

    def should_ignore(self, path: Path) -> bool:
        """Перевіряє, чи слід ігнорувати файл/папку"""
        name = path.name.lower()
        
        # Перевірка директорій
        if path.is_dir() and name in self.ignore_patterns['directories']:
            return True
            
        # Перевірка файлів за розширенням
        for pattern in self.ignore_patterns['files']:
            if pattern.startswith('*'):
                if name.endswith(pattern[1:]):
                    return True
            else:
                if name == pattern:
                    return True
        
        return False

    def copy_aapredator_files(self):
        """Переносить файли з AAPredator8.0"""
        source = self.source_paths['AAPredator8.0']
        
        if not source.exists():
            logger.error(f"Source directory not found: {source}")
            return

        # Мапінг папок AAPredator8.0 -> цільова структура
        folder_mapping = {
            'backend-api': 'backend/app',
            'frontend': 'frontend',
            'etl': 'etl',
            'etl-parsing': 'etl/parsing',
            'agents': 'backend/app/agents',
            'databases': 'backend/databases',
            'opensearch': 'opensearch',
            'prometheus': 'observability/prometheus',
            'grafana': 'observability/grafana',
            'k8s': 'infra/k8s',
            'terraform': 'infra/terraform',
            'scripts': 'scripts',
            'docs': 'docs',
            'documentation': 'docs',
            'tests': 'tests',
            'ai-llm': 'ml/pipelines',
            'PredatorAnalytics': 'ml/analytics',
            'observability': 'observability',
            'security': 'infra/security',
            'services': 'backend/services',
            'infra': 'infra'
        }

        # Копіюємо основні файли
        main_files = [
            'docker-compose.yml',
            'Makefile', 
            'README.md',
            'requirements.txt',
            '.env.example',
            'README_observability.md'
        ]

        for file_name in main_files:
            src_file = source / file_name
            if src_file.exists() and not self.should_ignore(src_file):
                dst_file = self.base_path / file_name
                # Якщо файл вже існує, створюємо резервну копію
                if dst_file.exists():
                    shutil.copy2(dst_file, dst_file.with_suffix('.backup'))
                shutil.copy2(src_file, dst_file)
                logger.info(f"Copied main file: {file_name}")

        # Копіюємо директорії відповідно до мапінгу
        for src_dir, dst_dir in folder_mapping.items():
            src_path = source / src_dir
            dst_path = self.base_path / dst_dir
            
            if src_path.exists() and src_path.is_dir():
                self.copy_directory_contents(src_path, dst_path)
                logger.info(f"Copied directory: {src_dir} -> {dst_dir}")

    def copy_codespaces_models_files(self):
        """Переносить файли з codespaces-models"""
        source = self.source_paths['codespaces-models']
        
        if not source.exists():
            logger.error(f"Source directory not found: {source}")
            return

        # Створюємо директорію для MCP сервера
        mcp_dir = self.base_path / 'backend/app/mcp'
        mcp_dir.mkdir(parents=True, exist_ok=True)

        # Файли для копіювання до MCP
        mcp_files = [
            'server.js',
            'advanced_ai_bot.py',
            'ai_integration_hub.py',
            'ai_model_tester.py',
            'package.json'
        ]

        for file_name in mcp_files:
            src_file = source / file_name
            if src_file.exists():
                dst_file = mcp_dir / file_name
                shutil.copy2(src_file, dst_file)
                logger.info(f"Copied MCP file: {file_name}")

        # Копіюємо веб-інтерфейс до frontend
        public_dir = source / 'public'
        if public_dir.exists():
            self.copy_directory_contents(public_dir, self.base_path / 'frontend/public/mcp')

        # Копіюємо приклади та документацію
        docs_mapping = {
            'cookbooks': 'docs/cookbooks',
            'guides': 'docs/guides', 
            'samples': 'docs/samples'
        }

        for src_name, dst_name in docs_mapping.items():
            src_path = source / src_name
            dst_path = self.base_path / dst_name
            if src_path.exists():
                self.copy_directory_contents(src_path, dst_path)

    def copy_directory_contents(self, src_dir: Path, dst_dir: Path):
        """Копіює вміст директорії, ігноруючи непотрібні файли"""
        if not src_dir.exists():
            return
            
        dst_dir.mkdir(parents=True, exist_ok=True)
        
        for item in src_dir.iterdir():
            if self.should_ignore(item):
                continue
                
            dst_item = dst_dir / item.name
            
            if item.is_dir():
                self.copy_directory_contents(item, dst_item)
            else:
                try:
                    shutil.copy2(item, dst_item)
                except Exception as e:
                    logger.warning(f"Failed to copy {item}: {e}")

    def create_agent_configs(self):
        """Створює конфігураційні файли для агентів"""
        # Створюємо registry.yaml
        registry_config = {
            'agents': {
                'DatasetIngestAgent': {
                    'primary_model': 'microsoft/phi-4-reasoning',
                    'fallback_models': ['openai/gpt-4o-mini', 'meta/meta-llama-3.1-8b-instruct'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'DatasetRegistryAgent': {
                    'primary_model': 'mistral-ai/mistral-small-2503',
                    'fallback_models': ['openai/gpt-4o-mini'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'IndexerAgent': {
                    'primary_model': 'meta/meta-llama-3.1-8b-instruct',
                    'fallback_models': ['microsoft/phi-4-mini-instruct'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'SearchPlannerAgent': {
                    'primary_model': 'microsoft/phi-4-reasoning',
                    'fallback_models': ['mistral-ai/mistral-large-2411'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'AnomalyAgent': {
                    'primary_model': 'deepseek/deepseek-v3-0324',
                    'fallback_models': ['microsoft/phi-4-reasoning'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'ForecastAgent': {
                    'primary_model': 'mistral-ai/mistral-large-2411',
                    'fallback_models': ['meta/meta-llama-3.1-405b-instruct'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'OSINTAgent': {
                    'primary_model': 'meta/meta-llama-3.1-8b-instruct',
                    'fallback_models': ['openai/gpt-4o'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'GraphIntelligenceAgent': {
                    'primary_model': 'microsoft/phi-4-reasoning',
                    'fallback_models': ['mistral-ai/mistral-large-2411'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'ReportExportAgent': {
                    'primary_model': 'openai/gpt-4o-mini',
                    'fallback_models': ['microsoft/phi-4-mini-instruct'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'BillingGateAgent': {
                    'primary_model': 'mistral-ai/mistral-small-2503',
                    'fallback_models': ['openai/gpt-4o-mini'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'ModelRouterAgent': {
                    'primary_model': 'microsoft/phi-4-reasoning',
                    'fallback_models': ['openai/gpt-4o-mini', 'meta/meta-llama-3.1-8b-instruct'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'ArbiterAgent': {
                    'primary_model': 'meta/meta-llama-3.1-405b-instruct',
                    'fallback_models': ['mistral-ai/mistral-large-2411'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'AutoHealAgent': {
                    'primary_model': 'openai/gpt-4o-mini',
                    'fallback_models': ['mistral-ai/codestral-2501', 'microsoft/phi-4-mini-reasoning'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'SelfDiagnosisAgent': {
                    'primary_model': 'mistral-ai/codestral-2501',
                    'fallback_models': ['microsoft/phi-4-reasoning'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'SelfImprovementAgent': {
                    'primary_model': 'meta/meta-llama-3.1-405b-instruct',
                    'fallback_models': ['mistral-ai/mistral-large-2411'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'RedTeamAgent': {
                    'primary_model': 'microsoft/phi-4-reasoning',
                    'fallback_models': ['deepseek/deepseek-v3-0324'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                },
                'NEXUS_SUPERVISOR': {
                    'primary_model': 'meta/meta-llama-3.1-405b-instruct',
                    'fallback_models': ['mistral-ai/mistral-large-2411', 'microsoft/phi-4-reasoning'],
                    'embedding_model': 'cohere/cohere-embed-v3-multilingual'
                }
            }
        }

        # Зберігаємо registry.yaml
        registry_path = self.base_path / 'backend/app/agents/registry.yaml'
        with open(registry_path, 'w', encoding='utf-8') as f:
            import yaml
            yaml.dump(registry_config, f, default_flow_style=False, allow_unicode=True)
        
        logger.info("Created agents registry.yaml")

        # Створюємо policies.yaml
        policies_config = {
            'routing': {
                'quality_weight': 0.4,
                'latency_weight': 0.3,
                'cost_weight': 0.3,
                'rate_limit_threshold': 0.8
            },
            'limits': {
                'max_tokens_per_request': 4096,
                'max_requests_per_minute': 100,
                'max_concurrent_requests': 10,
                'timeout_seconds': 300
            },
            'fallback': {
                'enabled': True,
                'max_retries': 3,
                'backoff_factor': 2.0
            },
            'models': {
                'microsoft/phi-4-reasoning': {'cost': 0.5, 'quality': 0.9, 'latency': 0.7},
                'meta/meta-llama-3.1-405b-instruct': {'cost': 0.9, 'quality': 1.0, 'latency': 0.3},
                'mistral-ai/mistral-large-2411': {'cost': 0.7, 'quality': 0.9, 'latency': 0.6},
                'openai/gpt-4o-mini': {'cost': 0.3, 'quality': 0.8, 'latency': 0.8},
                'meta/meta-llama-3.1-8b-instruct': {'cost': 0.4, 'quality': 0.7, 'latency': 0.9}
            }
        }

        policies_path = self.base_path / 'backend/app/agents/policies.yaml'
        with open(policies_path, 'w', encoding='utf-8') as f:
            yaml.dump(policies_config, f, default_flow_style=False, allow_unicode=True)
        
        logger.info("Created agents policies.yaml")

    def create_docker_compose(self):
        """Створює оновлений docker-compose.yml"""
        compose_config = {
            'version': '3.8',
            'services': {
                'backend': {
                    'build': {
                        'context': './backend',
                        'dockerfile': 'Dockerfile'
                    },
                    'ports': ['8000:8000'],
                    'environment': [
                        'DATABASE_URL=postgresql://postgres:postgres@db:5432/predator11',
                        'REDIS_URL=redis://redis:6379',
                        'OPENSEARCH_URL=http://opensearch:9200',
                        'MINIO_URL=http://minio:9000'
                    ],
                    'depends_on': ['db', 'redis', 'opensearch', 'minio'],
                    'volumes': [
                        './backend:/app',
                        './logs:/app/logs'
                    ]
                },
                'frontend': {
                    'build': {
                        'context': './frontend',
                        'dockerfile': 'Dockerfile'
                    },
                    'ports': ['3000:3000'],
                    'depends_on': ['backend'],
                    'volumes': ['./frontend:/app']
                },
                'db': {
                    'image': 'postgres:15',
                    'environment': [
                        'POSTGRES_DB=predator11',
                        'POSTGRES_USER=postgres', 
                        'POSTGRES_PASSWORD=postgres'
                    ],
                    'volumes': ['postgres_data:/var/lib/postgresql/data'],
                    'ports': ['5432:5432']
                },
                'redis': {
                    'image': 'redis:7-alpine',
                    'ports': ['6379:6379'],
                    'volumes': ['redis_data:/data']
                },
                'opensearch': {
                    'image': 'opensearchproject/opensearch:2.11.0',
                    'environment': [
                        'discovery.type=single-node',
                        'OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m',
                        'DISABLE_SECURITY_PLUGIN=true'
                    ],
                    'ports': ['9200:9200', '9600:9600'],
                    'volumes': ['opensearch_data:/usr/share/opensearch/data']
                },
                'opensearch-dashboards': {
                    'image': 'opensearchproject/opensearch-dashboards:2.11.0',
                    'ports': ['5601:5601'],
                    'environment': [
                        'OPENSEARCH_HOSTS=http://opensearch:9200',
                        'DISABLE_SECURITY_DASHBOARDS_PLUGIN=true'
                    ],
                    'depends_on': ['opensearch']
                },
                'minio': {
                    'image': 'minio/minio',
                    'ports': ['9000:9000', '9001:9001'],
                    'environment': [
                        'MINIO_ROOT_USER=minioadmin',
                        'MINIO_ROOT_PASSWORD=minioadmin'
                    ],
                    'command': 'server /data --console-address ":9001"',
                    'volumes': ['minio_data:/data']
                },
                'keycloak': {
                    'image': 'quay.io/keycloak/keycloak:23.0',
                    'environment': [
                        'KEYCLOAK_ADMIN=admin',
                        'KEYCLOAK_ADMIN_PASSWORD=admin',
                        'KC_DB=postgres',
                        'KC_DB_URL=jdbc:postgresql://db:5432/keycloak',
                        'KC_DB_USERNAME=postgres',
                        'KC_DB_PASSWORD=postgres',
                        'KC_HEALTH_ENABLED=true',
                        'KC_METRICS_ENABLED=true'
                    ],
                    'ports': ['8080:8080'],
                    'depends_on': ['db'],
                    'command': 'start-dev'
                },
                'prometheus': {
                    'image': 'prom/prometheus:v2.47.0',
                    'ports': ['9090:9090'],
                    'volumes': [
                        './observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml',
                        './observability/prometheus/rules:/etc/prometheus/rules',
                        'prometheus_data:/prometheus'
                    ],
                    'command': [
                        '--config.file=/etc/prometheus/prometheus.yml',
                        '--storage.tsdb.path=/prometheus',
                        '--web.console.libraries=/etc/prometheus/console_libraries',
                        '--web.console.templates=/etc/prometheus/consoles',
                        '--storage.tsdb.retention.time=200h',
                        '--web.enable-lifecycle'
                    ]
                },
                'alertmanager': {
                    'image': 'prom/alertmanager:v0.26.0',
                    'ports': ['9093:9093'],
                    'volumes': [
                        './observability/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml'
                    ]
                },
                'grafana': {
                    'image': 'grafana/grafana:10.1.0',
                    'ports': ['3001:3000'],
                    'environment': [
                        'GF_SECURITY_ADMIN_PASSWORD=admin'
                    ],
                    'volumes': [
                        'grafana_data:/var/lib/grafana',
                        './observability/grafana/provisioning:/etc/grafana/provisioning',
                        './observability/grafana/dashboards:/var/lib/grafana/dashboards'
                    ]
                }
            },
            'volumes': [
                'postgres_data:', 'redis_data:', 'opensearch_data:',
                'minio_data:', 'prometheus_data:', 'grafana_data:'
            ]
        }

        compose_path = self.base_path / 'docker-compose.yml'
        with open(compose_path, 'w', encoding='utf-8') as f:
            yaml.dump(compose_config, f, default_flow_style=False)
        
        logger.info("Created docker-compose.yml")

    def create_makefile(self):
        """Створює Makefile з основними командами"""
        makefile_content = '''
.PHONY: help install build start stop restart logs clean lint test
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \\033[36m%-15s\\033[0m %s\\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Setting up pre-commit hooks..."
	pre-commit install

build: ## Build all Docker containers
	docker-compose build

start: ## Start all services
	docker-compose up -d
	@echo "Services started. Access:"
	@echo "  - Frontend: http://localhost:3000"
	@echo "  - Backend API: http://localhost:8000"
	@echo "  - Grafana: http://localhost:3001 (admin/admin)"
	@echo "  - OpenSearch Dashboards: http://localhost:5601"
	@echo "  - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)"
	@echo "  - Keycloak: http://localhost:8080 (admin/admin)"

stop: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

clean: ## Clean up containers, volumes, and images
	docker-compose down -v
	docker system prune -f

lint: ## Run linting for all projects
	@echo "Linting backend..."
	cd backend && python -m flake8 app/
	cd backend && python -m black --check app/
	@echo "Linting frontend..."
	cd frontend && npm run lint

test: ## Run tests
	@echo "Running backend tests..."
	cd backend && python -m pytest tests/
	@echo "Running frontend tests..."
	cd frontend && npm test

dev-setup: ## Setup development environment
	cp .env.example .env
	@echo "Please edit .env file with your configuration"
	make install
	make build

prod-deploy: ## Deploy to production
	@echo "Building production images..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

health-check: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:8000/health || echo "Backend: DOWN"
	@curl -f http://localhost:3000 || echo "Frontend: DOWN"  
	@curl -f http://localhost:9200/_cluster/health || echo "OpenSearch: DOWN"
	@curl -f http://localhost:9090/-/ready || echo "Prometheus: DOWN"

backup: ## Backup databases
	@echo "Creating backup..."
	docker-compose exec db pg_dump -U postgres predator11 > backup_$(shell date +%Y%m%d_%H%M%S).sql

migrate: ## Run database migrations
	cd backend && alembic upgrade head

seed-data: ## Load seed data
	cd backend && python -m scripts.load_seed_data

index-data: ## Index data to OpenSearch
	cd backend && python -m scripts.index_pg_to_opensearch
'''

        makefile_path = self.base_path / 'Makefile'
        with open(makefile_path, 'w', encoding='utf-8') as f:
            f.write(makefile_content.strip())
        
        logger.info("Created Makefile")

    def create_env_example(self):
        """Створює .env.example з необхідними змінними"""
        env_content = '''# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/predator11
REDIS_URL=redis://localhost:6379

# OpenSearch Configuration
OPENSEARCH_URL=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# MinIO Configuration
MINIO_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=predator11

# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=predator11
KEYCLOAK_CLIENT_ID=predator11-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret

# API Keys
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_api_key
BING_SUBSCRIPTION_KEY=your_bing_key
GOOGLE_API_KEY=your_google_api_key

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-char-encryption-key

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001

# Application Settings
DEBUG=true
LOG_LEVEL=INFO
ENVIRONMENT=development

# Self-improvement settings
SELF_IMPROVEMENT_ENABLED=true
AUTO_HEAL_ENABLED=true
RED_TEAM_ENABLED=false

# Rate limiting
MAX_REQUESTS_PER_MINUTE=100
MAX_CONCURRENT_REQUESTS=10
'''

        env_path = self.base_path / '.env.example'
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content.strip())
        
        logger.info("Created .env.example")

    def create_supervisor_agent(self):
        """Створює головного агента (Supervisor)"""
        supervisor_code = '''#!/usr/bin/env python3
"""
NEXUS Supervisor Agent - Головний агент системи Predator11
Контролює всі процеси, приймає команди від користувача, 
запускає/зупиняє самоудосконалення та слідкує за станом інших агентів.
"""

import asyncio
import logging
import yaml
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger(__name__)

class NexusSupervisor:
    """Головний агент системи"""
    
    def __init__(self, config_path: str = None):
        self.config_path = Path(config_path or "agents/registry.yaml")
        self.agents: Dict[str, Any] = {}
        self.agent_status: Dict[str, str] = {}
        self.self_improvement_active = False
        self.commands = {
            'status': self.get_system_status,
            'start_self_improve': self.start_self_improvement,
            'stop_self_improve': self.stop_self_improvement,
            'restart_agent': self.restart_agent,
            'shutdown': self.shutdown_system,
            'health_check': self.health_check,
            'list_agents': self.list_agents
        }
        
    async def initialize(self):
        """Ініціалізує систему агентів"""
        logger.info("Initializing NEXUS Supervisor...")
        
        # Завантажуємо конфігурацію агентів
        await self.load_agent_registry()
        
        # Запускаємо всіх агентів
        await self.start_all_agents()
        
        # Запускаємо моніторинг
        asyncio.create_task(self.monitor_agents())
        
        logger.info("NEXUS Supervisor initialized successfully")
        
    async def load_agent_registry(self):
        """Завантажує реєстр агентів"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
                
            for agent_name, agent_config in config.get('agents', {}).items():
                self.agents[agent_name] = agent_config
                self.agent_status[agent_name] = 'stopped'
                
        except Exception as e:
            logger.error(f"Failed to load agent registry: {e}")
            raise
            
    async def start_all_agents(self):
        """Запускає всіх агентів"""
        for agent_name in self.agents:
            await self.start_agent(agent_name)
            
    async def start_agent(self, agent_name: str) -> bool:
        """Запускає конкретного агента"""
        try:
            logger.info(f"Starting agent: {agent_name}")
            
            # Тут буде логіка запуску агента
            # Поки що просто змінюємо статус
            self.agent_status[agent_name] = 'running'
            
            return True
        except Exception as e:
            logger.error(f"Failed to start agent {agent_name}: {e}")
            self.agent_status[agent_name] = 'error'
            return False
            
    async def stop_agent(self, agent_name: str) -> bool:
        """Зупиняє конкретного агента"""
        try:
            logger.info(f"Stopping agent: {agent_name}")
            
            # Тут буде логіка зупинки агента
            self.agent_status[agent_name] = 'stopped'
            
            return True
        except Exception as e:
            logger.error(f"Failed to stop agent {agent_name}: {e}")
            return False
            
    async def restart_agent(self, agent_name: str) -> Dict[str, Any]:
        """Перезапускає агента"""
        if agent_name not in self.agents:
            return {'error': f'Agent {agent_name} not found'}
            
        await self.stop_agent(agent_name)
        await asyncio.sleep(2)
        success = await self.start_agent(agent_name)
        
        return {
            'agent': agent_name,
            'status': 'restarted' if success else 'failed',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
    async def monitor_agents(self):
        """Моніторинг стану агентів"""
        while True:
            try:
                # Перевіряємо стан кожного агента
                for agent_name in self.agents:
                    # Тут буде логіка перевірки здоров'я агента
                    pass
                    
                await asyncio.sleep(30)  # Перевіряємо кожні 30 секунд
            except Exception as e:
                logger.error(f"Error in agent monitoring: {e}")
                await asyncio.sleep(5)
                
    async def get_system_status(self) -> Dict[str, Any]:
        """Повертає статус системи"""
        return {
            'supervisor': 'running',
            'agents': self.agent_status.copy(),
            'self_improvement': 'active' if self.self_improvement_active else 'inactive',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'total_agents': len(self.agents),
            'running_agents': sum(1 for status in self.agent_status.values() if status == 'running')
        }
        
    async def start_self_improvement(self) -> Dict[str, str]:
        """Запускає цикл самоудосконалення"""
        if self.self_improvement_active:
            return {'message': 'Self-improvement already active'}
            
        self.self_improvement_active = True
        
        # Запускаємо SelfImprovementAgent
        await self.start_agent('SelfImprovementAgent')
        
        logger.info("Self-improvement cycle started")
        return {'message': 'Self-improvement cycle started successfully'}
        
    async def stop_self_improvement(self) -> Dict[str, str]:
        """Зупиняє цикл самоудосконалення"""
        if not self.self_improvement_active:
            return {'message': 'Self-improvement already inactive'}
            
        self.self_improvement_active = False
        
        # Зупиняємо SelfImprovementAgent
        await self.stop_agent('SelfImprovementAgent')
        
        logger.info("Self-improvement cycle stopped")
        return {'message': 'Self-improvement cycle stopped successfully'}
        
    async def health_check(self) -> Dict[str, Any]:
        """Перевірка здоров'я системи"""
        healthy_agents = 0
        total_agents = len(self.agents)
        
        for agent_name, status in self.agent_status.items():
            if status == 'running':
                healthy_agents += 1
                
        health_ratio = healthy_agents / total_agents if total_agents > 0 else 0
        
        return {
            'healthy': health_ratio >= 0.8,  # 80% агентів повинні працювати
            'healthy_agents': healthy_agents,
            'total_agents': total_agents,
            'health_ratio': health_ratio,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
    async def list_agents(self) -> Dict[str, Any]:
        """Повертає список всіх агентів"""
        return {
            'agents': [
                {
                    'name': name,
                    'status': self.agent_status[name],
                    'config': config
                }
                for name, config in self.agents.items()
            ]
        }
        
    async def shutdown_system(self) -> Dict[str, str]:
        """Безпечне відключення системи"""
        logger.info("Initiating system shutdown...")
        
        # Зупиняємо самоудосконалення
        if self.self_improvement_active:
            await self.stop_self_improvement()
            
        # Зупиняємо всіх агентів
        for agent_name in self.agents:
            await self.stop_agent(agent_name)
            
        logger.info("System shutdown completed")
        return {'message': 'System shutdown completed successfully'}
        
    async def execute_command(self, command: str, *args, **kwargs) -> Dict[str, Any]:
        """Виконує команду"""
        if command not in self.commands:
            return {'error': f'Unknown command: {command}'}
            
        try:
            result = await self.commands[command](*args, **kwargs)
            return {'success': True, 'result': result}
        except Exception as e:
            logger.error(f"Error executing command {command}: {e}")
            return {'success': False, 'error': str(e)}

# Глобальний екземпляр супервізора
supervisor = None

async def get_supervisor() -> NexusSupervisor:
    """Повертає екземпляр супервізора"""
    global supervisor
    if supervisor is None:
        supervisor = NexusSupervisor()
        await supervisor.initialize()
    return supervisor

async def main():
    """Головна функція для запуску супервізора"""
    supervisor = await get_supervisor()
    
    # Простий інтерфейс командного рядка
    while True:
        try:
            command = input("nexus> ").strip()
            if not command:
                continue
                
            if command == 'exit':
                await supervisor.shutdown_system()
                break
                
            result = await supervisor.execute_command(command)
            print(result)
            
        except KeyboardInterrupt:
            await supervisor.shutdown_system()
            break
        except Exception as e:
            logger.error(f"Error: {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
'''

        supervisor_path = self.base_path / 'backend/app/agents/supervisor.py'
        with open(supervisor_path, 'w', encoding='utf-8') as f:
            f.write(supervisor_code)
        
        logger.info("Created supervisor.py")

    def run_consolidation(self):
        """Виконує повну консолідацію проекту"""
        logger.info("Starting project consolidation...")
        
        try:
            # 1. Створюємо цільову структуру
            logger.info("Creating target directory structure...")
            self.create_target_structure()
            
            # 2. Переносимо файли з AAPredator8.0
            logger.info("Copying files from AAPredator8.0...")
            self.copy_aapredator_files()
            
            # 3. Переносимо файли з codespaces-models
            logger.info("Copying files from codespaces-models...")
            self.copy_codespaces_models_files()
            
            # 4. Створюємо конфігурації агентів
            logger.info("Creating agent configurations...")
            self.create_agent_configs()
            
            # 5. Створюємо docker-compose
            logger.info("Creating docker-compose.yml...")
            self.create_docker_compose()
            
            # 6. Створюємо Makefile
            logger.info("Creating Makefile...")
            self.create_makefile()
            
            # 7. Створюємо .env.example
            logger.info("Creating .env.example...")
            self.create_env_example()
            
            # 8. Створюємо головного агента
            logger.info("Creating supervisor agent...")
            self.create_supervisor_agent()
            
            logger.info("Project consolidation completed successfully!")
            
        except Exception as e:
            logger.error(f"Consolidation failed: {e}")
            raise

def main():
    """Головна функція"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Consolidate Predator11 project')
    parser.add_argument('--base-path', default='/Users/dima/Documents/Predator11',
                       help='Base path for the project')
    
    args = parser.parse_args()
    
    consolidator = ProjectConsolidator(args.base_path)
    consolidator.run_consolidation()

if __name__ == "__main__":
    # Імпортуємо yaml
    try:
        import yaml
    except ImportError:
        print("Installing PyYAML...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'PyYAML'])
        import yaml
    
    main()
