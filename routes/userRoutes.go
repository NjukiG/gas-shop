package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(router *gin.Engine) {
	publicRoutes := router.Group("/public")

	{
		// Routes to signup user and Login user. In public
		publicRoutes.POST("/register", controllers.RegisterUser)
		publicRoutes.POST("/login", controllers.Login)
	}

	// For all protected routes,  user has to be logged in  and have correct middleware access to access them
	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	{
		// ROutes to logout and validate a logged in user. In private.
		protectedRoutes.POST("/logout", controllers.LogoutUser)
		protectedRoutes.GET("/validate", controllers.ValidateUser)

	}
}
