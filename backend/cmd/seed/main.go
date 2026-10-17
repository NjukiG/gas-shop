// Command seed populates the database with sample ScentCity fragrance data.
//
// It is idempotent-ish for development: it clears existing categories and
// products (and dependent cart/order rows) and inserts a fresh catalog. User
// accounts are left untouched.
//
// Usage (from the backend directory):
//
//	go run ./cmd/seed
//
// Images use placeholder URLs; real product images will be managed via the
// admin UI later.
package main

import (
	"log"

	"gas-shop/config"
	"gas-shop/initializers"
	"gas-shop/models"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("seed: %v", err)
	}
	config.Set(cfg)

	if err := initializers.ConnectToDB(cfg.DatabaseURL); err != nil {
		log.Fatalf("seed: %v", err)
	}
	if err := initializers.SyncDatabase(); err != nil {
		log.Fatalf("seed: %v", err)
	}

	db := initializers.DB

	// Clear catalog and dependent rows (leave users intact).
	log.Println("seed: clearing existing catalog and cart/order data...")
	statements := []string{
		"DELETE FROM order_items",
		"DELETE FROM orders",
		"DELETE FROM cart_items",
		"DELETE FROM carts",
		"DELETE FROM products",
		"DELETE FROM categories",
	}
	for _, s := range statements {
		if err := db.Exec(s).Error; err != nil {
			log.Fatalf("seed: failed clearing data (%q): %v", s, err)
		}
	}

	// Categories.
	forHer := models.Category{Title: "For Her"}
	forHim := models.Category{Title: "For Him"}
	unisex := models.Category{Title: "Unisex"}
	for _, cat := range []*models.Category{&forHer, &forHim, &unisex} {
		if err := db.Create(cat).Error; err != nil {
			log.Fatalf("seed: failed creating category %q: %v", cat.Title, err)
		}
	}

	// Placeholder image helper (fragrance-themed placeholder).
	img := func(label string) string {
		return "https://placehold.co/600x600/1a1a2e/eaeaea?text=" + label
	}

	// Prices are stored in cents (KES). e.g. 1850000 => KES 18,500.00
	products := []models.Product{
		// For Her
		{Title: "Rose Noir", Brand: "Maison Lumière", Description: "A velvety rose wrapped in warm amber and soft musk.", Featured: true, Image: img("Rose+Noir"), Price: 1850000, Shipping: true, Size: "100ml", Concentration: models.ConcentrationEDP, ScentNotes: "Top: Bulgarian Rose; Heart: Peony, Lychee; Base: Amber, White Musk", CategoryID: forHer.ID},
		{Title: "Jardin de Minuit", Brand: "Fleur & Co.", Description: "A luminous white-floral bouquet for evening wear.", Featured: false, Image: img("Jardin"), Price: 1420000, Shipping: true, Size: "75ml", Concentration: models.ConcentrationEDP, ScentNotes: "Top: Bergamot; Heart: Jasmine, Tuberose; Base: Sandalwood, Vanilla", CategoryID: forHer.ID},
		{Title: "Soleil Doré", Brand: "Côte d'Or", Description: "Sunlit citrus and orange blossom with a honeyed finish.", Featured: true, Image: img("Soleil"), Price: 980000, Shipping: true, Size: "50ml", Concentration: models.ConcentrationEDT, ScentNotes: "Top: Mandarin, Neroli; Heart: Orange Blossom; Base: Honey, Musk", CategoryID: forHer.ID},
		{Title: "Velvet Oud Rose", Brand: "Attar Royale", Description: "Opulent rose and oud for a bold signature.", Featured: false, Image: img("Velvet+Oud"), Price: 2650000, Shipping: true, Size: "100ml", Concentration: models.ConcentrationParfum, ScentNotes: "Top: Saffron; Heart: Rose, Oud; Base: Patchouli, Amber", CategoryID: forHer.ID},

		// For Him
		{Title: "Noir Intense", Brand: "Atelier Noir", Description: "A smoky leather and spice composition with depth.", Featured: true, Image: img("Noir+Intense"), Price: 1990000, Shipping: true, Size: "100ml", Concentration: models.ConcentrationEDP, ScentNotes: "Top: Black Pepper, Bergamot; Heart: Leather, Cardamom; Base: Vetiver, Tonka", CategoryID: forHim.ID},
		{Title: "Cedre Sauvage", Brand: "Boisé", Description: "Crisp cedar and vetiver with a cool aromatic edge.", Featured: false, Image: img("Cedre"), Price: 1350000, Shipping: true, Size: "75ml", Concentration: models.ConcentrationEDT, ScentNotes: "Top: Grapefruit, Mint; Heart: Cedar, Geranium; Base: Vetiver, Musk", CategoryID: forHim.ID},
		{Title: "Marine Bleu", Brand: "Littoral", Description: "A fresh aquatic scent evoking sea breeze and salt.", Featured: true, Image: img("Marine"), Price: 890000, Shipping: true, Size: "50ml", Concentration: models.ConcentrationEDT, ScentNotes: "Top: Sea Notes, Lemon; Heart: Rosemary, Lavender; Base: Driftwood, Ambergris", CategoryID: forHim.ID},
		{Title: "Tabac & Cuir", Brand: "Atelier Noir", Description: "Rich tobacco and leather for cold evenings.", Featured: false, Image: img("Tabac"), Price: 2290000, Shipping: true, Size: "100ml", Concentration: models.ConcentrationParfum, ScentNotes: "Top: Rum, Cinnamon; Heart: Tobacco Leaf; Base: Leather, Oakmoss", CategoryID: forHim.ID},

		// Unisex
		{Title: "Santal 33°", Brand: "Neutra", Description: "A warm, creamy sandalwood modern classic.", Featured: true, Image: img("Santal"), Price: 2450000, Shipping: true, Size: "100ml", Concentration: models.ConcentrationEDP, ScentNotes: "Top: Cardamom, Iris; Heart: Sandalwood, Violet; Base: Cedar, Leather", CategoryID: unisex.ID},
		{Title: "Fig & Fir", Brand: "Verdant", Description: "Green fig leaves and fir balsam, fresh and earthy.", Featured: false, Image: img("Fig+Fir"), Price: 1180000, Shipping: true, Size: "75ml", Concentration: models.ConcentrationEDT, ScentNotes: "Top: Fig Leaf, Green Notes; Heart: Fir, Coconut; Base: Cedar, Musk", CategoryID: unisex.ID},
		{Title: "Encens Blanc", Brand: "Rituel", Description: "Smoky white incense with a serene, meditative aura.", Featured: true, Image: img("Encens"), Price: 2050000, Shipping: true, Size: "100ml", Concentration: models.ConcentrationEDP, ScentNotes: "Top: Pink Pepper; Heart: Incense, Elemi; Base: Benzoin, Amber", CategoryID: unisex.ID},
		{Title: "Citron Vert", Brand: "Côte d'Or", Description: "Zesty lime and basil, bright and uplifting.", Featured: false, Image: img("Citron"), Price: 760000, Shipping: true, Size: "50ml", Concentration: models.ConcentrationEDC, ScentNotes: "Top: Lime, Basil; Heart: Petitgrain; Base: White Musk", CategoryID: unisex.ID},
	}

	for i := range products {
		if err := db.Create(&products[i]).Error; err != nil {
			log.Fatalf("seed: failed creating product %q: %v", products[i].Title, err)
		}
	}

	log.Printf("seed: done. Created 3 categories and %d products.", len(products))
}
