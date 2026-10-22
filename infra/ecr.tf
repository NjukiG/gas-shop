# ecr.tf
# Private container registry for the backend image. GitHub Actions pushes
# images here; EKS worker nodes pull from here to run the pods.

resource "aws_ecr_repository" "backend" {
  name = "${local.name}-backend"

  # Scan images for known vulnerabilities on push (free, good security hygiene).
  image_scanning_configuration {
    scan_on_push = true
  }

  # IMMUTABLE would forbid overwriting a tag; MUTABLE lets us re-push :latest
  # during development. Fine for now.
  image_tag_mutability = "MUTABLE"

  # Allow `terraform destroy` to delete the repo even if it still holds images.
  force_delete = true
}

# A lifecycle policy to automatically expire old untagged images so the repo
# doesn't accumulate junk (and storage cost) over time.
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}
