// Package response provides small helpers for returning consistent JSON
// responses across all HTTP handlers.
//
// Every error response uses the same shape:
//
//	{"error": "human readable message"}
//
// Success responses are returned with a caller-provided payload under a
// meaningful lowercase key (e.g. "products", "order"), keeping the API
// predictable for clients.
package response

import "github.com/gin-gonic/gin"

// Error writes a standardized error response with the given HTTP status code.
func Error(c *gin.Context, status int, message string) {
	c.AbortWithStatusJSON(status, gin.H{"error": message})
}

// JSON writes a success response with the given HTTP status code and payload.
// The payload is typically a gin.H built with a meaningful lowercase key.
func JSON(c *gin.Context, status int, payload gin.H) {
	c.JSON(status, payload)
}
