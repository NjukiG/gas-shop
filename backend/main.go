package main

import (
	"log"
	"time"

	"gas-shop/config"
	"gas-shop/initializers"
	"gas-shop/routes"
	"gas-shop/secrets"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// In the cloud (USE_SECRETS_MANAGER=true), fetch secrets from AWS Secrets
	// Manager (via IRSA) and populate env vars BEFORE loading config. Locally
	// this is a no-op and config comes from .env.
	if err := secrets.LoadIntoEnv(); err != nil {
		log.Fatalf("startup: %v", err)
	}

	// Load and validate configuration up front. Fail fast with a clear
	// message if anything required is missing.
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("startup: %v", err)
	}
	config.Set(cfg)

	// Establish the database connection (verified with a ping) before serving.
	if err := initializers.ConnectToDB(cfg.DatabaseURL); err != nil {
		log.Fatalf("startup: %v", err)
	}

	// Apply schema migrations.
	if err := initializers.SyncDatabase(); err != nil {
		log.Fatalf("startup: %v", err)
	}

	r := gin.Default()

	// Apply CORS middleware. Allowed origins are configurable so the same
	// binary works locally and in the cloud.
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.RegisterUserRoutes(r)
	routes.RegisterCategoryRoutes(r)
	routes.RegisterProductRoutes(r)
	routes.RegisterCartRoutes(r)
	routes.RegisterShippingRoutes(r)
	routes.RegisterOrderRoutes(r)

	// Listen on the configured port. This fixes the previous mismatch where
	// the server defaulted to :8080 while the frontend expected :3000.
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}
