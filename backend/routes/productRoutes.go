package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterProductRoutes(router *gin.Engine) {
	publicRoutes := router.Group("/public")

	{
		// Routes to get all categories and also by ID each. In public
		publicRoutes.GET("/products", controllers.ListAllProducts)
		publicRoutes.GET("/categories/:id/products", controllers.GetProductsByCategory)
		publicRoutes.GET("/products/:id", controllers.GetSingleProduct)

		// AI scent finder (Amazon Bedrock) — public, no login required.
		publicRoutes.POST("/scent-finder", controllers.ScentFinder)
	}

	// Admin-only mutations. Browsing products is public (above); creating,
	// updating and deleting them requires an authenticated admin.
	adminRoutes := router.Group("/protected")
	adminRoutes.Use(middleware.RequireAuth, middleware.AdminOnly())

	{
		adminRoutes.POST("/categories/:id/products", controllers.CreateProduct)
		adminRoutes.PUT("/products/:id", controllers.UpdateProduct)
		adminRoutes.DELETE("/products/:id", controllers.DeleteProduct)
	}
}
