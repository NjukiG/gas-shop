package controllers

import (
	"errors"
	"net/http"

	"gas-shop/config"
	"gas-shop/initializers"
	"gas-shop/models"
	"gas-shop/pricing"
	"gas-shop/response"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/paymentintent"
	"gorm.io/gorm"
)

// CreatePaymentIntent computes the authenticated user's cart total and creates
// a Stripe PaymentIntent for it, returning the client secret the frontend needs
// to confirm the card payment.
func CreatePaymentIntent(c *gin.Context) {
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

	// Compute the authoritative total (subtotal + shipping + tax) in cents.
	subtotal := 0
	for _, item := range cart.CartItems {
		subtotal += item.Product.Price * item.Quantity
	}
	breakdown := pricing.Compute(subtotal)

	// Configure Stripe with the secret key.
	stripe.Key = config.Get().StripeSecretKey

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(breakdown.Total)),
		Currency: stripe.String(string(stripe.CurrencyKES)),
		// Enable automatic payment methods but disallow redirect-based ones, so
		// card payments confirm in-page without needing a return_url.
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled:        stripe.Bool(true),
			AllowRedirects: stripe.String("never"),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to initiate payment")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{
		"clientSecret":    pi.ClientSecret,
		"paymentIntentId": pi.ID,
		"amount":          breakdown.Total,
	})
}
