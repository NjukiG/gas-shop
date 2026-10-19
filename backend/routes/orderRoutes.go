package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterOrderRoutes(router *gin.Engine) {
	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	// Order routes.
	//
	// Orders belong to the authenticated user (resolved from the JWT), so the
	// routes are modeled directly under /orders rather than nested under a
	// cart id. This also removes the previous route conflict where two ":id"
	// params collided on the same path.
	{
		protectedRoutes.POST("/payments/create-intent", controllers.CreatePaymentIntent)
		protectedRoutes.POST("/orders", controllers.CreateOrder)
		protectedRoutes.GET("/orders", controllers.GetOrders)
		protectedRoutes.GET("/orders/:order_id", controllers.GetOrder)
		// protectedRoutes.PATCH("/orders/:order_id/status", controllers.UpdateOrderStatus)
	}
}
