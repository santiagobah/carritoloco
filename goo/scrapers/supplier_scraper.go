package scrapers

import (
	"database/sql"
	"fmt"
	"math/rand"
	"time"
)

// SupplierScraper simula el scraping de precios de proveedores
type SupplierScraper struct {
	DB *sql.DB
}

// ScrapePrices simula el scraping de precios de proveedores
// En un caso real, aquí se usaría net/http y goquery para scraping real
func (s *SupplierScraper) ScrapePrices() error {
	fmt.Println("🕷️  Iniciando scraping de precios de proveedores...")

	// Obtener todos los proveedores
	suppliers, err := s.getSuppliers()
	if err != nil {
		return err
	}

	// Obtener todos los productos
	products, err := s.getProducts()
	if err != nil {
		return err
	}

	// Simular scraping para cada proveedor
	for _, supplier := range suppliers {
		fmt.Printf("   Scraping proveedor: %s\n", supplier.Name)

		// Simular que encontramos precios para algunos productos aleatorios
		for _, product := range products {
			// 60% de probabilidad de encontrar el producto en este proveedor
			if rand.Float64() < 0.6 {
				// Generar precio simulado (variación del 80% al 120% del precio de costo)
				variation := 0.8 + rand.Float64()*0.4
				scrapedPrice := product.CostPrice * variation

				// Insertar o actualizar precio
				err := s.updateSupplierPrice(product.ID, supplier.ID, scrapedPrice)
				if err != nil {
					fmt.Printf("      ⚠️  Error actualizando precio: %v\n", err)
					continue
				}
			}
		}
	}

	fmt.Println("✅ Scraping de proveedores completado")
	return nil
}

type Supplier struct {
	ID   int
	Name string
}

type Product struct {
	ID        int
	Name      string
	CostPrice float64
}

func (s *SupplierScraper) getSuppliers() ([]Supplier, error) {
	rows, err := s.DB.Query("SELECT supplier_id, name FROM suppliers WHERE is_active = TRUE")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []Supplier
	for rows.Next() {
		var sup Supplier
		if err := rows.Scan(&sup.ID, &sup.Name); err != nil {
			return nil, err
		}
		suppliers = append(suppliers, sup)
	}

	return suppliers, nil
}

func (s *SupplierScraper) getProducts() ([]Product, error) {
	rows, err := s.DB.Query("SELECT prod_id, name_pr, cost_price FROM products WHERE is_active = TRUE LIMIT 20")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.CostPrice); err != nil {
			return nil, err
		}
		products = append(products, p)
	}

	return products, nil
}

func (s *SupplierScraper) updateSupplierPrice(prodID, supplierID int, price float64) error {
	// Marcar precios antiguos como no actuales
	_, err := s.DB.Exec(`
		UPDATE supplier_prices
		SET is_current = FALSE
		WHERE prod_id = $1 AND supplier_id = $2
	`, prodID, supplierID)
	if err != nil {
		return err
	}

	// Insertar nuevo precio
	_, err = s.DB.Exec(`
		INSERT INTO supplier_prices (prod_id, supplier_id, price, url, availability, is_current)
		VALUES ($1, $2, $3, $4, $5, TRUE)
	`, prodID, supplierID, price, fmt.Sprintf("https://proveedor%d.com/product/%d", supplierID, prodID), "in_stock")

	return err
}

// RunScheduled ejecuta el scraper cada X horas
func (s *SupplierScraper) RunScheduled(hours int) {
	ticker := time.NewTicker(time.Duration(hours) * time.Hour)
	defer ticker.Stop()

	// Ejecutar una vez al inicio
	if err := s.ScrapePrices(); err != nil {
		fmt.Printf("❌ Error en scraping inicial: %v\n", err)
	}

	// Ejecutar periódicamente
	for range ticker.C {
		if err := s.ScrapePrices(); err != nil {
			fmt.Printf("❌ Error en scraping periódico: %v\n", err)
		}
	}
}
