package models

import "gorm.io/gorm"

type Role string

const (
	RoleBuyer Role = "Buyer"
	RoleAdmin Role = "Admin"
)

// User Object/Model
type User struct {
	gorm.Model
	FullName  string     `gorm:"not null"`
	Email     string     `gorm:"unique;not null"`
	Password  string     `gorm:"not null"`
	Role      Role       `gorm:"not null"`
	Cart      Cart       `gorm:"foreignKey:UserID"`
	CartItems []CartItem `json:"cart_items" gorm:"foreignKey:CartID"`
}

// Category struct/ object
type Category struct {
	gorm.Model
	Title    string    `gorm:"not null"`
	Products []Product `gorm:"foreignKey:CategoryID"`
}

type Product struct {
	gorm.Model
	Title       string `gorm:"not null"`
	Company     string `gorm:"not null"`
	Description string `json:"description"`
	Featured    bool   `json:"featured"`
	Image       string `gorm:"not null"`
	Price       int    `gorm:"not null"`
	Shipping    bool   `gorm:"not null"`
	CategoryID  uint
}

// Cart Model
type Cart struct {
	gorm.Model
	UserID    uint       `json:"user_id"`
	CartItems []CartItem `json:"cart_items" gorm:"foreignKey:CartID;constraint:OnDelete:CASCADE;"`
}

// CartItem Model
type CartItem struct {
	gorm.Model
	CartID    uint    `json:"cart_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	Quantity  int     `json:"quantity" gorm:"not null;default:1"`
	UserID    uint    `json:"user_id"`
}

// Shipping details

type ShippingDetail struct {
	gorm.Model
	UserID      uint   `gorm:"not null"`
	Address     string `gorm:"not null"`
	City        string `gorm:"not null"`
	State       string `gorm:"not null"`
	PostalCode  string `gorm:"not null"`
	Country     string `gorm:"not null"`
	PhoneNumber string `gorm:"not null"`
	User        User   `gorm:"foreignKey:UserID"`
}

type OrderStatus string

const (
	OrderPending   OrderStatus = "Pending"
	OrderProcessed OrderStatus = "Processed"
	OrderShipped   OrderStatus = "Shipped"
	OrderDelivered OrderStatus = "Delivered"
	OrderCancelled OrderStatus = "Cancelled"
)

type Order struct {
	gorm.Model
	UserID           uint
	TotalPrice       int
	Status           string         `gorm:"default:'pending'"`
	ShippingDetail   ShippingDetail `gorm:"foreignKey:ShippingDetailID"`
	ShippingDetailID uint
	OrderItems       []OrderItem `gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	gorm.Model
	OrderID   uint
	ProductID uint
	Product   Product `gorm:"foreignKey:ProductID"`
	Quantity  int
	Price     int
}
