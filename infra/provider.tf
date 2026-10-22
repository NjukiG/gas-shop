# provider.tf
# Configures the AWS provider: which region to operate in, and default tags
# applied to every resource we create (great for cost tracking and cleanup).

provider "aws" {
  region = var.region

  # Tags attached automatically to every taggable resource. These make it easy
  # to find/filter all ScentCity resources in the console and in billing.
  default_tags {
    tags = {
      Project     = "ScentCity"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}
