# lb_controller.tf
# IAM role (via IRSA) for the AWS Load Balancer Controller. The controller runs
# as a pod in kube-system and needs permission to create/manage ALBs, target
# groups, security groups, etc. We grant it those permissions scoped to its
# ServiceAccount (kube-system:aws-load-balancer-controller) via the cluster OIDC.
#
# The controller itself is installed separately with Helm (see docs/commands).

# The official IAM policy document for the controller, maintained by AWS, is
# fetched from its GitHub release so we always use the correct permissions.
data "http" "lb_controller_policy" {
  url = "https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.9.2/docs/install/iam_policy.json"
}

resource "aws_iam_policy" "lb_controller" {
  name   = "${local.name}-lb-controller"
  policy = data.http.lb_controller_policy.response_body
}

# IRSA role trusted by the controller's ServiceAccount.
data "aws_iam_policy_document" "lb_controller_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [module.eks.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${module.eks.oidc_provider}:sub"
      values   = ["system:serviceaccount:kube-system:aws-load-balancer-controller"]
    }
  }
}

resource "aws_iam_role" "lb_controller" {
  name               = "${local.name}-lb-controller-irsa"
  assume_role_policy = data.aws_iam_policy_document.lb_controller_assume.json
}

resource "aws_iam_role_policy_attachment" "lb_controller" {
  role       = aws_iam_role.lb_controller.name
  policy_arn = aws_iam_policy.lb_controller.arn
}
