#!/bin/bash

# Script para arreglar todos los problemas de CarritoLoco
# Santiago Bañuelos Hernández - 0265706

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔧 ARREGLANDO TODOS LOS PROBLEMAS - CarritoLoco        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para preguntar
ask() {
    while true; do
        read -p "$1 (s/n): " yn
        case $yn in
            [Ss]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde s o n.";;
        esac
    done
}

echo -e "${YELLOW}Detectando configuración...${NC}"
echo ""

# Verificar si Docker está instalado
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker instalado${NC}"
    HAS_DOCKER=true
else
    echo -e "${YELLOW}⚠ Docker no instalado${NC}"
    HAS_DOCKER=false
fi

# Verificar si PostgreSQL local está instalado
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL instalado${NC}"
    HAS_PSQL=true
else
    echo -e "${YELLOW}⚠ PostgreSQL no instalado${NC}"
    HAS_PSQL=false
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Elige cómo quieres ejecutar el proyecto:${NC}"
echo ""
echo "1. 🐳 Con Docker Compose (RECOMENDADO - más fácil)"
echo "2. 💻 Con PostgreSQL local (requiere configuración)"
echo ""
read -p "Opción (1 o 2): " option

if [ "$option" = "1" ]; then
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🐳 Configurando con Docker Compose...${NC}"
    echo ""

    if [ "$HAS_DOCKER" = false ]; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        echo ""
        echo "Por favor instala Docker Desktop desde:"
        echo "https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    # Detener servicios locales si existen
    echo "Deteniendo servicios locales..."
    lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:5432 2>/dev/null | xargs kill -9 2>/dev/null || true

    # Detener contenedores anteriores
    echo "Limpiando contenedores antiguos..."
    docker-compose down -v 2>/dev/null || true

    # Iniciar con Docker Compose
    echo ""
    echo -e "${GREEN}Iniciando servicios con Docker Compose...${NC}"
    echo ""
    docker-compose up --build -d

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ ¡Servicios iniciados con Docker!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8080"
    echo ""
    echo "👤 Login:"
    echo "   Email:    admin@carrito.com"
    echo "   Password: password123"
    echo ""
    echo "📊 Ver logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Detener:"
    echo "   docker-compose down"
    echo ""

elif [ "$option" = "2" ]; then
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}💻 Configurando con PostgreSQL local...${NC}"
    echo ""

    if [ "$HAS_PSQL" = false ]; then
        echo -e "${RED}❌ PostgreSQL no está instalado${NC}"
        echo ""
        echo "Instala PostgreSQL con Homebrew:"
        echo "  brew install postgresql@14"
        echo "  brew services start postgresql@14"
        exit 1
    fi

    # Verificar si el usuario 'postgres' existe
    if psql -U postgres -d postgres -c "SELECT 1" 2>/dev/null > /dev/null; then
        echo -e "${GREEN}✓ Usuario 'postgres' existe${NC}"
    else
        echo -e "${YELLOW}⚠ Usuario 'postgres' no existe${NC}"
        echo ""
        echo "Creando usuario 'postgres'..."

        USER=$(whoami)
        psql -U "$USER" -d postgres << EOF
CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres123';
EOF
        echo -e "${GREEN}✓ Usuario 'postgres' creado${NC}"
    fi

    # Verificar si la base de datos existe
    if psql -U postgres -d carritoloco -c "SELECT 1" 2>/dev/null > /dev/null; then
        echo -e "${YELLOW}⚠ Base de datos 'carritoloco' ya existe${NC}"
        if ask "¿Quieres recrearla? (se perderán los datos)"; then
            psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS carritoloco;"
            psql -U postgres -d postgres -c "CREATE DATABASE carritoloco;"
            echo -e "${GREEN}✓ Base de datos recreada${NC}"
        fi
    else
        echo "Creando base de datos..."
        psql -U postgres -d postgres -c "CREATE DATABASE carritoloco;"
        echo -e "${GREEN}✓ Base de datos creada${NC}"
    fi

    # Aplicar schema y seed
    echo "Aplicando schema y datos de prueba..."
    psql -U postgres -d carritoloco -f database/schema_complete.sql > /dev/null
    psql -U postgres -d carritoloco -f database/seed_complete.sql > /dev/null
    echo -e "${GREEN}✓ Schema y datos aplicados${NC}"

    # Instalar dependencias raíz si es necesario
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependencias raíz..."
        npm install
    fi

    # Iniciar servicios
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Base de datos configurada!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Ahora ejecuta:"
    echo "  npm run dev"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8080"
    echo ""
    echo "👤 Login:"
    echo "   Email:    admin@carrito.com"
    echo "   Password: password123"
    echo ""
else
    echo -e "${RED}Opción inválida${NC}"
    exit 1
fi

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""
