package controllers

import (
	"errors"
	"net/http"

	"gas-shop/initializers"
	"gas-shop/models"
	"gas-shop/pricing"
	"gas-shop/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// authUserID returns the authenticated user's ID from the Gin context.
// RequireAuth guarantees "user" is present on all cart routes.
func authUserID(c *gin.Context) uint {
	user, _ := c.Get("user")
	return user.(models.User).ID
}

// findOrCreateCart returns the authenticated user's cart, creating one if needed.
func findOrCreateCart(userID uint) (models.Cart, error) {
	var cart models.Cart
	err := initializers.DB.FirstOrCreate(&cart, models.Cart{UserID: userID}).Error
	return cart, err
}

// AddItemToCart adds a product to the authenticated user's cart, or increments
// the quantity if it is already present.
func AddItemToCart(c *gin.Context) {
	userID := authUserID(c)

	var body struct {
		ProductID uint `json:"productId" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a productId and a quantity greater than 0 are required")
		return
	}

	cart, err := findOrCreateCart(userID)
	if err != nil {
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
	lookupErr := initializers.DB.First(&cartItem, "cart_id = ? AND product_id = ?", cart.ID, body.ProductID).Error
	switch {
	case lookupErr == nil:
		cartItem.Quantity += body.Quantity
		if err := initializers.DB.Save(&cartItem).Error; err != nil {
			response.Error(c, http.StatusInternalServerError, "Failed to update cart item")
			return
		}
		response.JSON(c, http.StatusOK, gin.H{"message": "Cart item updated", "cartItem": cartItem})
	case errors.Is(lookupErr, gorm.ErrRecordNotFound):
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

// ListCartItems returns the items in the authenticated user's cart.
func ListCartItems(c *gin.Context) {
	userID := authUserID(c)

	cart, err := findOrCreateCart(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to access cart")
		return
	}

	cartItems, totalPrice, err := loadCartItems(cart.ID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve cart items")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"cartItems": cartItems, "totalPrice": totalPrice})
}

// RemoveItemFromCart removes a single product from the authenticated user's cart.
func RemoveItemFromCart(c *gin.Context) {
	userID := authUserID(c)
	productID := c.Param("product_id")

	cart, err := findOrCreateCart(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to access cart")
		return
	}

	var cartItem models.CartItem
	if err := initializers.DB.Where("cart_id = ? AND product_id = ?", cart.ID, productID).First(&cartItem).Error; err != nil {
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

// UpdateCartItemQuantity sets the quantity of a product in the user's cart.
func UpdateCartItemQuantity(c *gin.Context) {
	userID := authUserID(c)
	productID := c.Param("product_id")

	var body struct {
		Quantity int `json:"quantity" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a quantity greater than 0 is required")
		return
	}

	cart, err := findOrCreateCart(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to access cart")
		return
	}

	var cartItem models.CartItem
	if err := initializers.DB.Where("cart_id = ? AND product_id = ?", cart.ID, productID).First(&cartItem).Error; err != nil {
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

	initializers.DB.Preload("Product").First(&cartItem, cartItem.ID)

	response.JSON(c, http.StatusOK, gin.H{"cartItem": cartItem})
}

// ClearCart removes all items from the authenticated user's cart.
func ClearCart(c *gin.Context) {
	userID := authUserID(c)

	cart, err := findOrCreateCart(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to access cart")
		return
	}

	if err := initializers.DB.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{}).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to clear cart")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "Cart cleared"})
}

// ReviewCart returns cart items plus the computed total before checkout.
func ReviewCart(c *gin.Context) {
	userID := authUserID(c)

	cart, err := findOrCreateCart(userID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to access cart")
		return
	}

	cartItems, subtotal, err := loadCartItems(cart.ID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve cart items")
		return
	}

	// Backend is the source of truth for shipping/tax so the preview matches
	// the final order exactly.
	breakdown := pricing.Compute(subtotal)

	response.JSON(c, http.StatusOK, gin.H{
		"cartItems": cartItems,
		"subtotal":  breakdown.Subtotal,
		"shipping":  breakdown.Shipping,
		"tax":       breakdown.Tax,
		"totalPrice": breakdown.Total,
	})
}

// loadCartItems returns a cart's items (with products) and the computed total.
func loadCartItems(cartID uint) ([]models.CartItem, int, error) {
	var cartItems []models.CartItem
	if err := initializers.DB.Where("cart_id = ?", cartID).Preload("Product").Find(&cartItems).Error; err != nil {
		return nil, 0, err
	}

	totalPrice := 0
	for _, item := range cartItems {
		totalPrice += item.Product.Price * item.Quantity
	}
	return cartItems, totalPrice, nil
}
