package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"gas-shop/config"
	"gas-shop/initializers"
	"gas-shop/models"
	"gas-shop/response"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime"
	"github.com/aws/aws-sdk-go-v2/service/bedrockruntime/types"
	"github.com/gin-gonic/gin"
)

// ScentFinder takes a free-text description of what the customer wants and uses
// Amazon Bedrock to recommend fragrances FROM OUR ACTUAL CATALOG. The model is
// grounded on our real products (with their notes), so it can only recommend
// scents we actually sell.
func ScentFinder(c *gin.Context) {
	var body struct {
		Preferences string `json:"preferences" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.Error(c, http.StatusBadRequest, "Please describe what kind of scent you're looking for")
		return
	}
	if len(body.Preferences) > 500 {
		response.Error(c, http.StatusBadRequest, "Please keep your description under 500 characters")
		return
	}

	// Load our catalog to ground the model.
	var products []models.Product
	if err := initializers.DB.Find(&products).Error; err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to load catalog")
		return
	}
	if len(products) == 0 {
		response.Error(c, http.StatusServiceUnavailable, "No fragrances available to recommend yet")
		return
	}

	prompt := buildScentPrompt(products, body.Preferences)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 25*time.Second)
	defer cancel()

	cfg := config.Get()
	awsCfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(cfg.AWSRegion))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to initialize AI service")
		return
	}

	client := bedrockruntime.NewFromConfig(awsCfg)

	// The Converse API is model-agnostic: the same request shape works across
	// Bedrock model families (Nova, Titan, Claude, etc.).
	out, err := client.Converse(ctx, &bedrockruntime.ConverseInput{
		ModelId: &cfg.BedrockModelID,
		Messages: []types.Message{
			{
				Role: types.ConversationRoleUser,
				Content: []types.ContentBlock{
					&types.ContentBlockMemberText{Value: prompt},
				},
			},
		},
		InferenceConfig: &types.InferenceConfiguration{
			MaxTokens:   aws32(500),
			Temperature: aws32f(0.7),
		},
	})
	if err != nil {
		response.Error(c, http.StatusBadGateway, "The scent finder is unavailable right now. Please try again.")
		return
	}

	recommendation := extractText(out)
	if recommendation == "" {
		response.Error(c, http.StatusBadGateway, "Could not generate a recommendation. Please try again.")
		return
	}

	response.JSON(c, http.StatusOK, gin.H{"recommendation": recommendation})
}

// buildScentPrompt constructs a grounded prompt listing our real products.
func buildScentPrompt(products []models.Product, preferences string) string {
	var sb strings.Builder
	sb.WriteString("You are a knowledgeable fragrance consultant for ScentCity, an online perfume store. ")
	sb.WriteString("Recommend 2 to 3 fragrances ONLY from the list below that best match the customer's request. ")
	sb.WriteString("For each, give a one-sentence reason tied to their request. Be warm and concise. ")
	sb.WriteString("Do NOT invent fragrances that are not in the list.\n\n")
	sb.WriteString("Available fragrances:\n")
	for _, p := range products {
		notes := p.ScentNotes
		if notes == "" {
			notes = "n/a"
		}
		sb.WriteString(fmt.Sprintf("- %s by %s (%s, %s). Notes: %s\n",
			p.Title, p.Brand, p.Concentration, p.Size, notes))
	}
	sb.WriteString("\nCustomer request: ")
	sb.WriteString(preferences)
	return sb.String()
}

// extractText pulls the assistant's text out of a Converse response.
func extractText(out *bedrockruntime.ConverseOutput) string {
	if out == nil || out.Output == nil {
		return ""
	}
	msg, ok := out.Output.(*types.ConverseOutputMemberMessage)
	if !ok {
		return ""
	}
	var sb strings.Builder
	for _, block := range msg.Value.Content {
		if tb, ok := block.(*types.ContentBlockMemberText); ok {
			sb.WriteString(tb.Value)
		}
	}
	return strings.TrimSpace(sb.String())
}

func aws32(v int32) *int32     { return &v }
func aws32f(v float32) *float32 { return &v }
