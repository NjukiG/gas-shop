package controllers

import (
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CreateOrder creates a new order based on the cart items
func CreateOrder(c *gin.Context) {

	user, _ := c.Get("user")
	userID := user.(models.User).ID

	// Find the cart for this user
	var cart models.Cart
	initializers.DB.Preload("CartItems.Product").Where("user_id = ?", userID).First(&cart)

	if len(cart.CartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Your cart is empty!"})
		return
	}

	// Find the shipping details for this user
	var shippingDetail models.ShippingDetail
	initializers.DB.Where("user_id = ?", userID).First(&shippingDetail)

	// Calculate total price
	totalPrice := 0
	orderItems := []models.OrderItem{}
	for _, cartItem := range cart.CartItems {
		totalPrice += cartItem.Product.Price * cartItem.Quantity
		orderItems = append(orderItems, models.OrderItem{
			ProductID: cartItem.ProductID,
			Quantity:  cartItem.Quantity,
			Price:     cartItem.Product.Price,
		})
	}

	// Create the order
	order := models.Order{
		UserID:           userID,
		TotalPrice:       totalPrice,
		ShippingDetailID: shippingDetail.ID,
		OrderItems:       orderItems,
	}
	if err := initializers.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create order"})
		return
	}

	// Clear the cart
	initializers.DB.Where("user_id = ?", userID).Delete(&models.CartItem{})

	c.JSON(http.StatusCreated, gin.H{"Message": "Order created successfully", "Order": order})
}

// Get all orders for a user
func GetOrders(c *gin.Context) {
	user, _ := c.Get("user")
	userID := user.(models.User).ID
	var orders []models.Order
	initializers.DB.Preload("OrderItems.Product").Where("user_id = ?", userID).Find(&orders)

	c.JSON(http.StatusOK, gin.H{"Orders": orders})
}

func GetOrder(c *gin.Context) {
	// Extract the order ID from the URL parameters
	user, _ := c.Get("user")
	userID := user.(models.User).ID
	var orders []models.Order
	result := initializers.DB.Preload("OrderItems.Product").Where("user_id = ?", userID).Find(&orders)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve orders",
		})
		return
	}
	// Extract the order ID from the URL parameters and convert it to a uint
	orderIDStr := c.Param("id")
	orderID, err := strconv.ParseUint(orderIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid order ID",
		})
		return
	}

	// Loop through the user's orders to find the specific order by ID
	for _, order := range orders {
		if order.ID == uint(orderID) {
			c.JSON(http.StatusOK, gin.H{
				"order": order,
			})
			return
		}
	}

	// If no matching order is found, return a 404 error
	c.JSON(http.StatusNotFound, gin.H{
		"error": "Order not found",
	})
}

// Get a single order by ID
// func GetOrder(c *gin.Context) {
// 	orderId := c.Param("id")
// 	user, _ := c.Get("user")
// 	userID := user.(models.User).ID

// 	var order models.Order
// 	if err := initializers.DB.Preload("OrderItems.Product").Where("id = ? AND user_id = ?", orderId, userID).First(&order).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"order": order})
// }

// func ListOrders(c *gin.Context) {
// 	var user models.User
// 	if err := initializers.DB.Where("id = ?", c.Param("user_id")).First(&user).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
// 		return
// 	}

// 	var orders []models.Order
// 	if err := initializers.DB.Preload("OrderItems.Product").Where("user_id = ?", user.ID).Find(&orders).Error; err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve orders"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"orders": orders})
// }

// func GetOrderDetails(c *gin.Context) {
// 	var order models.Order
// 	if err := initializers.DB.Preload("OrderItems.Product").Where("id = ?", c.Param("order_id")).First(&order).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"order": order})
// }

// func UpdateOrderStatus(c *gin.Context) {
// 	var order models.Order
// 	if err := initializers.DB.Where("id = ?", c.Param("order_id")).First(&order).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
// 		return
// 	}

// 	var body struct {
// 		Status models.OrderStatus
// 	}

// 	if err := c.Bind(&body); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
// 		return
// 	}

// 	order.Status = body.Status
// 	initializers.DB.Save(&order)

// 	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully", "order": order})
// }

// func DeleteOrder(c *gin.Context) {
// 	var order models.Order
// 	if err := initializers.DB.Where("id = ?", c.Param("order_id")).First(&order).Error; err != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
// 		return
// 	}

// 	initializers.DB.Delete(&order)

// 	c.JSON(http.StatusOK, gin.H{"message": "Order deleted successfully"})
// }
