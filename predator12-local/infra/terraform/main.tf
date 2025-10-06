terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.9.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14.0"
    }
  }
  
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
  }
}

provider "kubectl" {
  config_path = var.kubeconfig_path
}

# Ресурси для ArgoCD
resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

# Ресурси для cert-manager
resource "kubernetes_namespace" "cert_manager" {
  metadata {
    name = "cert-manager"
  }
}

# Ресурси для моніторингу
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

# Ресурси для Predator платформи
resource "kubernetes_namespace" "predator" {
  metadata {
    name = "predator"
  }
}

# Секрети для PostgreSQL
resource "kubernetes_secret" "postgresql_secrets" {
  metadata {
    name      = "postgresql-secrets"
    namespace = kubernetes_namespace.predator.metadata[0].name
  }

  data = {
    "password"          = var.postgresql_password
    "postgres-password" = var.postgresql_admin_password
  }

  type = "Opaque"
}

# Секрети для MinIO
resource "kubernetes_secret" "minio_secrets" {
  metadata {
    name      = "minio-secrets"
    namespace = kubernetes_namespace.predator.metadata[0].name
  }

  data = {
    "root-user"     = var.minio_root_user
    "root-password" = var.minio_root_password
  }

  type = "Opaque"
}

# Секрети для Qdrant
resource "kubernetes_secret" "qdrant_secrets" {
  metadata {
    name      = "qdrant-secrets"
    namespace = kubernetes_namespace.predator.metadata[0].name
  }

  data = {
    "api-key" = var.qdrant_api_key
  }

  type = "Opaque"
}

# ==== Helm Releases ====

# 1. ArgoCD Release
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "5.34.6"
  namespace  = kubernetes_namespace.argocd.metadata[0].name

  set {
    name  = "server.service.type"
    value = "ClusterIP"
  }

  depends_on = [kubernetes_namespace.argocd]
}

# 2. Cert-Manager Release
resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "v1.12.0"
  namespace  = kubernetes_namespace.cert_manager.metadata[0].name

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [kubernetes_namespace.cert_manager]
}

# 3. Prometheus Stack Release
resource "helm_release" "prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "45.27.2"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  depends_on = [kubernetes_namespace.monitoring]
}

# 4. Loki Stack Release
resource "helm_release" "loki_stack" {
  name       = "loki-stack"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki-stack"
  version    = "2.9.10"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  set {
    name  = "grafana.enabled"
    value = "false"  # Використовуємо Grafana з Prometheus Stack
  }

  depends_on = [kubernetes_namespace.monitoring]
}

# 5. Jaeger Release
resource "helm_release" "jaeger" {
  name       = "jaeger"
  repository = "https://jaegertracing.github.io/helm-charts"
  chart      = "jaeger"
  version    = "0.71.1"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  depends_on = [kubernetes_namespace.monitoring]
}

# ==== Predator Platform Components ====

# 6. PostgreSQL
resource "helm_release" "postgresql" {
  name       = "postgresql"
  chart      = "../helm/postgresql"
  namespace  = kubernetes_namespace.predator.metadata[0].name
  
  set_sensitive {
    name  = "password"
    value = var.postgresql_password
  }

  set_sensitive {
    name  = "postgresPassword"
    value = var.postgresql_admin_password
  }

  depends_on = [
    kubernetes_namespace.predator,
    kubernetes_secret.postgresql_secrets
  ]
}

# 7. Qdrant
resource "helm_release" "qdrant" {
  name       = "qdrant"
  chart      = "../helm/qdrant"
  namespace  = kubernetes_namespace.predator.metadata[0].name
  
  set_sensitive {
    name  = "apiKey"
    value = var.qdrant_api_key
  }

  depends_on = [
    kubernetes_namespace.predator,
    kubernetes_secret.qdrant_secrets
  ]
}

# 8. MinIO
resource "helm_release" "minio" {
  name       = "minio"
  chart      = "../helm/minio"
  namespace  = kubernetes_namespace.predator.metadata[0].name
  
  set_sensitive {
    name  = "rootUser"
    value = var.minio_root_user
  }
  
  set_sensitive {
    name  = "rootPassword"
    value = var.minio_root_password
  }

  depends_on = [
    kubernetes_namespace.predator,
    kubernetes_secret.minio_secrets
  ]
}

# 9. Redis
resource "helm_release" "redis" {
  name       = "redis"
  chart      = "../helm/redis"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [kubernetes_namespace.predator]
}

# 10. Ollama
resource "helm_release" "ollama" {
  name       = "ollama"
  chart      = "../helm/ollama"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [kubernetes_namespace.predator]
}

# 11. MLflow
resource "helm_release" "mlflow" {
  name       = "mlflow"
  chart      = "../helm/mlflow"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.postgresql,
    helm_release.minio
  ]
}

# 12. Vault
resource "helm_release" "vault" {
  name       = "vault"
  chart      = "../helm/vault"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [kubernetes_namespace.predator]
}

# 13. Keycloak
resource "helm_release" "keycloak" {
  name       = "keycloak"
  chart      = "../helm/keycloak"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.postgresql
  ]
}

# 14. FastAPI Backend
resource "helm_release" "fastapi_backend" {
  name       = "fastapi-backend"
  chart      = "../helm/fastapi-backend"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.postgresql,
    helm_release.redis,
    helm_release.qdrant,
    helm_release.minio
  ]
}

# 15. Celery Worker
resource "helm_release" "celery_worker" {
  name       = "celery-worker"
  chart      = "../helm/celery-worker"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.redis,
    helm_release.postgresql
  ]
}

# 16. Kafka
resource "helm_release" "kafka" {
  name       = "kafka"
  chart      = "../helm/kafka"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.zookeeper
  ]
}

# 17. Zookeeper
resource "helm_release" "zookeeper" {
  name       = "zookeeper"
  chart      = "../helm/zookeeper"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [kubernetes_namespace.predator]
}

# 18. OpenSearch
resource "helm_release" "opensearch" {
  name       = "opensearch"
  chart      = "../helm/opensearch"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [kubernetes_namespace.predator]
}

# 19. OpenSearch Dashboards
resource "helm_release" "opensearch_dashboards" {
  name       = "opensearch-dashboards"
  chart      = "../helm/opensearch-dashboards"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.opensearch
  ]
}

# 20. Grafana (додаткова для Predator, основна йде з Prometheus Stack)
resource "helm_release" "grafana" {
  name       = "grafana"
  chart      = "../helm/grafana"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [kubernetes_namespace.predator]
}

# 21. API Gateway
resource "helm_release" "api_gateway" {
  name       = "api-gateway"
  chart      = "../helm/api-gateway"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.fastapi_backend
  ]
}

# 22. Agent Orchestrator
resource "helm_release" "agent_orchestrator" {
  name       = "agent-orchestrator"
  chart      = "../helm/agent-orchestrator"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.redis,
    helm_release.postgresql
  ]
}

# 23. Dataset Generator
resource "helm_release" "dataset_generator" {
  name       = "dataset-generator"
  chart      = "../helm/dataset-generator"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.minio,
    helm_release.postgresql
  ]
}

# 24. LoRA Trainer
resource "helm_release" "lora_trainer" {
  name       = "lora-trainer"
  chart      = "../helm/lora-trainer"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.minio,
    helm_release.mlflow
  ]
}

# 25. Monitoring Agent
resource "helm_release" "monitoring_agent" {
  name       = "monitoring-agent"
  chart      = "../helm/monitoring-agent"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.prometheus_stack
  ]
}

# 26. Predator (основний компонент)
resource "helm_release" "predator" {
  name       = "predator"
  chart      = "../helm/predator"
  namespace  = kubernetes_namespace.predator.metadata[0].name

  depends_on = [
    kubernetes_namespace.predator,
    helm_release.postgresql,
    helm_release.redis,
    helm_release.qdrant,
    helm_release.minio,
    helm_release.fastapi_backend,
    helm_release.celery_worker
  ]
}
