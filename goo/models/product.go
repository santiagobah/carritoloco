package models

type Product struct {
	ID       int     `json:"prod_id"`
	Name     string  `json:"name_pr"`
	Cat      string  `json:"cat"`
	CatID    int     `json:"cat_id"`
	PersonID int     `json:"person_id"`
	Barcode  string  `json:"barcode"`
	Price    float64 `json:"price"`
	Stock    int     `json:"stock"`
}
