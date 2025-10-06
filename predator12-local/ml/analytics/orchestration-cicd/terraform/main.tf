terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.10"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.5"
    }
  }
  
  backend "s3" {
    bucket         = "predator-analytics-terraform-state"
    key            = "predator/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "predator-analytics-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "PredatorAnalytics"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# EKS Cluster Configuration
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 18.0"
  
  cluster_name    = "predator-analytics-${var.environment}"
  cluster_version = var.kubernetes_version
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  
  # Node groups configuration
  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 5
      
      instance_types = ["m5.large"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        role = "general"
      }
    }
    
    compute = {
      desired_size = 2
      min_size     = 1
      max_size     = 5
      
      instance_types = ["c5.2xlarge"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        role = "compute"
      }
      
      taints = [
        {
          key    = "workload"
          value  = "compute"
          effect = "NO_SCHEDULE"
        }
      ]
    }
    
    gpu = {
      desired_size = 1
      min_size     = 0
      max_size     = 3
      
      instance_types = ["g4dn.xlarge"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        role = "gpu"
      }
      
      taints = [
        {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }
  
  # Auth configuration
  manage_aws_auth_configmap = true
  aws_auth_roles = [
    {
      rolearn  = module.eks_admin_iam_role.iam_role_arn
      username = "admin"
      groups   = ["system:masters"]
    }
  ]
}

# VPC Configuration
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 3.14"
  
  name = "predator-analytics-vpc-${var.environment}"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  
  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "production"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  # VPC Flow Logs
  enable_flow_log                      = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role  = true
  flow_log_max_aggregation_interval    = 60
}

# RDS PostgreSQL Configuration
module "postgresql" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 4.4"
  
  identifier = "predator-analytics-${var.environment}"
  
  engine               = "postgres"
  engine_version       = "14.5"
  family               = "postgres14"
  major_engine_version = "14"
  instance_class       = var.db_instance_type
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  
  db_name  = "predator"
  username = "predator_admin"
  port     = 5432
  
  multi_az               = var.environment == "production"
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.database.id]
  
  maintenance_window              = "Mon:00:00-Mon:03:00"
  backup_window                   = "03:00-06:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  backup_retention_period = 7
  skip_final_snapshot     = true
  deletion_protection     = var.environment == "production"
  
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  create_monitoring_role                = true
  monitoring_interval                   = 60
  
  parameters = [
    {
      name  = "autovacuum"
      value = 1
    },
    {
      name  = "client_encoding"
      value = "utf8"
    }
  ]
}

# ElastiCache Redis Configuration
module "redis" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "~> 2.0"
  
  name = "predator-analytics-${var.environment}"
  
  engine         = "redis"
  engine_version = "6.x"
  port           = 6379
  
  num_cache_nodes    = var.environment == "production" ? 2 : 1
  node_type          = var.redis_instance_type
  
  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]
  
  apply_immediately          = true
  auto_minor_version_upgrade = true
  maintenance_window         = "Mon:03:00-Mon:05:00"
  
  snapshot_retention_limit = 7
  snapshot_window          = "05:00-07:00"
  
  parameter_group_name = aws_elasticache_parameter_group.redis.name
}

# S3 Bucket for Storage
module "s3_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.3"
  
  bucket = "predator-analytics-storage-${var.environment}"
  acl    = "private"
  
  versioning = {
    enabled = true
  }
  
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }
  
  lifecycle_rule = [
    {
      id      = "logs"
      enabled = true
      prefix  = "logs/"
      
      transition = [
        {
          days          = 30
          storage_class = "STANDARD_IA"
        },
        {
          days          = 90
          storage_class = "GLACIER"
        }
      ]
      
      expiration = {
        days = 365
      }
    }
  ]
}

# IAM Roles
module "eks_admin_iam_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.3"
  
  role_name = "predator-analytics-eks-admin-${var.environment}"
  
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:admin-sa"]
    }
  }
}

# Security Groups
resource "aws_security_group" "database" {
  name        = "predator-analytics-database-${var.environment}"
  description = "Security group for database access"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis" {
  name        = "predator-analytics-redis-${var.environment}"
  description = "Security group for Redis access"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    description     = "Redis from EKS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "predator-analytics-redis-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "redis" {
  name   = "predator-analytics-redis-${var.environment}"
  family = "redis6.x"
  
  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }
}

# Kubernetes Provider Configuration
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

# Helm Provider Configuration
provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

# ArgoCD Installation
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "4.9.7"
  namespace  = "argocd"
  
  create_namespace = true
  
  values = [
    file("${path.module}/argocd-values.yaml")
  ]
  
  depends_on = [
    module.eks
  ]
}

# Cert Manager Installation
resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "v1.9.1"
  namespace  = "cert-manager"
  
  create_namespace = true
  
  set {
    name  = "installCRDs"
    value = "true"
  }
  
  depends_on = [
    module.eks
  ]
}

# Prometheus Stack Installation
resource "helm_release" "prometheus_stack" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "41.5.0"
  namespace  = "monitoring"
  
  create_namespace = true
  
  values = [
    file("${path.module}/prometheus-values.yaml")
  ]
  
  depends_on = [
    module.eks
  ]
}
