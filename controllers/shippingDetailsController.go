package controllers

import (
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AddShippingDetails(c *gin.Context) {
	var body struct {
		Address     string
		City        string
		State       string
		PostalCode  string
		Country     string
		PhoneNumber string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to read request body"})
		return
	}

	// Get the authenticated user
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User not authenticated"})
		return
	}
	userID := user.(models.User).ID

	// Check if user already has shipping details
	var checkShippingDetailExist models.ShippingDetail
	checkUserHadShipDets := initializers.DB.Where("user_id = ?", userID).First(&checkShippingDetailExist)

	if checkUserHadShipDets.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": "User already has shipping details",
		})
		return
	}

	shippingDetail := models.ShippingDetail{
		UserID:      userID,
		Address:     body.Address,
		City:        body.City,
		State:       body.State,
		PostalCode:  body.PostalCode,
		Country:     body.Country,
		PhoneNumber: body.PhoneNumber,
	}

	result := initializers.DB.Create(&shippingDetail)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to add shipping details"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"Message": "Shipping details added successfully"})
}

// UpdateShippingDetails updates existing shipping details for the user
func UpdateShippingDetails(c *gin.Context) {
	var body struct {
		Address     string
		City        string
		State       string
		PostalCode  string
		Country     string
		PhoneNumber string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	// Get the user from the context
	user, _ := c.Get("user")
	userID := user.(models.User).ID

	var shippingDetail models.ShippingDetail

	// Find the shipping detail by user ID
	initializers.DB.First(&shippingDetail, "user_id = ?", userID)

	if shippingDetail.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shipping details not found"})
		return
	}

	// Update the shipping details
	// shippingDetail.Address = body.Address
	// shippingDetail.City = body.City
	// shippingDetail.State = body.State
	// shippingDetail.PostalCode = body.PostalCode
	// shippingDetail.Country = body.Country
	// shippingDetail.PhoneNumber = body.PhoneNumber

	initializers.DB.Model(&shippingDetail).Updates(models.ShippingDetail{
		Address:     body.Address,
		State:       body.State,
		City:        body.City,
		PostalCode:  body.PostalCode,
		PhoneNumber: body.PhoneNumber,
		Country:     body.Country,
		UserID:      user.(models.User).ID,
	})

	c.JSON(http.StatusOK, gin.H{
		"Message":         "Shipping details updated successfully",
		"ShippingDetails": shippingDetail,
	})
}

// GetShippingDetails retrieves the shipping details for the user
func GetShippingDetails(c *gin.Context) {
	// Get the user from the context
	// Get the authenticated user
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User not authenticated"})
		return
	}
	userID := user.(models.User).ID

	var shippingDetail models.ShippingDetail

	initializers.DB.Where("user_id = ?", userID).First(&shippingDetail)

	if shippingDetail.ID == 0 || shippingDetail.UserID != userID {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Shipping details not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ShippingDetails": shippingDetail})
}
