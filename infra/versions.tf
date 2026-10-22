# versions.tf
# Declares which Terraform version and provider plugins this project needs,
# and where Terraform stores its state (the remote S3 backend).

terraform {
  # Require a reasonably modern Terraform.
  required_version = ">= 1.5"

  # Providers are plugins that let Terraform talk to a specific API.
  # We use the official AWS provider.
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # any 5.x version
    }
  }

  # Remote state backend: Terraform stores terraform.tfstate in this S3 bucket.
  # use_lockfile = true uses S3-native state locking (a lock file in the bucket),
  # the modern replacement for the old DynamoDB lock table.
  backend "s3" {
    bucket       = "scentcity-tfstate-642328612591"
    key          = "scentcity/terraform.tfstate" # path of the state file within the bucket
    region       = "eu-north-1"
    use_lockfile = true
    encrypt      = true
  }
}
