package controllers

import (
	"errors"
	"net/http"

	"gas-shop/initializers"
	"gas-shop/models"
	"gas-shop/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AddItemToCart adds a product to the authenticated user's cart, or increments
// the quantity if it is already present.
func AddItemToCart(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}
	userID := user.(models.User).ID

	var body struct {
		ProductID uint `json:"productId" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a productId and a quantity greater than 0 are required")
		return
	}

	// Find or create the cart for this user.
	var cart models.Cart
	if err := initializers.DB.FirstOrCreate(&cart, models.Cart{UserID: userID}).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to access cart")
		return
	}

	// Ensure the product exists.
	var product models.Product
	if err := initializers.DB.First(&product, body.ProductID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up product")
		return
	}

	// If the item is already in the cart, increment its quantity.
	var cartItem models.CartItem
	err := initializers.DB.First(&cartItem, "cart_id = ? AND product_id = ?", cart.ID, body.ProductID).Error
	switch {
	case err == nil:
		cartItem.Quantity += body.Quantity
		if err := initializers.DB.Save(&cartItem).Error; err != nil {
			response.Error(c, http.StatusInternalServerError, "Failed to update cart item")
			return
		}
		response.JSON(c, http.StatusOK, gin.H{"message": "Cart item updated", "cartItem": cartItem})
	case errors.Is(err, gorm.ErrRecordNotFound):
		cartItem = models.CartItem{
			CartID:    cart.ID,
			ProductID: body.ProductID,
			Quantity:  body.Quantity,
			UserID:    userID,
		}
		if err := initializers.DB.Create(&cartItem).Error; err != nil {
			response.Error(c, http.StatusInternalServerError, "Failed to add item to cart")
			return
		}
		response.JSON(c, http.StatusCreated, gin.H{"message": "Item added to cart", "cartItem": cartItem})
	default:
		response.Error(c, http.StatusInternalServerError, "Failed to check cart items")
	}
}

// ListCartItems returns the items in a cart with their products.
func ListCartItems(c *gin.Context) {
	cartID := c.Param("id")

	var cartItems []models.CartItem
	if err := initializers.DB.Where("cart_id = ?", cartID).Preload("Product").Find(&cartItems).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve cart items")
		return
	}

	totalPrice := 0
	for _, item := range cartItems {
		totalPrice += item.Product.Price * item.Quantity
	}

	response.JSON(c, http.StatusOK, gin.H{"cartItems": cartItems, "totalPrice": totalPrice})
}

// RemoveItemFromCart removes a single product from a cart.
func RemoveItemFromCart(c *gin.Context) {
	cartID := c.Param("id")
	productID := c.Param("product_id")

	var cartItem models.CartItem
	if err := initializers.DB.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&cartItem).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Cart item not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up cart item")
		return
	}

	if err := initializers.DB.Delete(&cartItem).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to remove item from cart")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "Item removed from cart"})
}

// UpdateCartItemQuantity sets the quantity of a product in a cart.
func UpdateCartItemQuantity(c *gin.Context) {
	cartID := c.Param("id")
	productID := c.Param("product_id")

	var body struct {
		Quantity int `json:"quantity" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a quantity greater than 0 is required")
		return
	}

	var cartItem models.CartItem
	if err := initializers.DB.Where("cart_id = ? AND product_id = ?", cartID, productID).First(&cartItem).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Cart item not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up cart item")
		return
	}

	cartItem.Quantity = body.Quantity
	if err := initializers.DB.Save(&cartItem).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update cart item quantity")
		return
	}

	// Reload with product data for the response.
	initializers.DB.Preload("Product").First(&cartItem, cartItem.ID)

	response.JSON(c, http.StatusOK, gin.H{"cartItem": cartItem})
}

// ClearCart removes all items from a cart.
func ClearCart(c *gin.Context) {
	cartID := c.Param("id")

	if err := initializers.DB.Where("cart_id = ?", cartID).Delete(&models.CartItem{}).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to clear cart")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "Cart cleared"})
}

// ReviewCart returns cart items plus the computed total before checkout.
func ReviewCart(c *gin.Context) {
	cartID := c.Param("id")

	var cartItems []models.CartItem
	if err := initializers.DB.Where("cart_id = ?", cartID).Preload("Product").Find(&cartItems).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve cart items")
		return
	}

	totalPrice := 0
	for _, item := range cartItems {
		totalPrice += item.Product.Price * item.Quantity
	}

	response.JSON(c, http.StatusOK, gin.H{"cartItems": cartItems, "totalPrice": totalPrice})
}
