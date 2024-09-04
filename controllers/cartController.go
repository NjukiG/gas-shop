package controllers

import (
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

func AddItemToCart(c *gin.Context) {
	// Assuming user is authenticated
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User not authenticated"})
		return
	}

	userID := user.(models.User).ID

	// Parse the request body
	var body struct {
		ProductID uint `json:"ProductID"`
		Quantity  int  `json:"Quantity"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "Invalid request data", "Detail": err.Error()})
		return
	}

	// Find or create the cart for this user
	var cart models.Cart
	if err := initializers.DB.FirstOrCreate(&cart, models.Cart{UserID: userID}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to find or create a cart", "Detail": err.Error()})
		return
	}

	// Check if the product exists
	var product models.Product
	if err := initializers.DB.First(&product, body.ProductID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "Product not found"})
		return
	}

	// Check if the cart item already exists for this product
	var cartItem models.CartItem
	if err := initializers.DB.First(&cartItem, "cart_id = ? AND product_id = ?", cart.ID, body.ProductID).Error; err != nil {
		if gorm.ErrRecordNotFound == err {
			// Item does not exist in cart, create new one
			cartItem = models.CartItem{
				CartID:    cart.ID,
				ProductID: body.ProductID,
				Quantity:  body.Quantity,
				UserID:    userID, // Make sure UserID is set
			}

			if err := initializers.DB.Create(&cartItem).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to add item to cart", "Detail": err.Error()})
				return
			}

			c.JSON(http.StatusCreated, gin.H{"Message": "Item added to cart"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to check cart items", "Detail": err.Error()})
			return
		}
	}

	// If item already exists, update the quantity
	cartItem.Quantity += body.Quantity
	if err := initializers.DB.Save(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to update cart item quantity", "Detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"Message": "Cart item updated"})
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
