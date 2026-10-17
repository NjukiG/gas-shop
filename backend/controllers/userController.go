package controllers

import (
	"net/http"
	"time"

	"gas-shop/config"
	"gas-shop/initializers"
	"gas-shop/models"
	"gas-shop/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// RegisterUser creates a new buyer account.
func RegisterUser(c *gin.Context) {
	var body struct {
		FullName string `json:"FullName" binding:"required"`
		Email    string `json:"Email" binding:"required,email"`
		Password string `json:"Password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: name, a valid email, and a password of at least 8 characters are required")
		return
	}

	// Hash the password.
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to process password")
		return
	}

	// The role is always Buyer for public self-registration; it is intentionally
	// NOT taken from the request body so a user cannot escalate to Admin. Admin
	// accounts are provisioned separately.
	user := models.User{
		FullName: body.FullName,
		Role:     models.RoleBuyer,
		Email:    body.Email,
		Password: string(hash),
	}

	if result := initializers.DB.Create(&user); result.Error != nil {
		// Most commonly a duplicate email (unique constraint).
		response.Error(c, http.StatusConflict, "Could not create user; the email may already be registered")
		return
	}

	response.JSON(c, http.StatusCreated, gin.H{"message": "User created successfully"})
}

// Login authenticates a user and returns a signed JWT.
func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"Email" binding:"required,email"`
		Password string `json:"Password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: a valid email and password are required")
		return
	}

	// Look up the requested user.
	var user models.User
	initializers.DB.Preload("Cart.CartItems").First(&user, "email = ?", body.Email)

	// Use a single generic message for both unknown email and wrong password
	// to avoid leaking which accounts exist.
	if user.ID == 0 {
		response.Error(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		response.Error(c, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate a JWT.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	tokenString, err := token.SignedString([]byte(config.Get().JWTSecret))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create authentication token")
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, true)

	response.JSON(c, http.StatusOK, gin.H{
		"message": "Logged in successfully",
		"token":   tokenString,
	})
}

// ValidateUser returns the currently authenticated user with their cart.
func ValidateUser(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	userID := user.(models.User).ID

	var userWithCart models.User
	if err := initializers.DB.Preload("Cart.CartItems.Product").First(&userWithCart, userID).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to load user")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"message": "Authenticated",
		"user":    userWithCart,
	})
}

// LogoutUser clears the authentication cookie.
func LogoutUser(c *gin.Context) {
	c.SetCookie("Authorization", "", -1, "", "", false, true)
	response.JSON(c, http.StatusOK, gin.H{"message": "Logged out successfully"})
}
