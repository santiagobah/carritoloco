package models

import "time"

// Sale representa la cabecera de una venta (POS)
type Sale struct {
	SaleID        int       `json:"sale_id"`
	CreatedAt     time.Time `json:"created_at"`
	Cashier       string    `json:"cashier"`
	Total         float64   `json:"total"`
	PaymentMethod string    `json:"payment_method"`
	Status        string    `json:"status"`
}
