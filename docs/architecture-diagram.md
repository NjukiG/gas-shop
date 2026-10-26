# ScentCity , draw.io Architecture Diagram Spec

Build this in [draw.io](https://draw.io) using the **AWS 2023** shape library
(More Shapes → check "AWS 2023" → Apply). Below is exactly what to place, how
to group it, and how the arrows flow.

---

## Canvas layout (left → right data flow)

```
[ User ]  →  [ CloudFront ]  →  ┌─ (static) → S3 bucket (SPA)
                                └─ (/public/*, /protected/*) → ALB → EKS pods → RDS
```

Lay it out in three horizontal bands: **Users (left)**, **Edge/CDN (middle-left)**,
**VPC (right, large box)**.

---

## Elements to place (with the AWS icon to use)

### Outside the VPC
1. **User / Client** , use the "Users" or "Client" icon. Label: `Shopper / Admin (browser)`.
2. **Amazon CloudFront** , CloudFront icon. Label: `CloudFront (HTTPS, CDN)`.
   - Note under it: `2 origins: S3 (default) + ALB (/public/*, /protected/*)`.
3. **Amazon S3** , S3 bucket icon. Label: `S3 (private) , React SPA`.
   - Dotted line from CloudFront → S3 labeled `OAC (Origin Access Control)`.
4. **Amazon ECR** , ECR icon (place top-right, outside VPC). Label: `ECR , backend image`.
5. **AWS Secrets Manager** , Secrets Manager icon. Label: `Secrets Manager (app secret + RDS password)`.
6. **Amazon Bedrock** , Bedrock icon. Label: `Bedrock , Nova Lite (AI scent finder)`.

### The VPC (one large container box labeled `VPC 10.0.0.0/16 , eu-north-1`)
Inside it, two labeled sub-lanes (containers):

**Public subnets (2 AZs)** , lane labeled `Public subnets (AZ-a, AZ-b)`:
7. **Application Load Balancer (ALB)** , ELB/ALB icon. Label: `ALB (internet-facing)`.
8. **NAT Gateway** , NAT Gateway icon. Label: `NAT Gateway`.
9. **Internet Gateway** , IGW icon, place on the VPC boundary. Label: `Internet Gateway`.

**Private subnets (2 AZs)** , lane labeled `Private subnets (AZ-a, AZ-b)`:
10. **Amazon EKS** , EKS icon as a container box labeled `EKS cluster (scentcity-dev-eks)`.
    Inside the EKS box, place:
    - **Pods** , 2 generic pod/container icons labeled `backend pods (Go API) ×2`.
    - A small **ServiceAccount** note: `SA: backend (IRSA role)`.
    - **AWS Load Balancer Controller** , small box labeled `ALB Controller (manages ALB)`.
11. **Amazon RDS** , RDS icon. Label: `RDS PostgreSQL (db.t3.micro, private)`.
12. **EC2** , 2 EC2 instance icons labeled `Worker nodes (t3.small) ×2` (the EKS nodes live in private subnets).

### CI/CD (bottom band, outside AWS)
13. **GitHub** , GitHub icon. Label: `GitHub repo (NjukiG/gas-shop)`.
14. **GitHub Actions** , Actions icon. Label: `GitHub Actions (build image)`.

---

## Arrows (and their labels)

| From | To | Label |
|------|-----|-------|
| User | CloudFront | `HTTPS` |
| CloudFront | S3 | `static SPA (OAC)` |
| CloudFront | ALB | `/public/* , /protected/* (API)` |
| Internet Gateway | ALB | `inbound` |
| ALB | EKS pods | `routes to Service → pods` |
| EKS pods | RDS | `SQL (5432, private SG)` |
| EKS pods | Secrets Manager | `read secrets (IRSA)` |
| EKS pods | Bedrock | `InvokeModel (IRSA)` |
| EKS pods (via NAT) | Internet | `outbound (Stripe, image pulls)` |
| GitHub Actions | ECR | `push image (OIDC, keyless)` |
| EKS nodes | ECR | `pull image` |
| Terraform (small note/icon) | VPC | `provisions all infra (IaC)` |

---

## Styling tips
- Color the **VPC box** a light blue tint; **public subnets** green tint; **private subnets** grey tint (AWS convention).
- Use **dotted lines** for "identity/permission" relationships (IRSA → Secrets Manager, IRSA → Bedrock, OIDC → ECR) to distinguish them from data-flow (solid lines).
- Add a small legend: solid = data flow, dotted = IAM/identity.
- Put a title block: **"ScentCity , Cloud-Native Fragrance E-Commerce on AWS EKS"**.

---

## Optional "callout" badges (nice for the article)
Add small star/callout icons on:
- CloudFront → ALB arrow: `No custom domain needed , API fronted through CloudFront (HTTPS, same-origin)`.
- IRSA arrows: `Keyless , pods assume IAM roles via OIDC`.
- GitHub Actions → ECR: `Keyless CI , GitHub OIDC federation`.
