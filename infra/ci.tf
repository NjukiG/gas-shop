# ci.tf
# GitHub Actions CI authentication to AWS via keyless OIDC federation.
# AWS IAM trusts GitHub's OIDC provider, and a scoped role lets ONLY our repo's
# workflows assume it to push images to the backend ECR repository. No
# long-lived access keys are stored in GitHub.

variable "github_repo" {
  description = "GitHub repo (owner/name) allowed to assume the CI role."
  type        = string
  default     = "NjukiG/scentcity"
}

# Fetch GitHub's OIDC issuer TLS certificate so we use the CURRENT thumbprint
# rather than a hardcoded (potentially stale) value.
data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

# The IAM OIDC provider for GitHub Actions.
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github.certificates[0].sha1_fingerprint]
}

# Trust policy: allow AssumeRoleWithWebIdentity only when the token is from
# GitHub's provider, audience is sts, and the repo matches ours (any branch).
data "aws_iam_policy_document" "github_ci_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Scope to our repository. NOTE: this account's GitHub OIDC uses the newer
    # "immutable" subject format that appends numeric owner/repo IDs, e.g.
    # repo:NjukiG@91128064/scentcity@<id>:ref:refs/heads/main — so we match
    # with wildcards around the owner and repo names to tolerate those IDs.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:NjukiG*/scentcity*:*"]
    }
  }
}

resource "aws_iam_role" "github_ci" {
  name               = "${local.name}-github-ci"
  assume_role_policy = data.aws_iam_policy_document.github_ci_assume.json
}

# Permissions: ECR login (account-wide, required) + push/pull to ONLY the
# backend repository.
data "aws_iam_policy_document" "github_ci_ecr" {
  statement {
    sid       = "ECRAuthToken"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "ECRPushPull"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
    ]
    resources = [aws_ecr_repository.backend.arn]
  }
}

resource "aws_iam_role_policy" "github_ci_ecr" {
  name   = "${local.name}-github-ci-ecr"
  role   = aws_iam_role.github_ci.id
  policy = data.aws_iam_policy_document.github_ci_ecr.json
}
