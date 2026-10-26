# ScentCity , Medium Article Outline

Working title ideas:
- "From a Broken Side Project to a Cloud-Native Store on EKS: Deploying a Full-Stack App the Hard (Right) Way"
- "Shipping to Kubernetes for the First Time: What the Tutorials Don't Tell You"
- "I Rebuilt My Old Project on AWS EKS , Here's Everything That Broke (and How I Fixed It)"

Target length: 2,000-3,000 words. Audience: developers/early cloud engineers.
Tone: honest, practical, "here's what actually happened."

---

## 1. Hook / Intro (short)
- The premise: an old, half-broken "gas shop" project from before you used an AI assistant. You dusted it off to (a) make it production-grade and (b) showcase real cloud skills (AWS SA Pro / DevOps / Security + CKAD/Terraform/Bedrock).
- The twist: pivoted it into **ScentCity**, a men's fragrance store, because it gives a better UI and a natural home for an **AI feature**.
- One-line of what you shipped: React SPA + Go API, on **EKS + RDS + CloudFront**, with **keyless CI/CD**, **IRSA**, **Terraform IaC**, **Stripe payments**, and an **AI scent-finder on Amazon Bedrock**.
- Promise: this article is the honest version , including the obscure failures.

## 2. The Starting Point (brief)
- What the app was: Go/Gin + GORM + Postgres backend, React/Vite frontend, dead Appwrite DB.
- The decision: monorepo, hardening first, then pivot, then cloud. (Mention: preserved git history via `git subtree` merge.)

## 3. Hardening the Backend (skim , 1-2 paragraphs)
- Config package (env-based, `.env` optional so it runs in the cloud), hardened DB connection, fixed real bugs (broken order routes, a GORM foreign-key model bug that silently broke carts), standardized API responses, wired up admin role guards, stopped leaking password hashes.
- Lesson: "making it correct and secure before making it cloud-native" , don't deploy broken endpoints.

## 4. The Pivot to ScentCity (brief)
- Rebrand + fragrance data model (Brand, Size, Concentration, ScentNotes).
- A design system for consistency (dark/platinum theme, Space Grotesk/Inter).
- Stripe test-mode payments with **server-side verification** (never trust the client that payment happened).

## 5. The Architecture (use the diagram here)
- Walk the diagram: SPA on S3/CloudFront, Go API on EKS behind an ALB, RDS in private subnets, secrets in Secrets Manager, images in ECR.
- **Key SA decision to highlight:** chose standard **RDS PostgreSQL** over Aurora , cost-conscious at this scale, with a note on when Aurora would win. (Shows judgment.)
- **Frontend on S3, not EKS:** static files don't need a server/cluster. Right-sizing.

## 6. Infrastructure as Code with Terraform (core)
- Remote state in S3 with native locking (`use_lockfile`), why state matters, why it's gitignored.
- Built it in layers: VPC → EKS → ECR → RDS → secrets → IRSA → CI → frontend.
- The "destroy when done" discipline to protect a small credit budget (~$5/day running). IaC makes teardown one command.

## 7. The War Stories (THE BEST PART , lead with these)
These are what make the article worth reading. Each: the symptom, the diagnosis, the fix, the lesson.

1. **The region-restriction SCP.** Admin IAM but `AccessDenied` on everything with "explicit deny in a service control policy." Turned out the (new AWS free-plan) account was SCP-locked to **eu-north-1**; console worked (that region) but CLI defaulted to us-east-1. Lesson: *SCP explicit-deny beats IAM allow; when admin still gets denied, suspect an org SCP, and check your region.*

2. **The IRSA/OIDC block , then the upgrade that unlocked it.** Free-plan SCP initially blocked `iam:CreateOpenIDConnectProvider` (needed for IRSA). Discussed the Kubernetes-Secrets workaround, then upgrading the account to pay-as-you-go lifted the restriction. Lesson: *know the fallback (K8s Secrets / node role) AND the ideal (IRSA); understand when each is warranted.*

3. **GitHub Actions OIDC , the immutable subject format.** Keyless CI kept failing `sts:AssumeRoleWithWebIdentity` even though the trust policy looked textbook. Diagnosed by **decoding the OIDC token's `sub` claim** in a debug workflow step , it was `repo:NjukiG@91128064/gas-shop@1422134104:...` (GitHub's newer *immutable* subject with numeric IDs). Fixed the trust condition with wildcards. Lesson: *when OIDC trust fails, read the actual token claim; don't assume the standard format.*

4. **The HTTPS mixed-content wall (no domain, no money).** CloudFront serves the SPA over HTTPS, but the ALB was HTTP-only , browsers block HTTPS→HTTP calls, and you can't get an ACM cert without owning a domain. Fix: **front the API through CloudFront** as a second origin (`/public/*`, `/protected/*` → ALB), giving HTTPS everywhere and same-origin (CORS disappears) , for free. Lesson: *a CDN can proxy your API, not just static files; elegant when you have no domain.*

5. **(Smaller) Secrets Manager recovery window** blocking recreate after destroy (fixed with `recovery_window_in_days = 0` for dev); **add-on vs. its k8s objects** (removing an EKS add-on in Terraform left orphaned crash-looping pods); **ALB created by k8s, not Terraform** (must `kubectl delete ingress` before `terraform destroy` or it blocks VPC deletion).

## 8. Security Choices (your Security Specialty shines)
- IRSA: pods assume scoped IAM roles via OIDC , keyless, per-ServiceAccount least privilege.
- Secrets in Secrets Manager (DB password auto-managed by RDS, never in Terraform state), read by pods at startup , not base64 in K8s etcd.
- Keyless GitHub→AWS CI (OIDC federation), scoped to one ECR repo.
- RDS in private subnets, security-group-locked to the EKS nodes only.
- Server-side payment verification with Stripe.
- Non-root containers, `.dockerignore` keeps secrets out of images, image scan-on-push.

## 9. The AI Scent-Finder (Bedrock)
- The feature: user describes a vibe → AI recommends from the *real* catalog.
- The design: **grounding via in-context data** , pull products from the DB, put the whole catalog in the prompt, instruct "recommend ONLY from this list." Used Bedrock's **Converse API** (model-agnostic) with **Nova Lite**.
- **The honest scaling note:** at 13 products you just stuff the catalog in the prompt. At 50k you'd need **RAG + a vector store** (pgvector/OpenSearch) to retrieve the relevant subset first. (Shows you know both.)
- Cost control: 500-char input cap, 500 max output tokens.

## 10. What I'd Do Next (shows forward thinking)
- Custom domain + ACM TLS; ArgoCD for GitOps; move the LB controller + k8s manifests into Terraform (or Helm) for one-command bring-up; secure HttpOnly-cookie auth + CSRF; staging environment; observability (CloudWatch dashboards, X-Ray).

## 11. Takeaways (close)
- "Tutorials show the happy path; real deployments are 50% diagnosing weird failures."
- The value of IaC: reproducible, destroyable, reviewable.
- Right-sizing > over-engineering (RDS not Aurora, S3 not EKS for the SPA, prompt-grounding not RAG).
- Link to the repo + the live demo (when redeployed).

---

## Assets to include
- The architecture diagram (see architecture-diagram.md).
- 2-3 screenshots: the storefront, the admin panel, the AI scent-finder returning real recommendations.
- A snippet of the OIDC `sub` debug output (the "aha" moment).
- The Terraform `destroy` output / cost discipline note.
