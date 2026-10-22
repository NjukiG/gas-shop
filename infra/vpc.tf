# vpc.tf
# Network foundation. Uses the official terraform-aws-modules/vpc module to
# create the VPC, public + private subnets across 2 AZs, an internet gateway,
# and a single (cost-saving) NAT gateway.

# Pick the first two availability zones in the region automatically.
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  # Name prefix reused across resources, e.g. "scentcity-dev".
  name = "${var.project_name}-${var.environment}"

  # Use two AZs (EKS requires at least two). Take the first two available.
  azs = slice(data.aws_availability_zones.available.names, 0, 2)

  # The VPC's private IP range. /16 gives us 65k addresses to carve up.
  vpc_cidr = "10.0.0.0/16"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.name}-vpc"
  cidr = local.vpc_cidr
  azs  = local.azs

  # Private subnets (EKS nodes + RDS live here). One per AZ.
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  # Public subnets (ALB + NAT gateway live here). One per AZ.
  public_subnets = ["10.0.101.0/24", "10.0.102.0/24"]

  # A single NAT gateway shared by all private subnets (cheaper than one-per-AZ).
  # Production would set single_nat_gateway = false for per-AZ resilience.
  enable_nat_gateway = true
  single_nat_gateway = true

  # DNS support is required for EKS and for RDS private hostnames to resolve.
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Tags that EKS and the AWS Load Balancer Controller REQUIRE to discover
  # which subnets to use. Public subnets host internet-facing load balancers;
  # private subnets host internal ones. ("shared" lets the cluster use them.)
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}
