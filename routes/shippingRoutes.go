package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterShippingRoutes(router *gin.Engine) {

	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	{
		protectedRoutes.POST("/shipping-details", controllers.AddShippingDetails)
		protectedRoutes.PUT("/shipping-details", controllers.UpdateShippingDetails)
		protectedRoutes.GET("/shipping-details", controllers.GetShippingDetails)
	}

}
