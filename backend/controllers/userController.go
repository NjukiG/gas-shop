package controllers

import (
	"gas-shop/config"
	"gas-shop/initializers"
	"gas-shop/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Func to register a new user
func RegisterUser(c *gin.Context) {
	var body struct {
		FullName string
		Role     models.Role
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to read request body",
		})
		return
	}

	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to hash the password",
		})
		return
	}
	// Create a new User
	user := models.User{
		FullName: body.FullName,
		Role:     body.Role,
		Email:    body.Email,
		Password: string(hash),
	}

	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Error": "Failed to create a new user",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"Message": "New user created",
	})
}

// Func to Login the user
func Login(c *gin.Context) {

	// Get email and password of the user
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Failed to read the body request...",
		})
		return
	}

	// Lookup requested user
	var user models.User

    initializers.DB.Preload("Cart.CartItems").First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Invalid email or password (or something else)",
		})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": "Invalid email or password (prolly password)",
		})
		return
	}

	// Compare send in password with hashed password
	// Generate a JWT Token

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString([]byte(config.Get().JWTSecret))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to create token",
		})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, true)

	// Send it back
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Logged In",
		"token":   tokenString, // Dont Show token
	})
}

// Func to  validate that user is actually logged in.
func ValidateUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"Error": "User not authenticated"})
		return
	}

	userID := user.(models.User).ID

	var userWithCart models.User
	if err := initializers.DB.Preload("Cart.CartItems.Product").First(&userWithCart, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to load user with cart", "Detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Message": "I am Logged in...",
		"user":    userWithCart,
	})
}

// Logout function
func LogoutUser(c *gin.Context) {
	c.SetCookie("Authorization", "", -1, "", "", false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
