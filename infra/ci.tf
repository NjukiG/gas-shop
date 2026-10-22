# ci.tf
# GitHub Actions CI authentication to AWS.
#
# Best practice: keyless OIDC federation (no long-lived access keys stored in
# GitHub). AWS IAM trusts GitHub's OIDC provider, and a scoped IAM role lets
# only our repo's workflows assume it to push images to the backend ECR repo.
#
# (Filled in during the GitHub-OIDC step.)
