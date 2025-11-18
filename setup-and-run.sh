#!/bin/bash

set -e  # Exit on error

echo "🚀 Configurando CarritoLoco - Sistema POS Full-Stack"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS and PostgreSQL user
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    PGUSER=$(whoami)
    echo -e "${GREEN}✓ Detectado: macOS${NC}"
else
    # Linux
    PGUSER="postgres"
    echo -e "${GREEN}✓ Detectado: Linux${NC}"
fi

echo -e "   Usuario PostgreSQL: ${YELLOW}${PGUSER}${NC}"
echo ""

# Step 1: Database setup
echo -e "${YELLOW}📊 Paso 1: Configurando base de datos PostgreSQL...${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL no está corriendo.${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   Intenta iniciarlo con: brew services start postgresql@14"
        echo "   O si usas otra versión: brew services list"
    else
        echo "   Iniciando PostgreSQL..."
        sudo service postgresql start
    fi
    echo ""
    echo -e "${RED}Por favor inicia PostgreSQL y ejecuta este script de nuevo.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"
echo ""

# Drop and create database
echo "   - Eliminando base de datos anterior (si existe)..."
psql -U "$PGUSER" -d postgres -c "DROP DATABASE IF EXISTS carritoloco;" 2>/dev/null || true

echo "   - Creando base de datos 'carritoloco'..."
psql -U "$PGUSER" -d postgres -c "CREATE DATABASE carritoloco;"

echo "   - Aplicando schema completo..."
psql -U "$PGUSER" -d carritoloco -f database/schema_complete.sql > /dev/null

echo "   - Cargando datos de prueba..."
psql -U "$PGUSER" -d carritoloco -f database/seed_complete.sql > /dev/null

echo -e "${GREEN}✅ Base de datos configurada exitosamente${NC}"
echo ""

# Step 2: Install Go dependencies
echo -e "${YELLOW}📦 Paso 2: Instalando dependencias de Go...${NC}"
cd goo
if [ ! -f "go.mod" ]; then
    echo "   - Inicializando módulo Go..."
    go mod init carritoloco
fi

echo "   - Descargando dependencias..."
go get github.com/lib/pq 2>/dev/null || true
go mod tidy

echo -e "${GREEN}✅ Dependencias de Go instaladas${NC}"
echo ""

# Step 3: Install Frontend dependencies
echo -e "${YELLOW}📦 Paso 3: Instalando dependencias del Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "   - Instalando paquetes npm (esto puede tomar unos minutos)..."
    npm install
else
    echo "   - node_modules ya existe, saltando instalación..."
fi

echo -e "${GREEN}✅ Dependencias del Frontend listas${NC}"
echo ""

# Step 4: Start services
echo -e "${YELLOW}🚀 Paso 4: Iniciando servicios...${NC}"
echo ""

cd ..

# Create logs directory
mkdir -p logs

# Kill any existing processes on ports 8080 and 3000
echo "   - Liberando puertos 8080 y 3000..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
else
    # Linux
    fuser -k 8080/tcp 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
fi

# Start Go backend in background
echo "   - Iniciando backend Go en puerto 8080..."
cd goo
nohup go run main_complete.go > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Wait for backend to start
echo "   - Esperando que el backend inicie..."
sleep 4

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend Go corriendo (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Error: Backend no se pudo iniciar${NC}"
    echo "Mostrando últimas líneas del log:"
    tail -20 logs/backend.log
    exit 1
fi

# Start Next.js frontend in background
echo "   - Iniciando frontend Next.js en puerto 3000..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

echo -e "${GREEN}✅ Frontend Next.js corriendo (PID: $FRONTEND_PID)${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Esperando que los servicios estén listos (10 segundos)...${NC}"
for i in {10..1}; do
    echo -ne "   $i..."
    sleep 1
done
echo ""

# Step 5: Success message
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 ¡CarritoLoco está corriendo!${NC}"
echo "=================================================="
echo ""
echo "📍 URLs:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔧 Backend:   http://localhost:8080"
echo ""
echo "👤 Usuarios de prueba (todos con password: 'password123'):"
echo "   📧 admin@carrito.com     - Rol: Admin"
echo "   📧 manager@carrito.com   - Rol: Gerente"
echo "   📧 cashier1@carrito.com  - Rol: Cajero (Sucursal Centro)"
echo "   📧 cashier2@carrito.com  - Rol: Cajero (Sucursal Norte)"
echo "   📧 inv1@carrito.com      - Rol: Inventarios"
echo ""
echo "🏢 Sucursales disponibles:"
echo "   - Centro (ID: 1)"
echo "   - Norte (ID: 2)"
echo "   - Sur (ID: 3)"
echo ""
echo "📦 Productos de prueba: 10 productos con códigos de barras"
echo "🏭 Proveedores: 3 proveedores configurados"
echo ""
echo "🧪 Probar API del POS:"
echo "   curl http://localhost:8080/api/pos/open-cash \\"
echo "     -X POST -H 'Content-Type: application/json' \\"
echo "     -d '{\"branch_id\":1,\"opened_by\":3,\"opening_cash\":1000.00}'"
echo ""
echo "📋 Ver inventario:"
echo "   curl http://localhost:8080/api/inventory/by-branch?branch_id=1"
echo ""
echo "📊 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 Para detener los servicios:"
echo "   kill \$(cat logs/backend.pid) \$(cat logs/frontend.pid)"
echo ""
echo "=================================================="
echo ""
echo -e "${YELLOW}💡 Abre tu navegador en: ${GREEN}http://localhost:3000${NC}"
echo ""
