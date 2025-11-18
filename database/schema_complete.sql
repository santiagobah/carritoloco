-- ================================================
-- CARRITO LOCO - COMPLETE PRODUCTION DATABASE SCHEMA
-- Full-Stack POS System with Multi-Branch, Inventory, Suppliers & Scrapers
-- ================================================

-- Drop all tables in correct order
DROP TABLE IF EXISTS pos_cash_movements CASCADE;
DROP TABLE IF EXISTS pos_items CASCADE;
DROP TABLE IF EXISTS pos_sales CASCADE;
DROP TABLE IF EXISTS cash_register CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS competitor_prices CASCADE;
DROP TABLE IF EXISTS supplier_prices CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS barcodes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_pass CASCADE;
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- ================================================
-- BRANCHES (Multi-sucursal)
-- ================================================
CREATE TABLE branches (
    branch_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- PERSONAS (Users/People)
-- ================================================
CREATE TABLE personas (
    person_id SERIAL PRIMARY KEY,
    name_p VARCHAR(50) NOT NULL,
    ap_pat VARCHAR(50) NOT NULL,
    ap_mat VARCHAR(50),
    branch_id INT REFERENCES branches(branch_id),
    sell BOOL DEFAULT FALSE,
    buy BOOL DEFAULT TRUE,
    is_active BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- ROLES
-- ================================================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- USER AUTHENTICATION
-- ================================================
CREATE TABLE user_pass (
    person_id INT REFERENCES personas(person_id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOL DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- USER ROLES (Many-to-Many)
-- ================================================
CREATE TABLE user_roles (
    person_id INT REFERENCES personas(person_id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (person_id, role_id)
);

-- ================================================
-- SUPPLIERS
-- ================================================
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    website VARCHAR(255),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    is_active BOOL DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- CATEGORIES
-- ================================================
CREATE TABLE categories (
    cat_id SERIAL PRIMARY KEY,
    name_cat VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT REFERENCES categories(cat_id),
    is_active BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- PRODUCTS
-- ================================================
CREATE TABLE products (
    prod_id SERIAL PRIMARY KEY,
    name_pr VARCHAR(100) NOT NULL,
    description TEXT,
    cat_id INT REFERENCES categories(cat_id),
    person_id INT REFERENCES personas(person_id) ON DELETE SET NULL,
    sku VARCHAR(50) UNIQUE,
    cost_price DECIMAL(10, 2) DEFAULT 0.00,
    sale_price DECIMAL(10, 2) DEFAULT 0.00,
    min_price DECIMAL(10, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    image_url VARCHAR(255),
    is_active BOOL DEFAULT TRUE,
    is_service BOOL DEFAULT FALSE,
    min_stock INT DEFAULT 0,
    max_stock INT DEFAULT 1000,
    reorder_point INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- BARCODES
-- ================================================
CREATE TABLE barcodes (
    barcode_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products(prod_id) ON DELETE CASCADE,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    is_primary BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- INVENTORY (Stock by Branch)
-- ================================================
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products(prod_id) ON DELETE CASCADE,
    branch_id INT REFERENCES branches(branch_id) ON DELETE CASCADE,
    quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    location VARCHAR(50),
    last_count_date DATE,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(prod_id, branch_id)
);

-- ================================================
-- INVENTORY MOVEMENTS (Kardex)
-- ================================================
CREATE TABLE inventory_movements (
    movement_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products(prod_id),
    branch_id INT REFERENCES branches(branch_id),
    movement_type VARCHAR(20) NOT NULL, -- 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'SALE', 'RETURN'
    quantity INT NOT NULL,
    cost_price DECIMAL(10, 2),
    reference_type VARCHAR(50), -- 'PURCHASE_ORDER', 'SALE', 'POS_SALE', 'ADJUSTMENT'
    reference_id INT,
    notes TEXT,
    created_by INT REFERENCES personas(person_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- SUPPLIER PRICES (Web Scraper Data)
-- ================================================
CREATE TABLE supplier_prices (
    price_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products(prod_id) ON DELETE CASCADE,
    supplier_id INT REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    url TEXT,
    availability VARCHAR(50),
    last_scraped TIMESTAMP DEFAULT NOW(),
    is_current BOOL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- COMPETITOR PRICES (Web Scraper Data)
-- ================================================
CREATE TABLE competitor_prices (
    comp_price_id SERIAL PRIMARY KEY,
    prod_id INT REFERENCES products(prod_id) ON DELETE CASCADE,
    competitor_name VARCHAR(100) NOT NULL,
    product_name VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    url TEXT,
    availability VARCHAR(50),
    similarity_score DECIMAL(5,2),
    last_scraped TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- PURCHASE ORDERS
-- ================================================
CREATE TABLE purchase_orders (
    po_id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT REFERENCES suppliers(supplier_id),
    branch_id INT REFERENCES branches(branch_id),
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SENT, RECEIVED, CANCELLED
    total DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    expected_date DATE,
    received_date DATE,
    created_by INT REFERENCES personas(person_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- PURCHASE ORDER ITEMS
-- ================================================
CREATE TABLE purchase_order_items (
    po_item_id SERIAL PRIMARY KEY,
    po_id INT REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    prod_id INT REFERENCES products(prod_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    received_quantity INT DEFAULT 0,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ================================================
-- SALES (Online Sales)
-- ================================================
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    person_id INT REFERENCES personas(person_id) ON DELETE SET NULL,
    branch_id INT REFERENCES branches(branch_id),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- SALE ITEMS
-- ================================================
CREATE TABLE sale_items (
    item_id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(sale_id) ON DELETE CASCADE,
    prod_id INT REFERENCES products(prod_id) ON DELETE SET NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- CASH REGISTER
-- ================================================
CREATE TABLE cash_register (
    register_id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(branch_id),
    opened_by INT REFERENCES personas(person_id),
    closed_by INT REFERENCES personas(person_id),
    opening_cash DECIMAL(10, 2) NOT NULL,
    closing_cash DECIMAL(10, 2),
    expected_cash DECIMAL(10, 2),
    difference DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, CLOSED
    opened_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    notes TEXT
);

-- ================================================
-- POS SALES
-- ================================================
CREATE TABLE pos_sales (
    pos_sale_id SERIAL PRIMARY KEY,
    register_id INT REFERENCES cash_register(register_id),
    branch_id INT REFERENCES branches(branch_id),
    cashier_id INT REFERENCES personas(person_id),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_received DECIMAL(10, 2),
    change_given DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'COMPLETED', -- COMPLETED, REFUNDED, CANCELLED
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- POS ITEMS
-- ================================================
CREATE TABLE pos_items (
    pos_item_id SERIAL PRIMARY KEY,
    pos_sale_id INT REFERENCES pos_sales(pos_sale_id) ON DELETE CASCADE,
    prod_id INT REFERENCES products(prod_id),
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price - discount) STORED
);

-- ================================================
-- POS CASH MOVEMENTS
-- ================================================
CREATE TABLE pos_cash_movements (
    movement_id SERIAL PRIMARY KEY,
    register_id INT REFERENCES cash_register(register_id),
    movement_type VARCHAR(20) NOT NULL, -- SALE, REFUND, DEPOSIT, WITHDRAWAL, OPENING, CLOSING
    amount DECIMAL(10, 2) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    created_by INT REFERENCES personas(person_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX idx_products_cat_id ON products(cat_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_prod_branch ON inventory(prod_id, branch_id);
CREATE INDEX idx_inventory_movements_prod ON inventory_movements(prod_id);
CREATE INDEX idx_inventory_movements_created ON inventory_movements(created_at);
CREATE INDEX idx_barcodes_barcode ON barcodes(barcode);
CREATE INDEX idx_supplier_prices_prod ON supplier_prices(prod_id);
CREATE INDEX idx_competitor_prices_prod ON competitor_prices(prod_id);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_pos_sales_ticket ON pos_sales(ticket_number);
CREATE INDEX idx_pos_sales_created ON pos_sales(created_at);
CREATE INDEX idx_cash_register_status ON cash_register(status);
CREATE INDEX idx_user_pass_email ON user_pass(email);
CREATE INDEX idx_user_roles_person ON user_roles(person_id);

-- ================================================
-- TRIGGERS
-- ================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate subtotal in sale_items
CREATE OR REPLACE FUNCTION calculate_sale_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal = (NEW.quantity * NEW.unit_price) - COALESCE(NEW.discount, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_calculate_sale_subtotal BEFORE INSERT OR UPDATE ON sale_items
FOR EACH ROW EXECUTE FUNCTION calculate_sale_item_subtotal();

-- Update inventory on POS sale
CREATE OR REPLACE FUNCTION update_inventory_on_pos_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'COMPLETED' THEN
        -- Decrease inventory
        UPDATE inventory
        SET quantity = quantity - (
            SELECT SUM(quantity)
            FROM pos_items
            WHERE pos_sale_id = NEW.pos_sale_id AND prod_id = inventory.prod_id
        )
        WHERE branch_id = NEW.branch_id;

        -- Record movement
        INSERT INTO inventory_movements (prod_id, branch_id, movement_type, quantity, reference_type, reference_id, created_by)
        SELECT prod_id, NEW.branch_id, 'OUT', -quantity, 'POS_SALE', NEW.pos_sale_id, NEW.cashier_id
        FROM pos_items
        WHERE pos_sale_id = NEW.pos_sale_id;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_inventory_on_pos_sale
AFTER INSERT ON pos_sales
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_pos_sale();
