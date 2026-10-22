# secrets.tf
# The application's secret (JWT signing key, Stripe key, and the DB connection
# parts WITHOUT the password), plus the IRSA role the backend pod assumes to
# read this secret and the RDS-managed password secret at runtime.

# A freshly generated JWT signing secret (never reuse the old leaked one).
resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

# The app secret. Stores everything the app needs EXCEPT the DB password, which
# the app reads separately from the RDS-managed secret (no password duplication).
resource "aws_secretsmanager_secret" "app" {
  name        = "${local.name}-app"
  description = "ScentCity backend application config"
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    SECRET            = random_password.jwt_secret.result
    STRIPE_SECRET_KEY = var.stripe_secret_key
    DB_HOST           = aws_db_instance.main.address
    DB_PORT           = "5432"
    DB_USER           = aws_db_instance.main.username
    DB_NAME           = aws_db_instance.main.db_name
    ALLOWED_ORIGINS   = "*" # tightened later once we have the real frontend URL
  })
}

# --- IRSA role: the identity the backend pod assumes ---

# Trust policy: allow AssumeRoleWithWebIdentity ONLY when the caller's OIDC
# token comes from our cluster's provider AND the Kubernetes ServiceAccount is
# exactly <namespace>:<serviceaccount>. This is what scopes the role to ONE pod.
data "aws_iam_policy_document" "backend_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]
    }

    # The token's audience must be AWS STS.
    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:aud"
      values   = ["sts.amazonaws.com"]
    }

    # The token's subject must be our specific namespace:serviceaccount.
    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:sub"
      values   = ["system:serviceaccount:${var.k8s_namespace}:${var.k8s_service_account}"]
    }
  }
}

resource "aws_iam_role" "backend" {
  name               = "${local.name}-backend-irsa"
  assume_role_policy = data.aws_iam_policy_document.backend_assume.json
}

# Permission policy: read ONLY our app secret and the RDS-managed password
# secret. Nothing else in Secrets Manager.
data "aws_iam_policy_document" "backend_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      aws_secretsmanager_secret.app.arn,
      aws_db_instance.main.master_user_secret[0].secret_arn,
    ]
  }
}

resource "aws_iam_role_policy" "backend_secrets" {
  name   = "${local.name}-backend-secrets"
  role   = aws_iam_role.backend.id
  policy = data.aws_iam_policy_document.backend_secrets.json
}
