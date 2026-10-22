# outputs.tf
# Values printed after apply and usable by other configs/tools. We expose the
# VPC and subnet IDs because EKS and RDS will need to reference them.

output "vpc_id" {
  description = "ID of the VPC."
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets (EKS nodes, RDS)."
  value       = module.vpc.private_subnets
}

output "public_subnet_ids" {
  description = "IDs of the public subnets (ALB, NAT)."
  value       = module.vpc.public_subnets
}

output "region" {
  description = "AWS region in use."
  value       = var.region
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster (used to configure kubectl)."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Kubernetes API endpoint."
  value       = module.eks.cluster_endpoint
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for the backend image (push/pull target)."
  value       = aws_ecr_repository.backend.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)."
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "RDS PostgreSQL hostname."
  value       = aws_db_instance.main.address
}

output "rds_master_secret_arn" {
  description = "ARN of the Secrets Manager secret holding the RDS master password."
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
}

output "app_secret_arn" {
  description = "ARN of the application secret (JWT, Stripe, DB connection)."
  value       = aws_secretsmanager_secret.app.arn
}

output "backend_irsa_role_arn" {
  description = "IAM role ARN the backend ServiceAccount assumes (annotate the SA with this)."
  value       = aws_iam_role.backend.arn
}


