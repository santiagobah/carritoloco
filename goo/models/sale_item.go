package models

// SaleItem representa un producto dentro de una venta
type SaleItem struct {
	ItemID   int     `json:"item_id"`
	SaleID   int     `json:"sale_id"`
	ProdID   int     `json:"prod_id"`
	Barcode  string  `json:"barcode"`
	Qty      int     `json:"qty"`
	Price    float64 `json:"price"`
	Discount float64 `json:"discount"`
}
