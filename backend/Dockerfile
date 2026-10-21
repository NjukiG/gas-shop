# ---- Stage 1: build ----
# Use the full Go toolchain image to compile the app. This stage is large but
# it is thrown away; only the compiled binary is copied into the final image.
FROM golang:1.22-alpine AS builder

# Install git (some Go modules need it) and CA certs for fetching deps.
RUN apk add --no-cache git

WORKDIR /app

# Copy go.mod and go.sum first and download deps. Doing this BEFORE copying the
# rest of the source means Docker can cache this layer: if the source changes
# but dependencies don't, the (slow) download step is reused from cache.
COPY go.mod go.sum ./
RUN go mod download

# Now copy the rest of the source.
COPY . .

# Build a statically-linked binary.
#   CGO_ENABLED=0  -> no C dependencies, so it runs on a minimal base image
#   -ldflags "-s -w" -> strip debug info to shrink the binary
FROM builder AS compile
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /gas-shop .

# ---- Stage 2: runtime ----
# Start from a tiny base. alpine is ~5MB and includes a shell for debugging;
# it also lets us add CA certificates (needed for outbound HTTPS to Stripe).
FROM alpine:3.20

# CA certificates are required for the app to make HTTPS calls (e.g. to Stripe).
RUN apk add --no-cache ca-certificates

# Run as a non-root user for security (never run containers as root).
RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /app

# Copy only the compiled binary from the build stage.
COPY --from=compile /gas-shop /app/gas-shop

# Document the port the app listens on (default 3000; overridable via PORT env).
EXPOSE 3000

# Start the server.
ENTRYPOINT ["/app/gas-shop"]
