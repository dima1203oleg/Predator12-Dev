/**
 * Predator Analytics Infrastructure
 * Terraform Configuration for Kubernetes Cluster
 */

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket = "predator-analytics-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

# Local variables
locals {
  project_name = "predator-analytics"
  environment  = var.environment

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}

# Kubernetes provider
provider "kubernetes" {
  config_path = var.kubeconfig_path
}

# Helm provider
provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
  }
}

# Create namespace
resource "kubernetes_namespace" "predator_analytics" {
  metadata {
    name = "${local.project_name}-${local.environment}"

    labels = merge(
      local.common_tags,
      {
        name = "${local.project_name}-${local.environment}"
      }
    )
  }
}

# Create secrets
resource "kubernetes_secret" "postgresql" {
  metadata {
    name      = "postgresql-secret"
    namespace = kubernetes_namespace.predator_analytics.metadata[0].name
  }

  data = {
    username = var.db_username
    password = var.db_password
  }

  type = "Opaque"
}

resource "kubernetes_secret" "redis" {
  metadata {
    name      = "redis-secret"
    namespace = kubernetes_namespace.predator_analytics.metadata[0].name
  }

  data = {
    password = random_password.redis_password.result
  }

  type = "Opaque"
}

resource "random_password" "redis_password" {
  length  = 32
  special = true
}

# Deploy Predator Analytics using Helm
resource "helm_release" "predator_analytics" {
  name       = local.project_name
  namespace  = kubernetes_namespace.predator_analytics.metadata[0].name
  chart      = "../helm/predator-analytics"

  values = [
    file("${path.module}/values-${local.environment}.yaml")
  ]

  set {
    name  = "global.environment"
    value = local.environment
  }

  set_sensitive {
    name  = "postgresql.auth.existingSecret"
    value = kubernetes_secret.postgresql.metadata[0].name
  }

  set_sensitive {
    name  = "redis.auth.existingSecret"
    value = kubernetes_secret.redis.metadata[0].name
  }

  depends_on = [
    kubernetes_namespace.predator_analytics,
    kubernetes_secret.postgresql,
    kubernetes_secret.redis
  ]
}

# Outputs
output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.predator_analytics.metadata[0].name
}

output "helm_release_status" {
  description = "Helm release status"
  value       = helm_release.predator_analytics.status
}
