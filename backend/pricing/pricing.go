// Package pricing centralizes order pricing rules (shipping and tax) so the
// cart preview and the final order are always computed the same way. The
// backend is the single source of truth; the frontend displays what it returns.
//
// All amounts are in cents.
package pricing

const (
	// ShippingFlat is a flat shipping fee in cents (KES 150.00).
	ShippingFlat = 150 * 100

	// TaxRatePercent is the tax rate applied to the subtotal, as a percentage.
	TaxRatePercent = 10
)

// Breakdown holds a fully computed order total.
type Breakdown struct {
	Subtotal int `json:"subtotal"`
	Shipping int `json:"shipping"`
	Tax      int `json:"tax"`
	Total    int `json:"total"`
}

// Compute returns the shipping, tax and total for a given subtotal (in cents).
// An empty cart (subtotal 0) incurs no shipping or tax.
func Compute(subtotal int) Breakdown {
	if subtotal <= 0 {
		return Breakdown{}
	}

	tax := (subtotal * TaxRatePercent) / 100
	return Breakdown{
		Subtotal: subtotal,
		Shipping: ShippingFlat,
		Tax:      tax,
		Total:    subtotal + ShippingFlat + tax,
	}
}
