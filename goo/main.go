package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"pos-go/db"
	"pos-go/handlers"

	"github.com/joho/godotenv"
)

func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

func productsHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	handlers.GetAllProducts(w, r)
}

func productHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	handlers.GetProductByBarcode(w, r)
}

func salesHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)
	handlers.CreateSale(w, r)
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("⚠️ No .env file found or error loading it: %v", err)
	}

	if err := db.Connect(); err != nil {
		log.Fatalf("❌ Error connecting to PostgreSQL DB: %v", err)
	}
	fmt.Println("✅ Conexión exitosa a PostgreSQL")

	http.HandleFunc("/api/products", productsHandler)
	http.HandleFunc("/api/product", productHandler)
	http.HandleFunc("/api/sales", salesHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4001"
	}
	fmt.Printf("🚀 POS backend corriendo en http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
