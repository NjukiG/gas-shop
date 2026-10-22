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
