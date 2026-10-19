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

// shippingBody is the accepted payload for creating or updating shipping details.
type shippingBody struct {
	Address     string `json:"Address" binding:"required"`
	City        string `json:"City" binding:"required"`
	State       string `json:"State" binding:"required"`
	PostalCode  string `json:"PostalCode" binding:"required"`
	Country     string `json:"Country" binding:"required"`
	PhoneNumber string `json:"PhoneNumber" binding:"required"`
}

// AddShippingDetails creates shipping details for the authenticated user.
func AddShippingDetails(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}
	userID := user.(models.User).ID

	var body shippingBody
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: address, city, state, postal code, country and phone number are all required")
		return
	}

	// A user may only have one set of shipping details.
	var existing models.ShippingDetail
	if err := initializers.DB.Where("user_id = ?", userID).First(&existing).Error; err == nil {
		response.Error(c, http.StatusConflict, "User already has shipping details; use update instead")
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

	if result := initializers.DB.Create(&shippingDetail); result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to add shipping details")
		return
	}

	if err := initializers.DB.Preload("User").First(&shippingDetail, shippingDetail.ID).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to load shipping details")
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{"shippingDetails": shippingDetail})
}

// UpdateShippingDetails updates existing shipping details for the user.
func UpdateShippingDetails(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}
	userID := user.(models.User).ID

	var body shippingBody
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: address, city, state, postal code, country and phone number are all required")
		return
	}

	// Upsert: find the user's existing details, or create a new record if this
	// is their first time. This lets the client use a single endpoint without
	// tracking whether details already exist.
	var shippingDetail models.ShippingDetail
	if err := initializers.DB.Where("user_id = ?", userID).First(&shippingDetail).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			shippingDetail = models.ShippingDetail{UserID: userID}
		} else {
			response.Error(c, http.StatusInternalServerError, "Failed to look up shipping details")
			return
		}
	}

	shippingDetail.Address = body.Address
	shippingDetail.City = body.City
	shippingDetail.State = body.State
	shippingDetail.PostalCode = body.PostalCode
	shippingDetail.Country = body.Country
	shippingDetail.PhoneNumber = body.PhoneNumber

	if err := initializers.DB.Save(&shippingDetail).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update shipping details")
		return
	}

	if err := initializers.DB.Preload("User").First(&shippingDetail, shippingDetail.ID).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to load shipping details")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message":         "Shipping details updated successfully",
		"shippingDetails": shippingDetail,
	})
}

// GetShippingDetails returns the authenticated user's shipping details.
func GetShippingDetails(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}
	userID := user.(models.User).ID

	var shippingDetail models.ShippingDetail
	if err := initializers.DB.
		Preload("User.Cart.CartItems.Product").
		First(&shippingDetail, "user_id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Shipping details not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve shipping details")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"shippingDetails": shippingDetail})
}
