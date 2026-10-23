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

variable "stripe_secret_key" {
  description = "Stripe secret API key (test mode). Supplied via TF_VAR, never committed."
  type        = string
  sensitive   = true
}

variable "k8s_namespace" {
  description = "Kubernetes namespace the backend runs in."
  type        = string
  default     = "scentcity"
}

variable "k8s_service_account" {
  description = "Kubernetes ServiceAccount name the backend pod uses."
  type        = string
  default     = "backend"
}

variable "allowed_origins" {
  description = "CORS allowed origins for the backend (the frontend's URL)."
  type        = string
  default     = "https://dfd81xdzqvvar.cloudfront.net"
}
