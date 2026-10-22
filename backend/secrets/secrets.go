// Package secrets loads application configuration from AWS Secrets Manager when
// running in the cloud (EKS). Credentials are provided automatically by IRSA
// (the pod's ServiceAccount assumes a scoped IAM role), so no keys are needed.
//
// It reads two secrets:
//  1. APP_SECRET_ARN      — JWT secret, Stripe key, and DB connection parts.
//  2. RDS_SECRET_ARN      — the RDS-managed master password.
//
// From these it assembles DB_URL and sets all values as environment variables,
// so the existing config.Load() can read them unchanged.
package secrets

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

// appSecret mirrors the JSON structure of our application secret.
type appSecret struct {
	Secret          string `json:"SECRET"`
	StripeSecretKey string `json:"STRIPE_SECRET_KEY"`
	DBHost          string `json:"DB_HOST"`
	DBPort          string `json:"DB_PORT"`
	DBUser          string `json:"DB_USER"`
	DBName          string `json:"DB_NAME"`
	AllowedOrigins  string `json:"ALLOWED_ORIGINS"`
}

// rdsSecret mirrors the JSON structure of the RDS-managed password secret.
type rdsSecret struct {
	Password string `json:"password"`
}

// LoadIntoEnv fetches secrets from Secrets Manager and sets them as environment
// variables. It is a no-op unless USE_SECRETS_MANAGER=true, so local development
// (which uses .env) is unaffected.
func LoadIntoEnv() error {
	if os.Getenv("USE_SECRETS_MANAGER") != "true" {
		return nil // local/dev: rely on .env / existing env vars
	}

	appArn := os.Getenv("APP_SECRET_ARN")
	rdsArn := os.Getenv("RDS_SECRET_ARN")
	if appArn == "" || rdsArn == "" {
		return fmt.Errorf("secrets: APP_SECRET_ARN and RDS_SECRET_ARN must be set when USE_SECRETS_MANAGER=true")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// The SDK's default credential chain automatically picks up IRSA creds.
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return fmt.Errorf("secrets: failed to load AWS config: %w", err)
	}
	client := secretsmanager.NewFromConfig(cfg)

	// 1. App secret.
	var app appSecret
	if err := fetchJSON(ctx, client, appArn, &app); err != nil {
		return fmt.Errorf("secrets: app secret: %w", err)
	}

	// 2. RDS-managed password secret.
	var rds rdsSecret
	if err := fetchJSON(ctx, client, rdsArn, &rds); err != nil {
		return fmt.Errorf("secrets: rds secret: %w", err)
	}

	// Assemble the GORM/pgx DSN from the parts (password never leaves memory).
	dbURL := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=require TimeZone=UTC",
		app.DBHost, app.DBUser, rds.Password, app.DBName, app.DBPort,
	)

	// Populate environment variables for config.Load() to read.
	setenv("SECRET", app.Secret)
	setenv("STRIPE_SECRET_KEY", app.StripeSecretKey)
	setenv("ALLOWED_ORIGINS", app.AllowedOrigins)
	setenv("DB_URL", dbURL)

	return nil
}

// fetchJSON retrieves a secret's value and unmarshals its JSON into out.
func fetchJSON(ctx context.Context, client *secretsmanager.Client, arn string, out interface{}) error {
	resp, err := client.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: &arn,
	})
	if err != nil {
		return err
	}
	if resp.SecretString == nil {
		return fmt.Errorf("secret %s has no string value", arn)
	}
	return json.Unmarshal([]byte(*resp.SecretString), out)
}

func setenv(key, val string) {
	if val != "" {
		_ = os.Setenv(key, val)
	}
}
