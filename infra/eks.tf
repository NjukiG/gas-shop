# eks.tf
# The EKS cluster (managed control plane) plus a managed node group of EC2
# worker nodes. Uses the official terraform-aws-modules/eks module, which also
# wires up all the required IAM roles, security groups, and the OIDC provider
# needed for IRSA (pod-level AWS permissions) later.

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${local.name}-eks"
  cluster_version = "1.31"

  # Place the cluster in our VPC. The control plane ENIs and the worker nodes
  # go in the PRIVATE subnets (nodes should never be directly internet-facing).
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Make the Kubernetes API endpoint reachable from the internet so YOU can run
  # kubectl from your laptop. (It is still auth-protected by IAM + certs.)
  # In a stricter production setup this might be private-only via a VPN/bastion.
  cluster_endpoint_public_access = true

  # Grant the IAM identity that runs `terraform apply` (you) cluster-admin
  # access automatically, so kubectl works right after creation.
  enable_cluster_creator_admin_permissions = true

  # This account's SCP denies iam:CreateOpenIDConnectProvider, so we cannot use
  # IRSA (pod-level IAM via OIDC). Disable the OIDC provider accordingly and use
  # native Kubernetes Secrets for app config instead of AWS Secrets Manager.
  enable_irsa = false

  # Core add-ons the cluster needs (networking + DNS). We omit the EBS CSI
  # driver because (a) our app is stateless (data lives in RDS, not in-cluster
  # volumes) and (b) it depends on IRSA, which is disabled above.
  cluster_addons = {
    coredns    = {}
    kube-proxy = {}
    vpc-cni    = {}
  }

  # Managed node group: the EC2 worker machines where our pods run.
  eks_managed_node_groups = {
    default = {
      instance_types = ["t3.small"]

      min_size     = 1
      max_size     = 3
      desired_size = 2

      # Nodes get their own disk; 20GB is plenty for our images.
      disk_size = 20
    }
  }
}
