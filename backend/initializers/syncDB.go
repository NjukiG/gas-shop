package initializers

import (
	"fmt"

	"gas-shop/models"
)

// SyncDatabase runs GORM AutoMigrate for all application models.
//
// NOTE: AutoMigrate is convenient for development but is generally discouraged
// for production, where schema changes should use versioned migrations
// (e.g. golang-migrate or goose). Introducing versioned migrations is planned
// as a later enhancement.
func SyncDatabase() error {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.Cart{},
		&models.CartItem{},
		&models.ShippingDetail{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		return fmt.Errorf("initializers: failed to migrate database schema: %w", err)
	}

	return nil
}
