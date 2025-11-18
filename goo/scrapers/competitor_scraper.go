package scrapers

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"time"
)

// CompetitorScraper simula el scraping de precios de competidores (Amazon, MercadoLibre)
type CompetitorScraper struct {
	DB *sql.DB
}

// ScrapeCompetitors simula el scraping de competidores con fuzzy matching
func (c *CompetitorScraper) ScrapeCompetitors() error {
	fmt.Println("🕷️  Iniciando scraping de competidores (Amazon, MercadoLibre)...")

	competitors := []string{"Amazon México", "MercadoLibre", "Walmart", "Coppel"}
	products, err := c.getProducts()
	if err != nil {
		return err
	}

	for _, competitor := range competitors {
		fmt.Printf("   Scraping competidor: %s\n", competitor)

		for _, product := range products {
			// 40% de probabilidad de encontrar producto similar
			if rand.Float64() < 0.4 {
				// Simular fuzzy matching (similaridad del nombre)
				similarity := c.calculateSimilarity(product.Name)

				// Generar precio de competidor (variación del 90% al 130% del precio de venta)
				variation := 0.9 + rand.Float64()*0.4
				competitorPrice := product.SalePrice * variation

				// Insertar precio de competidor
				err := c.insertCompetitorPrice(product.ID, competitor, product.Name, competitorPrice, similarity)
				if err != nil {
					fmt.Printf("      ⚠️  Error guardando precio: %v\n", err)
				}
			}
		}
	}

	fmt.Println("✅ Scraping de competidores completado")
	return nil
}

type ProductFull struct {
	ID        int
	Name      string
	SalePrice float64
}

func (c *CompetitorScraper) getProducts() ([]ProductFull, error) {
	rows, err := c.DB.Query("SELECT prod_id, name_pr, sale_price FROM products WHERE is_active = TRUE LIMIT 20")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []ProductFull
	for rows.Next() {
		var p ProductFull
		if err := rows.Scan(&p.ID, &p.Name, &p.SalePrice); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

// calculateSimilarity simula fuzzy matching (Levenshtein simplificado)
func (c *CompetitorScraper) calculateSimilarity(productName string) float64 {
	// En un caso real, se usaría un algoritmo de fuzzy matching como Levenshtein
	// Aquí simulamos una similaridad aleatoria entre 75% y 95%
	return 75.0 + rand.Float64()*20.0
}

func (c *CompetitorScraper) insertCompetitorPrice(prodID int, competitor, productName string, price, similarity float64) error {
	// Generar URL simulada
	urlSlug := strings.ToLower(strings.ReplaceAll(productName, " ", "-"))
	var url string
	switch competitor {
	case "Amazon México":
		url = fmt.Sprintf("https://amazon.com.mx/dp/%d-%s", rand.Intn(10000), urlSlug)
	case "MercadoLibre":
		url = fmt.Sprintf("https://mercadolibre.com.mx/MLM-%d-%s", rand.Intn(100000000), urlSlug)
	default:
		url = fmt.Sprintf("https://%s.com.mx/product/%s", strings.ToLower(competitor), urlSlug)
	}

	availability := "in_stock"
	if rand.Float64() < 0.1 {
		availability = "out_of_stock"
	}

	_, err := c.DB.Exec(`
		INSERT INTO competitor_prices (prod_id, competitor_name, product_name, price, url, availability, similarity_score)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, prodID, competitor, productName, price, url, availability, similarity)

	return err
}

// RunScheduled ejecuta el scraper cada X horas
func (c *CompetitorScraper) RunScheduled(hours int) {
	ticker := time.NewTicker(time.Duration(hours) * time.Hour)
	defer ticker.Stop()

	// Ejecutar una vez al inicio
	if err := c.ScrapeCompetitors(); err != nil {
		fmt.Printf("❌ Error en scraping inicial de competidores: %v\n", err)
	}

	// Ejecutar periódicamente
	for range ticker.C {
		if err := c.ScrapeCompetitors(); err != nil {
			fmt.Printf("❌ Error en scraping periódico de competidores: %v\n", err)
		}
	}
}

// GetBestPrices devuelve los mejores precios entre competidores para un producto
func (c *CompetitorScraper) GetBestPrices(prodID int, limit int) ([]map[string]interface{}, error) {
	rows, err := c.DB.Query(`
		SELECT competitor_name, product_name, price, url, availability, similarity_score
		FROM competitor_prices
		WHERE prod_id = $1
		ORDER BY price ASC, similarity_score DESC
		LIMIT $2
	`, prodID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var competitor, productName, url, availability string
		var price, similarity float64
		if err := rows.Scan(&competitor, &productName, &price, &url, &availability, &similarity); err != nil {
			return nil, err
		}

		results = append(results, map[string]interface{}{
			"competitor":   competitor,
			"product_name": productName,
			"price":        price,
			"url":          url,
			"availability": availability,
			"similarity":   similarity,
		})
	}

	return results, nil
}
