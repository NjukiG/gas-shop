# variables.tf
# Input variables let us avoid hardcoding values and reuse them across files.
# Defaults are set so we don't have to pass them every time, but they can be
# overridden (e.g. in a .tfvars file or via -var flags).

variable "region" {
  description = "AWS region. Our account's SCP restricts us to eu-north-1."
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Deployment environment name (used in tags and resource names)."
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Short name used as a prefix for resource names."
  type        = string
  default     = "scentcity"
}
