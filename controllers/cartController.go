package controllers

import (
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// func CreateCart(c *gin.Context) {
// 	var body struct {
// 		CartItems []models.CartItem
// 	}

// 	if c.Bind(&body) != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"Error": "Failed to read body",
// 		})
// 		return
// 	}

// 	// Get the user's id to add the cart to
// 	user, _ := c.Get("user")

// 	cart := models.Cart{
// 		UserID: user.(models.User).ID,
// 	}

// 	result := initializers.DB.Create(&cart)

// 	if result.Error != nil {
// 		c.Status(400)
// 		return
// 	}

// 	c.JSON(http.StatusCreated, gin.H{
// 		"My New Cart": cart,
// 	})
// }

// Adding items to the cart
// func AddItemToCart(c *gin.Context) {
// 	// Lets get the user id of this cart
// 	user, exists := c.Get("user")

// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User not authenticated"})
// 		return
// 	}

// 	userID := user.(models.User).ID

// 	// cartId := c.Param("id")
// 	var cart models.Cart

// 	myCart := initializers.DB.Preload("CartItems").First(&cart)

// 	// Check if cart is there
// 	if myCart.Error != nil {
// 		c.JSON(http.StatusNotFound, gin.H{
// 			"Error": "Cart not found",
// 		})
// 		return
// 	}

// 	var body struct {
// 		ProductID uint
// 		Quantity  int
// 	}

// 	// Check if product is there
// 	productID := c.Param("id")
// 	var product models.Product
// 	resultProduct := initializers.DB.First(&product, productID)

// 	if resultProduct.Error != nil {
// 		c.JSON(http.StatusNotFound, gin.H{
// 			"Error": "Product not found",
// 		})
// 		return
// 	}

// 	if c.Bind(&body) != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"Error": "Failed to read request body",
// 		})
// 		return
// 	}

// 	// Adding item to cart moja tu
// 	cartItem := models.CartItem{
// 		CartID:    cart.ID,
// 		ProductID: body.ProductID,
// 		Quantity:  body.Quantity,
// 		UserID:    userID,
// 	}

// 	result := initializers.DB.Create(&cartItem)

// 	if result.Error != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"Error": "Failed to add item to cart",
// 		})
// 		return
// 	}

// 	// Preload the associated Product data
// 	initializers.DB.Preload("Product").First(&cartItem, cartItem.ID)

// 	c.JSON(http.StatusCreated, gin.H{
// 		"Cart-Item": cartItem,
// 	})

// }

// Adding items to the cart
func AddItemToCart(c *gin.Context) {
	var body struct {
		ProductID uint
		Quantity  int
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to read request body",
		})
		return
	}

	// Get the authenticated user
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User not authenticated"})
		return
	}
	userID := user.(models.User).ID

	// Check if the user has a cart
	var cart models.Cart
	result := initializers.DB.Where("user_id = ?", userID).First(&cart)
	if result.Error != nil {
		// If no cart exists, create one
		cart = models.Cart{
			UserID: userID,
		}
		createResult := initializers.DB.Create(&cart)
		if createResult.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Error": "Failed to create cart",
			})
			return
		}
	}

	// Check if the product exists
	var product models.Product
	productResult := initializers.DB.First(&product, body.ProductID)
	if productResult.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": "Product not found",
		})
		return
	}

	// Add item to the cart
	cartItem := models.CartItem{
		CartID:    cart.ID,
		ProductID: body.ProductID,
		Quantity:  body.Quantity,
		UserID:    userID,
	}

	addItemResult := initializers.DB.Create(&cartItem)
	if addItemResult.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to add item to cart",
		})
		return
	}

	// Preload the associated Product data
	initializers.DB.Preload("Product").First(&cartItem, cartItem.ID)

	c.JSON(http.StatusCreated, gin.H{
		"CartItem": cartItem,
	})
}

// List items in the cart

func ListCartItems(c *gin.Context) {
	cartID := c.Param("id")

	var cartItems []models.CartItem

	resultItems := initializers.DB.Where("cart_id = ?", cartID).Preload("Product").Find(&cartItems)

	if resultItems.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": "Cart items not found",
		})
		return
	}
	totalPrice := 0
	for _, item := range cartItems {
		totalPrice += item.Product.Price * item.Quantity
	}

	c.JSON(http.StatusOK, gin.H{
		"CartItems": cartItems,
		// "Total Price": totalPrice,
	})
}

// Rmove an item from cart
func RemoveItemFromCart(c *gin.Context) {
	cartID := c.Param("id")
	productID := c.Param("product_id")

	var cartItem models.CartItem

	resultItem := initializers.DB.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&cartItem)

	if resultItem.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Cart item not found",
		})
		return
	}

	result := initializers.DB.Delete(&cartItem)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to remove item from cart",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Item removed from cart",
	})
}

// Update the Quantity of a Cart Item
func UpdateCartItemQuantity(c *gin.Context) {
	cartID := c.Param("id")
	productID := c.Param("product_id")

	var body struct {
		Quantity int `json:"quantity"`
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read request body",
		})
		return
	}

	var cartItem models.CartItem
	if err := initializers.DB.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&cartItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Cart item not found",
		})
		return
	}

	// Update the quantity
	cartItem.Quantity = body.Quantity
	if err := initializers.DB.Save(&cartItem).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to update cart item quantity",
		})
		return
	}

	// Preload the associated Product data
	initializers.DB.Preload("Product").First(&cartItem, cartItem.ID)

	c.JSON(http.StatusOK, gin.H{
		"CartItem": cartItem,
	})
}

// Clear the items in the Cart
func ClearCart(c *gin.Context) {
	cartID := c.Param("id")

	result := initializers.DB.Where("cart_id = ?", cartID).Delete(&models.CartItem{})

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to clear cart",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Message": "Cart cleared",
	})
}

// Review cart totals and details before going to checkout

func ReviewCart(c *gin.Context) {
	cartID := c.Param("id")

	var cartItems []models.CartItem

	resultItems := initializers.DB.Where("cart_id = ?", cartID).Preload("Product").Find(&cartItems)

	if resultItems.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": "Cart items not found",
		})
		return
	}
	totalPrice := 0
	for _, item := range cartItems {
		totalPrice += item.Product.Price * item.Quantity
	}

	c.JSON(http.StatusOK, gin.H{
		"CartItems":  cartItems,
		"TotalPrice": totalPrice,
	})
}
