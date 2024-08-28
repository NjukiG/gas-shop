package main

import (
	"fmt"
	"gas-shop/initializers"
	"gas-shop/routes"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnv()
	initializers.ConnectToDB()
	initializers.SyncDatabase()
}

func main() {
	fmt.Println("Working on my gas-shop application backend!!")

	r := gin.Default()

	// Apply CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Adjust this as needed
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

	r.Run()
}

// 	Order controlle not working.
