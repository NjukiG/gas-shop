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

// CreateCategory creates a new category (admin only).
func CreateCategory(c *gin.Context) {
	var body struct {
		Title string `json:"Title" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a title is required")
		return
	}

	category := models.Category{Title: body.Title}

	if result := initializers.DB.Create(&category); result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create category")
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{"category": category})
}

// GetAllCategories returns all categories with their products.
func GetAllCategories(c *gin.Context) {
	var categories []models.Category

	if result := initializers.DB.Preload("Products").Find(&categories); result.Error != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve categories")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"categories": categories})
}

// GetCategoryByID returns a single category with its products.
func GetCategoryByID(c *gin.Context) {
	id := c.Param("id")

	var category models.Category
	result := initializers.DB.Preload("Products").First(&category, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve category")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"category": category})
}

// UpdateCategory updates a category's title (admin only).
func UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var category models.Category
	if err := initializers.DB.First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up category")
		return
	}

	var body struct {
		Title string `json:"Title" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a title is required")
		return
	}

	category.Title = body.Title
	if err := initializers.DB.Save(&category).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update category")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"category": category})
}

// DeleteCategory deletes a category (admin only). A category that still has
// products cannot be deleted, to avoid orphaning those products.
func DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	var category models.Category
	if err := initializers.DB.First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.Error(c, http.StatusNotFound, "Category not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to look up category")
		return
	}

	var productCount int64
	if err := initializers.DB.Model(&models.Product{}).Where("category_id = ?", category.ID).Count(&productCount).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to check category products")
		return
	}
	if productCount > 0 {
		response.Error(c, http.StatusConflict, "Cannot delete a category that still has products; move or delete them first")
		return
	}

	if err := initializers.DB.Delete(&category).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete category")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"message": "Category deleted successfully"})
}
