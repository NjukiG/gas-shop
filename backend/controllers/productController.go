package controllers

import (
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Create  a product
func CreateProduct(c *gin.Context) {
	categoryID := c.Param("id")
	var category models.Category

	myCategory := initializers.DB.Preload("Products").First(&category, categoryID)

	if myCategory.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Category not found",
		})
		return
	}

	var body struct {
		Title       string
		Company     string
		Description string
		Featured    bool
		Image       string
		Price       int
		Shipping    bool
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to read request body",
		})
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

	result := initializers.DB.Create(&product)

	if result.Error != nil {
		c.Status(400)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"New Product": product,
	})
}

// Get all the products
func ListAllProducts(c *gin.Context) {
	var products []models.Product

	result := initializers.DB.Find(&products)

	if result.Error != nil {
		c.Status(400)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Products": products,
	})
}

// Get one product by ID
func GetSingleProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	result := initializers.DB.First(&product, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": "Product not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Product": product,
	})
}

// Get a product based on its category
func GetProductsByCategory(c *gin.Context) {
	categoryID := c.Param("id")
	var products []models.Product

	result := initializers.DB.Where("category_id = ?", categoryID).Find(&products)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": "Products with that category were not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Product": products,
	})
}

func UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Title       string
		Company     string
		Description string
		Featured    bool
		Image       string
		Price       int
		Shipping    bool
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}

	// Find the product we are updating
	var product models.Product
	initializers.DB.First(&product, id)

	// Update attributes with `struct`, will only update non-zero fields
	initializers.DB.Model(&product).Updates(models.Product{
		Title:       body.Title,
		Company:     body.Company,
		Description: body.Description,
		Featured:    body.Featured,
		Image:       body.Image,
		Price:       body.Price,
		Shipping:    body.Shipping,
		// CategoryID:  category.ID,
	})

	c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
	// Get Product id to delete
	id := c.Param("id")

	// Get the task itself
	var product models.Product

	result := initializers.DB.First(&product, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	initializers.DB.Delete(&models.Product{}, id)

	// Respond
	c.Status(http.StatusNoContent)
	c.JSON(200, gin.H{
		"Message": "A product was deleted...",
	})
}
