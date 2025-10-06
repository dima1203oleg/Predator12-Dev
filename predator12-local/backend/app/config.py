"""
Production Configuration for Predator Analytics
Environment-specific settings and feature flags
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from enum import Enum

class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"

@dataclass
class DatabaseConfig:
    host: str = os.getenv("DATABASE_HOST", "localhost")
    port: int = int(os.getenv("DATABASE_PORT", "5432"))
    database: str = os.getenv("DATABASE_NAME", "predator_nexus")
    username: str = os.getenv("DATABASE_USER", "predator_user")
    password: str = os.getenv("DATABASE_PASSWORD", "predator_pass123")
    pool_size: int = int(os.getenv("DATABASE_POOL_SIZE", "20"))
    max_overflow: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "30"))
    
    @property
    def url(self) -> str:
        return f"postgresql://{self.username}:{self.password}@{self.host}:{self.port}/{self.database}"

@dataclass
class RedisConfig:
    host: str = os.getenv("REDIS_HOST", "localhost")
    port: int = int(os.getenv("REDIS_PORT", "6379"))
    db: int = int(os.getenv("REDIS_DB", "0"))
    password: str | None = os.getenv("REDIS_PASSWORD")
    max_connections: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "100"))
    
    @property
    def url(self) -> str:
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.db}"

@dataclass
class CeleryConfig:
    broker_url: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    result_backend: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    task_serializer: str = "json"
    accept_content: list = field(default_factory=lambda: ["json"])
    result_serializer: str = "json"
    timezone: str = "UTC"
    enable_utc: bool = True
    task_track_started: bool = True
    task_time_limit: int = int(os.getenv("CELERY_TASK_TIME_LIMIT", "300"))
    task_soft_time_limit: int = int(os.getenv("CELERY_TASK_SOFT_TIME_LIMIT", "240"))
    worker_prefetch_multiplier: int = int(os.getenv("CELERY_WORKER_PREFETCH", "1"))
    worker_max_tasks_per_child: int = int(os.getenv("CELERY_WORKER_MAX_TASKS", "1000"))

@dataclass
class MLflowConfig:
    tracking_uri: str = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    experiment_name: str = os.getenv("MLFLOW_EXPERIMENT_NAME", "predator_analytics")
    artifact_root: str = os.getenv("MLFLOW_ARTIFACT_ROOT", "/mlflow/artifacts")

@dataclass
class QdrantConfig:
    host: str = os.getenv("QDRANT_HOST", "localhost")
    port: int = int(os.getenv("QDRANT_PORT", "6333"))
    api_key: str | None = os.getenv("QDRANT_API_KEY")
    timeout: int = int(os.getenv("QDRANT_TIMEOUT", "60"))
    
    @property
    def url(self) -> str:
        return f"http://{self.host}:{self.port}"

@dataclass
class OpenSearchConfig:
    hosts: list = field(default_factory=lambda: [os.getenv("OPENSEARCH_HOST", "localhost:9200")])
    username: str | None = os.getenv("OPENSEARCH_USERNAME")
    password: str | None = os.getenv("OPENSEARCH_PASSWORD")
    use_ssl: bool = os.getenv("OPENSEARCH_USE_SSL", "false").lower() == "true"
    verify_certs: bool = os.getenv("OPENSEARCH_VERIFY_CERTS", "true").lower() == "true"
    timeout: int = int(os.getenv("OPENSEARCH_TIMEOUT", "60"))

@dataclass
class SecurityConfig:
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    keycloak_url: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    keycloak_realm: str = os.getenv("KEYCLOAK_REALM", "predator")
    keycloak_client_id: str = os.getenv("KEYCLOAK_CLIENT_ID", "predator-api")
    keycloak_client_secret: str = os.getenv("KEYCLOAK_CLIENT_SECRET", "")
    vault_url: str = os.getenv("VAULT_URL", "http://localhost:8200")
    vault_token: str = os.getenv("VAULT_TOKEN", "")

@dataclass
class MonitoringConfig:
    prometheus_enabled: bool = os.getenv("PROMETHEUS_ENABLED", "true").lower() == "true"
    grafana_enabled: bool = os.getenv("GRAFANA_ENABLED", "true").lower() == "true"
    tracing_enabled: bool = os.getenv("TRACING_ENABLED", "true").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    metrics_port: int = int(os.getenv("METRICS_PORT", "9090"))

@dataclass
class AgentConfig:
    max_workers: int = int(os.getenv("AGENT_MAX_WORKERS", "4"))
    task_timeout: int = int(os.getenv("AGENT_TASK_TIMEOUT", "300"))
    retry_attempts: int = int(os.getenv("AGENT_RETRY_ATTEMPTS", "3"))
    retry_delay: int = int(os.getenv("AGENT_RETRY_DELAY", "60"))

@dataclass
class APIConfig:
    host: str = os.getenv("API_HOST", "0.0.0.0")
    port: int = int(os.getenv("API_PORT", "5001"))
    debug: bool = os.getenv("API_DEBUG", "false").lower() == "true"
    reload: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    workers: int = int(os.getenv("API_WORKERS", "1"))
    rate_limit: str = os.getenv("API_RATE_LIMIT", "1000/minute")
    cors_origins: list = field(
        default_factory=lambda: os.getenv("API_CORS_ORIGINS", "*").split(",")
    )

@dataclass
class Config:
    """Main configuration class"""
    environment: Environment = Environment(os.getenv("ENVIRONMENT", "development"))
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Service configurations
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    redis: RedisConfig = field(default_factory=RedisConfig)
    celery: CeleryConfig = field(default_factory=CeleryConfig)
    mlflow: MLflowConfig = field(default_factory=MLflowConfig)
    qdrant: QdrantConfig = field(default_factory=QdrantConfig)
    opensearch: OpenSearchConfig = field(default_factory=OpenSearchConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    monitoring: MonitoringConfig = field(default_factory=MonitoringConfig)
    agents: AgentConfig = field(default_factory=AgentConfig)
    api: APIConfig = field(default_factory=APIConfig)
    
    # Feature flags
    features: dict[str, bool] = field(default_factory=lambda: {
        "enable_ml_models": os.getenv("FEATURE_ML_MODELS", "true").lower() == "true",
        "enable_vector_search": os.getenv("FEATURE_VECTOR_SEARCH", "true").lower() == "true",
        "enable_anomaly_detection": (
            os.getenv("FEATURE_ANOMALY_DETECTION", "true").lower() == "true"
        ),
        "enable_forecasting": os.getenv("FEATURE_FORECASTING", "true").lower() == "true",
        "enable_graph_analysis": os.getenv("FEATURE_GRAPH_ANALYSIS", "true").lower() == "true",
        "enable_self_healing": os.getenv("FEATURE_SELF_HEALING", "true").lower() == "true",
        "enable_auto_improve": os.getenv("FEATURE_AUTO_IMPROVE", "true").lower() == "true",
        "enable_audit_logging": os.getenv("FEATURE_AUDIT_LOGGING", "true").lower() == "true",
        "enable_cache": os.getenv("FEATURE_CACHE", "true").lower() == "true",
        "enable_rate_limiting": os.getenv("FEATURE_RATE_LIMITING", "true").lower() == "true"
    })
    
    def __post_init__(self):
        """Post-initialization setup"""
        # Environment-specific overrides
        if self.environment == Environment.PRODUCTION:
            self.debug = False
            self.api.debug = False
            self.api.reload = False
            self.monitoring.log_level = "INFO"
        elif self.environment == Environment.DEVELOPMENT:
            self.debug = True
            self.api.debug = True
            self.api.reload = True
            self.monitoring.log_level = "DEBUG"
        elif self.environment == Environment.TESTING:
            self.debug = True
            self.database.database = "predator_nexus_test"
            self.redis.db = 1
    
    @property
    def is_production(self) -> bool:
        return self.environment == Environment.PRODUCTION
    
    @property
    def is_development(self) -> bool:
        return self.environment == Environment.DEVELOPMENT
    
    @property
    def is_testing(self) -> bool:
        return self.environment == Environment.TESTING
    
    def get_feature(self, feature_name: str, default: bool = False) -> bool:
        """Get feature flag value"""
        return self.features.get(feature_name, default)
    
    def to_dict(self) -> dict[str, any]:
        """Convert config to dictionary"""
        return {
            "environment": self.environment.value,
            "debug": self.debug,
            "database": {
                "host": self.database.host,
                "port": self.database.port,
                "database": self.database.database,
                "pool_size": self.database.pool_size
            },
            "api": {
                "host": self.api.host,
                "port": self.api.port,
                "workers": self.api.workers
            },
            "features": self.features,
            "monitoring": {
                "log_level": self.monitoring.log_level,
                "prometheus_enabled": self.monitoring.prometheus_enabled
            }
        }

# Global config instance
config = Config()

# Environment-specific configurations
PRODUCTION_CONFIG = {
    "database": {
        "pool_size": 50,
        "max_overflow": 100
    },
    "api": {
        "workers": 4,
        "debug": False
    },
    "celery": {
        "worker_prefetch_multiplier": 4,
        "worker_max_tasks_per_child": 5000
    }
}

DEVELOPMENT_CONFIG = {
    "database": {
        "pool_size": 5,
        "max_overflow": 10
    },
    "api": {
        "workers": 1,
        "debug": True,
        "reload": True
    },
    "celery": {
        "worker_prefetch_multiplier": 1,
        "worker_max_tasks_per_child": 100
    }
}

def get_config() -> Config:
    """Get the global configuration instance"""
    return config

def update_config_from_env():
    """Update configuration from environment variables"""
    global config
    config = Config()
    return config
