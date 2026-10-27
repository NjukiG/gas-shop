# ScentCity , Portfolio Project Summaries

Copy whichever fits the context. Tech stack: Go (Gin, GORM), React (Vite,
Tailwind), PostgreSQL, AWS (EKS, RDS, S3, CloudFront, ECR, Secrets Manager,
Bedrock), Terraform, GitHub Actions, Stripe.

---

## Short (project card / tile , 2 sentences)
ScentCity is a cloud-native fragrance e-commerce platform , a Go API and React
storefront deployed on AWS EKS with Terraform, keyless CI/CD, and an AI
scent-finder powered by Amazon Bedrock. It covers the full shopping journey
(catalog, cart, Stripe checkout, order fulfilment, admin) on a secure,
reproducible AWS foundation.

---

## Medium (top of a project page)
**ScentCity , Cloud-Native Fragrance E-Commerce**

ScentCity is a full-stack online perfume store built to demonstrate
production-grade cloud architecture end to end. The Go (Gin + GORM) API runs on
Amazon EKS behind an Application Load Balancer, backed by RDS PostgreSQL in
private subnets; the React SPA is served globally via S3 + CloudFront.
Everything , VPC, cluster, database, registry, secrets , is provisioned with
Terraform, and container images ship through a keyless GitHub Actions → OIDC →
ECR pipeline. Security was a first-class concern: pods use IRSA for scoped,
credential-free access to AWS Secrets Manager, the database is locked to the
cluster's security group, and Stripe payments are verified server-side. The
standout feature is an AI scent-finder , users describe the vibe they want and
Amazon Bedrock recommends fragrances grounded on the real catalog.

---

## Longer (narrative hook , page intro)
**ScentCity , From a Broken Side Project to a Production-Grade Store on Kubernetes**

ScentCity started as an abandoned full-stack project with a dead database. I
rebuilt it from the ground up , hardening the Go backend, pivoting it into a
men's fragrance store with a modern UI, and deploying it on AWS as a
cloud-native application. It runs a React SPA on S3/CloudFront and a Go API on
Amazon EKS (behind an ALB, talking to RDS PostgreSQL in private subnets), with
the entire stack defined in Terraform. CI/CD is fully keyless (GitHub OIDC
federation), and pods authenticate to AWS via IRSA , no static credentials
anywhere. It includes Stripe payments with server-side verification, a full
admin panel, and an Amazon Bedrock-powered AI recommendation engine. Just as
valuable as the build was the debugging: diagnosing region-restriction SCPs,
GitHub's immutable OIDC subject format, and HTTPS mixed-content issues , the
real, unglamorous work of shipping to the cloud.

---

## Resume entry (title + 3 bullets)
**ScentCity , Cloud-Native E-Commerce Platform** | Go, React, AWS EKS, Terraform, PostgreSQL
- Built and deployed a full-stack store on Amazon EKS with RDS PostgreSQL, an
  ALB ingress, and a React SPA on S3/CloudFront, provisioned end-to-end with Terraform.
- Implemented keyless CI/CD (GitHub Actions → OIDC → ECR) and IRSA for pod-level
  least-privilege access to Secrets Manager , no static credentials.
- Integrated Stripe payments with server-side verification and an AI scent-finder
  using Amazon Bedrock, grounded on the live product catalog.
