variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "db_username" {
  description = "PostgreSQL username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Main domain for the application"
  type        = string
  default     = "predator-analytics.io"
}

variable "api_domain" {
  description = "API domain"
  type        = string
  default     = "api.predator-analytics.io"
}

variable "enable_monitoring" {
  description = "Enable Prometheus/Grafana monitoring"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}
