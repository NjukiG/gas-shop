package controllers

import (
	"errors"
	"net/http"
	"strconv"

	"gas-shop/initializers"
	"gas-shop/models"
	"gas-shop/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CreateOrder creates a new order from the authenticated user's cart.
//
// The order creation and cart clearing run inside a single transaction so the
// cart is only emptied if the order is persisted successfully.
func CreateOrder(c *gin.Context) {
	user, _ := c.Get("user")
	userID := user.(models.User).ID

	// Load the user's cart with product details.
	var cart models.Cart
	if err := initializers.DB.
		Preload("CartItems.Product").
		Where("user_id = ?", userID).
		First(&cart).Error; err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		response.Error(c, http.StatusInternalServerError, "Failed to load cart")
		return
	}

	if len(cart.CartItems) == 0 {
		response.Error(c, http.StatusBadRequest, "Your cart is empty")
		return
	}

	// Shipping details are required to place an order.
	var shippingDetail models.ShippingDetail
	if err := initializers.DB.Where("user_id = ?", userID).First(&shippingDetail).Error; err != nil {
		response.Error(c, http.StatusBadRequest, "Please add shipping details before placing an order")
		return
	}

	// Build order line items, snapshotting the price at order time.
	totalPrice := 0
	orderItems := make([]models.OrderItem, 0, len(cart.CartItems))
	for _, cartItem := range cart.CartItems {
		totalPrice += cartItem.Product.Price * cartItem.Quantity
		orderItems = append(orderItems, models.OrderItem{
			ProductID: cartItem.ProductID,
			Quantity:  cartItem.Quantity,
			Price:     cartItem.Product.Price,
		})
	}

	order := models.Order{
		UserID:           userID,
		TotalPrice:       totalPrice,
		ShippingDetailID: shippingDetail.ID,
		OrderItems:       orderItems,
	}

	// Persist the order and clear the cart atomically.
	err := initializers.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create order")
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{
		"message": "Order created successfully",
		"order":   order,
	})
}

// GetOrders returns all orders for the authenticated user.
func GetOrders(c *gin.Context) {
	user, _ := c.Get("user")
	userID := user.(models.User).ID

	var orders []models.Order
	if err := initializers.DB.
		Preload("OrderItems.Product").
		Where("user_id = ?", userID).
		Find(&orders).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve orders")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"orders": orders})
}

// GetOrder returns a single order belonging to the authenticated user.
func GetOrder(c *gin.Context) {
	user, _ := c.Get("user")
	userID := user.(models.User).ID

	orderID, err := strconv.ParseUint(c.Param("order_id"), 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Scope to the authenticated user so one user cannot read another's order.
	var order models.Order
	result := initializers.DB.
		Preload("OrderItems.Product").
		Where("id = ? AND user_id = ?", uint(orderID), userID).
		First(&order)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Order not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve order")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"order": order})
}

// UpdateOrderStatus updates an order's status (intended for admin use once
// wired into an admin-only route).
func UpdateOrderStatus(c *gin.Context) {
	var order models.Order
	if err := initializers.DB.Where("id = ?", c.Param("order_id")).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Order not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up order")
		return
	}

	var body struct {
		Status models.OrderStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a status is required")
		return
	}

	validStatuses := map[models.OrderStatus]bool{
		models.OrderPending:   true,
		models.OrderProcessed: true,
		models.OrderShipped:   true,
		models.OrderDelivered: true,
		models.OrderCancelled: true,
	}
	if !validStatuses[body.Status] {
		response.Error(c, http.StatusBadRequest, "Invalid order status")
		return
	}

	order.Status = string(body.Status)
	if err := initializers.DB.Save(&order).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update order status")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "Order status updated successfully",
		"order":   order,
	})
}
