package routes

import (
	"gas-shop/controllers"
	"gas-shop/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterCartRoutes(router *gin.Engine) {
	protectedRoutes := router.Group("/protected")
	protectedRoutes.Use(middleware.RequireAuth)

	// The cart belongs to the authenticated user (resolved from the JWT), so
	// there is no cart id in the path. This removes the previous ambiguity
	// where the frontend passed a user id into a ":id" that handlers treated
	// as a cart id, and prevents one user from referencing another's cart.
	{
		protectedRoutes.POST("/cart/items", controllers.AddItemToCart)
		protectedRoutes.GET("/cart/items", controllers.ListCartItems)
		protectedRoutes.PUT("/cart/items/:product_id", controllers.UpdateCartItemQuantity)
		protectedRoutes.DELETE("/cart/items/:product_id", controllers.RemoveItemFromCart)
		protectedRoutes.DELETE("/cart", controllers.ClearCart)
		protectedRoutes.GET("/cart/review", controllers.ReviewCart)
	}
}
