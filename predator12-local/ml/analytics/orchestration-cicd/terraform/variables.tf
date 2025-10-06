variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.24"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "db_instance_type" {
  description = "Instance type for RDS PostgreSQL"
  type        = string
  default     = "db.t3.large"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS PostgreSQL (GB)"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS PostgreSQL (GB)"
  type        = number
  default     = 500
}

variable "redis_instance_type" {
  description = "Instance type for ElastiCache Redis"
  type        = string
  default     = "cache.t3.medium"
}

variable "eks_node_instance_types" {
  description = "Map of node group names to instance types"
  type        = map(list(string))
  default     = {
    general = ["m5.large"]
    compute = ["c5.2xlarge"]
    gpu     = ["g4dn.xlarge"]
  }
}

variable "eks_node_group_sizes" {
  description = "Map of node group names to desired, min, and max sizes"
  type        = map(object({
    desired_size = number
    min_size     = number
    max_size     = number
  }))
  default     = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 5
    }
    compute = {
      desired_size = 2
      min_size     = 1
      max_size     = 5
    }
    gpu = {
      desired_size = 1
      min_size     = 0
      max_size     = 3
    }
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "predator-analytics.com"
}

variable "enable_gpu_nodes" {
  description = "Whether to enable GPU nodes"
  type        = bool
  default     = true
}

variable "enable_autoscaling" {
  description = "Whether to enable cluster autoscaling"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {
    Project     = "PredatorAnalytics"
    ManagedBy   = "Terraform"
  }
}
