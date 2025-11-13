package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"pos-go/db"
	"pos-go/models"
)

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func GetAllProducts(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	rows, err := db.DB.Query(`
        SELECT p.prod_id, p.name_pr, p.cat, p.cat_id, p.person_id, b.barcode
        FROM products p
        LEFT JOIN barcodes b ON p.prod_id = b.prod_id
    `)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Name, &p.Cat, &p.CatID, &p.PersonID, &p.Barcode)
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func GetProductByBarcode(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == "OPTIONS" {
		return
	}

	barcode := r.URL.Query().Get("code")
	var p models.Product
	err := db.DB.QueryRow(`
        SELECT p.prod_id, p.name_pr, p.cat, p.cat_id, p.person_id, b.barcode
        FROM products p
        JOIN barcodes b ON p.prod_id = b.prod_id
        WHERE b.barcode = $1
    `, barcode).Scan(&p.ID, &p.Name, &p.Cat, &p.CatID, &p.PersonID, &p.Barcode)
	if err != nil {
		http.Error(w, fmt.Sprintf("Producto no encontrado: %s", barcode), 404)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
