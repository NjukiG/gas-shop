package controllers

import (
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateCategory(c *gin.Context) {
	var body struct {
		Title    string
		Products []models.Product
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}

	// Get the user's id to add the category with
	// user, _ := c.Get("user")

	category := models.Category{
		Title: body.Title,
		// UserID: user.(models.User).ID,
	}

	result := initializers.DB.Create(&category)

	if result.Error != nil {
		c.Status(400)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"New Category": category,
	})
}

// Get all categories

func GetAllCategories(c *gin.Context) {
	// Get owner of the category
	// userID, exists := c.Get("user")

	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
	// 	return
	// }

	var categories []models.Category

	result := initializers.DB.Preload("Products").Find(&categories)

	if result.Error != nil {
		c.Status(400)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Categories": categories,
	})
}

// Get category by ID
func GetCategoryByID(c *gin.Context) {
	// Get owner of the category
	// userID, exists := c.Get("user")

	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
	// 	return
	// }
	// Get ID of the category
	id := c.Param("id")

	var category models.Category

	result := initializers.DB.Preload("Products").First(&category, id)

	if result.Error != nil {
		c.Status(400)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Category": category,
	})
}
