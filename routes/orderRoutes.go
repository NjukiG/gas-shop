package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterOrderRoutes(router *gin.Engine) {
	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	// Order routes
	{
		protectedRoutes.POST("/cart/:id/orders", controllers.CreateOrder)
		protectedRoutes.GET("/cart/:id/orders", controllers.GetOrders)
		protectedRoutes.GET("/cart/:id/orders/:id", controllers.GetOrder)
		// protectedRoutes.PUT("/orders/:order_id", controllers.UpdateOrderStatus)
		// protectedRoutes.DELETE("/orders/:order_id", controllers.DeleteOrder)
	}
}
