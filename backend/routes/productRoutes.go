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


	}

	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	{
		protectedRoutes.POST("/categories/:id/products", controllers.CreateProduct)
		protectedRoutes.PUT("/products/:id", controllers.UpdateProduct)
		protectedRoutes.DELETE("/products/:id", controllers.DeleteProduct)

	}

}
