DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS barcodes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categor CASCADE;
DROP TABLE IF EXISTS user_pass CASCADE;
DROP TABLE IF EXISTS bank_person CASCADE;
DROP TABLE IF EXISTS personal_data CASCADE;
DROP TABLE IF EXISTS specific_personal_data CASCADE;
DROP TABLE IF EXISTS personas CASCADE;

CREATE TABLE personas (
    person_id SERIAL PRIMARY KEY,
    name_p VARCHAR(50) NOT NULL,
    ap_pat VARCHAR(50) NOT NULL,
    ap_mat VARCHAR(50),
    sell BOOL DEFAULT FALSE,
    buy BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_pass (
    person_id INT REFERENCES personas(person_id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bank_person (
    person_id INT REFERENCES personas(person_id) ON DELETE CASCADE UNIQUE,
    num_card VARCHAR(20) NOT NULL,
    exp_date VARCHAR(5) NOT NULL,
    cvv VARCHAR(4)
);

CREATE TABLE specific_personal_data (
    data_id SERIAL PRIMARY KEY,
    street VARCHAR(100) NOT NULL,
    colonia VARCHAR(100) NOT NULL,
    number VARCHAR(10),
    cp VARCHAR(10)
);

CREATE TABLE personal_data (
    person_id INT REFERENCES personas(person_id) ON DELETE CASCADE UNIQUE,
    estado VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    data_id INT REFERENCES specific_personal_data(data_id)
);

CREATE TABLE categor (
    cat_id SERIAL PRIMARY KEY,
    name_cat VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    prod_id SERIAL PRIMARY KEY,
    name_pr VARCHAR(100) NOT NULL,
    description TEXT,
    cat_id INT REFERENCES categor(cat_id),
    person_id INT REFERENCES personas(person_id) ON DELETE SET NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE barcodes (
    barcode_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products(prod_id) ON DELETE CASCADE,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    person_id INT REFERENCES personas(person_id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE sale_items (
    item_id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(sale_id) ON DELETE CASCADE,
    prod_id INT REFERENCES products(prod_id) ON DELETE SET NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_cat_id ON products(cat_id);
CREATE INDEX idx_products_person_id ON products(person_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_barcodes_barcode ON barcodes(barcode);
CREATE INDEX idx_sales_person_id ON sales(person_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_prod_id ON sale_items(prod_id);
CREATE INDEX idx_user_pass_email ON user_pass(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION calculate_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal = NEW.quantity * NEW.unit_price;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_calculate_subtotal
BEFORE INSERT OR UPDATE ON sale_items
FOR EACH ROW EXECUTE FUNCTION calculate_subtotal();
