package initializers

import (
	"gas-shop/models"
	"log"
)

func SyncDatabase() {
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
		log.Fatal("Failed to sync database", err)
	}
}
