# ci.tf
# GitHub Actions CI authentication to AWS via keyless OIDC federation.
# AWS IAM trusts GitHub's OIDC provider, and a scoped role lets ONLY our repo's
# workflows assume it to push images to the backend ECR repository. No
# long-lived access keys are stored in GitHub.

variable "github_repo" {
  description = "GitHub repo (owner/name) allowed to assume the CI role."
  type        = string
  default     = "NjukiG/gas-shop"
}

# The IAM OIDC provider for GitHub Actions. The thumbprint is GitHub's well-known
# intermediate CA thumbprint (AWS also verifies it automatically for this issuer).
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
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

    # Lock to our repository (any branch/ref). Could tighten to a branch, e.g.
    # "repo:NjukiG/gas-shop:ref:refs/heads/main".
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:*"]
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
