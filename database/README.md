# 🗄️ Database Setup - Carrito Loco

## Quick Setup

```bash
# Crear la base de datos
psql -U postgres -c "DROP DATABASE IF EXISTS carritoloco;"
psql -U postgres -c "CREATE DATABASE carritoloco;"

# levantarla
psql -U postgres -d carritoloco -f database/schema.sql

# cargar los primeros datos
psql -U postgres -d carritoloco -f database/seed.sql
```

## One-Line Setup

```bash
psql -U postgres << 'EOF'
DROP DATABASE IF EXISTS carritoloco;
CREATE DATABASE carritoloco;
\c carritoloco
\i database/schema.sql
\i database/seed.sql
EOF
```

## Tables Structure

- **personas** - Users/people in the system
- **user_pass** - Authentication credentials
- **categor** - Product categories
- **products** - Product catalog
- **barcodes** - Product barcodes
- **sales** - Sales transactions
- **sale_items** - Items in each sale

## Environment Variables

Create `.env.local` in `/frontend`:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=carritoloco
DB_PORT=5432

JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=7d
```
