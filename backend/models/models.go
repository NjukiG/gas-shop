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
	FullName string `gorm:"not null"`
	Email    string `gorm:"unique;not null"`
	Password string `gorm:"not null" json:"-"` // never serialize the password hash
	Role     Role   `gorm:"not null"`
	Cart     Cart   `gorm:"foreignKey:UserID"`
}

// Category struct/ object
type Category struct {
	gorm.Model
	Title    string    `gorm:"not null"`
	Products []Product `gorm:"foreignKey:CategoryID"`
}

// Concentration is the fragrance strength classification.
type Concentration string

const (
	ConcentrationParfum  Concentration = "Parfum"       // Extrait de Parfum, strongest
	ConcentrationEDP     Concentration = "Eau de Parfum"
	ConcentrationEDT     Concentration = "Eau de Toilette"
	ConcentrationEDC     Concentration = "Eau de Cologne"
)

type Product struct {
	gorm.Model
	Title       string        `gorm:"not null"`                 // fragrance name
	Brand       string        `gorm:"not null"`                 // e.g. Dior, Chanel
	Description string        `json:"description"`
	Featured    bool          `json:"featured"`
	Image       string        `gorm:"not null"`
	Price       int           `gorm:"not null"`                 // in cents
	Shipping    bool          `gorm:"not null"`
	Size        string        `json:"size"`                     // e.g. "50ml", "100ml"
	Concentration Concentration `json:"concentration"`          // EDT / EDP / Parfum / Cologne
	ScentNotes  string        `json:"scent_notes"`              // top/heart/base notes
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

// PaymentStatus tracks the payment state of an order.
type PaymentStatus string

const (
	PaymentPending PaymentStatus = "pending"
	PaymentPaid    PaymentStatus = "paid"
	PaymentFailed  PaymentStatus = "failed"
)

type Order struct {
	gorm.Model
	UserID           uint
	User             User           `gorm:"foreignKey:UserID"`
	Subtotal         int            // sum of line items, in cents
	Shipping         int            // shipping cost, in cents
	Tax              int            // tax amount, in cents
	TotalPrice       int            // subtotal + shipping + tax, in cents
	Status           string         `gorm:"default:'pending'"`
	PaymentStatus    PaymentStatus  `gorm:"default:'pending'"` // pending / paid / failed
	PaymentIntentID  string         // Stripe PaymentIntent id
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
