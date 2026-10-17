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

// productBody is the accepted payload for creating or updating a product.
type productBody struct {
	Title       string `json:"Title" binding:"required"`
	Company     string `json:"Company" binding:"required"`
	Description string `json:"Description"`
	Featured    bool   `json:"Featured"`
	Image       string `json:"Image"`
	Price       int    `json:"Price" binding:"required,gt=0"`
	Shipping    bool   `json:"Shipping"`
}

// CreateProduct creates a product within a category (admin only).
func CreateProduct(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.Category
	if err := initializers.DB.First(&category, categoryID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up category")
		return
	}

	var body productBody
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: title, company and a price greater than 0 are required")
		return
	}

	product := models.Product{
		Title:       body.Title,
		Company:     body.Company,
		Description: body.Description,
		Featured:    body.Featured,
		Image:       body.Image,
		Price:       body.Price,
		Shipping:    body.Shipping,
		CategoryID:  category.ID,
	}

	if result := initializers.DB.Create(&product); result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create product")
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{"product": product})
}

// ListAllProducts returns all products.
func ListAllProducts(c *gin.Context) {
	var products []models.Product

	if result := initializers.DB.Find(&products); result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve products")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"products": products})
}

// GetSingleProduct returns a single product by ID.
func GetSingleProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	result := initializers.DB.First(&product, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve product")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"product": product})
}

// GetProductsByCategory returns all products within a category.
func GetProductsByCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var products []models.Product
	if result := initializers.DB.Where("category_id = ?", categoryID).Find(&products); result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve products")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"products": products})
}

// UpdateProduct updates an existing product (admin only).
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := initializers.DB.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up product")
		return
	}

	var body productBody
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: title, company and a price greater than 0 are required")
		return
	}

	// Use a map so all provided fields are applied, including boolean fields
	// set to false (GORM's struct Updates would skip zero values).
	updates := map[string]interface{}{
		"title":       body.Title,
		"company":     body.Company,
		"description": body.Description,
		"featured":    body.Featured,
		"image":       body.Image,
		"price":       body.Price,
		"shipping":    body.Shipping,
	}

	if err := initializers.DB.Model(&product).Updates(updates).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update product")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"product": product})
}

// DeleteProduct deletes a product by ID (admin only).
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := initializers.DB.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Product not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up product")
		return
	}

	if err := initializers.DB.Delete(&product).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete product")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
