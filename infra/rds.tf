# rds.tf
# Managed PostgreSQL (RDS) in the PRIVATE subnets. Reachable only from the EKS
# worker nodes (enforced by a security group), never from the internet.

# Subnet group: which subnets RDS may place the database in. Private only.
resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db-subnets"
  subnet_ids = module.vpc.private_subnets
}

# Security group (firewall) for the database.
resource "aws_security_group" "rds" {
  name        = "${local.name}-rds-sg"
  description = "Allow PostgreSQL from EKS nodes only"
  vpc_id      = module.vpc.vpc_id
}

# Inbound rule: allow PostgreSQL (5432) ONLY from the EKS node security group.
# Referencing the node SG (not a CIDR) means only the worker nodes can connect.
resource "aws_security_group_rule" "rds_from_eks_nodes" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = module.eks.node_security_group_id
  description              = "PostgreSQL from EKS worker nodes"
}

resource "aws_db_instance" "main" {
  identifier     = "${local.name}-db"
  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t3.micro"

  db_name  = "gasshop" # initial database name (no hyphen allowed here)
  username = "gasshop_admin"

  # Let RDS generate the master password and store it in Secrets Manager
  # automatically — the password is never in our Terraform code or state.
  manage_master_user_password = true

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Private only: no public IP.
  publicly_accessible = false

  # Dev-friendly settings (would differ in production).
  multi_az                = false # single AZ to save cost
  skip_final_snapshot     = true  # don't snapshot on destroy (dev)
  deletion_protection     = false # allow terraform destroy
  backup_retention_period = 1
}
