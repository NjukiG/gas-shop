// Package config loads and validates all application configuration from the
// environment in a single place. It supports two scenarios transparently:
//
//  1. Local development: a .env file (if present) is loaded into the process
//     environment. Missing .env is NOT an error.
//  2. Cloud (ECS/EKS/etc.): configuration is injected directly as environment
//     variables (typically sourced from AWS Secrets Manager / SSM), so no .env
//     file exists and none is required.
//
// Required values are validated up front so the application fails fast with a
// clear message instead of surfacing confusing errors later at request time.
package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all configuration the application needs to run.
type Config struct {
	// DatabaseURL is the PostgreSQL DSN (GORM/pgx compatible). Required.
	DatabaseURL string

	// JWTSecret is the signing secret for authentication tokens. Required.
	JWTSecret string

	// Port is the TCP port the HTTP server listens on. Defaults to 3000.
	Port string

	// AllowedOrigins is the list of origins permitted by CORS.
	// Defaults to the local Vite dev server.
	AllowedOrigins []string

	// StripeSecretKey is the Stripe secret API key used to create payment
	// intents. Required for the payment flow.
	StripeSecretKey string
}

// current holds the loaded configuration so that packages which cannot easily
// receive it via function parameters yet (e.g. middleware and controllers that
// still rely on the global DB handle) can access it. This mirrors the existing
// global pattern and will be removed once dependencies are injected explicitly.
var current *Config

// Set stores the active configuration. Call this once from main after Load.
func Set(c *Config) {
	current = c
}

// Get returns the active configuration previously stored via Set.
// It panics if configuration has not been initialized, which can only happen
// due to a programming error (using config before main loads it).
func Get() *Config {
	if current == nil {
		panic("config: Get called before Set; configuration not initialized")
	}
	return current
}

// Load reads configuration from the environment and validates it.
//
// It first attempts to load a local .env file for developer convenience. A
// missing .env file is ignored (expected in cloud environments); any other
// error reading an existing .env file is returned.
func Load() (*Config, error) {
	// Load .env only if it exists. Absence is fine (cloud deployments).
	if _, statErr := os.Stat(".env"); statErr == nil {
		if err := godotenv.Load(); err != nil {
			return nil, fmt.Errorf("config: failed to load .env file: %w", err)
		}
	}

	cfg := &Config{
		DatabaseURL:     os.Getenv("DB_URL"),
		JWTSecret:       os.Getenv("SECRET"),
		Port:            getEnvDefault("PORT", "3000"),
		AllowedOrigins:  parseOrigins(getEnvDefault("ALLOWED_ORIGINS", "http://localhost:5173")),
		StripeSecretKey: os.Getenv("STRIPE_SECRET_KEY"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// validate ensures all required configuration is present.
func (c *Config) validate() error {
	var missing []string

	if c.DatabaseURL == "" {
		missing = append(missing, "DB_URL")
	}
	if c.JWTSecret == "" {
		missing = append(missing, "SECRET")
	}
	if c.StripeSecretKey == "" {
		missing = append(missing, "STRIPE_SECRET_KEY")
	}

	if len(missing) > 0 {
		return fmt.Errorf("config: missing required environment variables: %s", strings.Join(missing, ", "))
	}

	return nil
}

// getEnvDefault returns the value of the environment variable named by key,
// or fallback if the variable is empty or unset.
func getEnvDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// parseOrigins splits a comma-separated origins string into a trimmed slice.
func parseOrigins(raw string) []string {
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}
