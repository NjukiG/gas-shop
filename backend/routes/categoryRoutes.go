package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterCategoryRoutes(router *gin.Engine) {
	publicRoutes := router.Group("/public")

	{
		// Routes to get all categories and also by ID each. In public
		publicRoutes.GET("/categories", controllers.GetAllCategories)
		publicRoutes.GET("/categories/:id", controllers.GetCategoryByID)

	}

	// Admin-only mutations. Browsing categories is public (above); creating
	// them requires an authenticated admin.
	adminRoutes := router.Group("/protected")
	adminRoutes.Use(middleware.RequireAuth, middleware.AdminOnly())

	{
		adminRoutes.POST("/categories", controllers.CreateCategory)
		adminRoutes.PUT("/categories/:id", controllers.UpdateCategory)
		adminRoutes.DELETE("/categories/:id", controllers.DeleteCategory)
	}
}
