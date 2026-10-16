package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterCartRoutes(router *gin.Engine) {
	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	{
		// protectedRoutes.POST("/cart", controllers.CreateCart)
		protectedRoutes.POST("/cart/:id/items", controllers.AddItemToCart)
		protectedRoutes.DELETE("/cart/:id/items/:product_id", controllers.RemoveItemFromCart)
		protectedRoutes.PUT("/cart/:id/items/:product_id", controllers.UpdateCartItemQuantity)
		protectedRoutes.GET("/cart/:id/items", controllers.ListCartItems)
		protectedRoutes.DELETE("/cart/:id/clear", controllers.ClearCart)
		protectedRoutes.GET("/cart/:id/review", controllers.ReviewCart)
	}
}
