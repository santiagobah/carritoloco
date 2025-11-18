#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=================================================="
echo "📊 Estado de CarritoLoco"
echo "=================================================="
echo ""

# Check backend
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Backend Go corriendo${NC} (PID: $BACKEND_PID)"
        echo "   URL: http://localhost:8080"
    else
        echo -e "${RED}❌ Backend Go NO está corriendo${NC}"
    fi
else
    echo -e "${RED}❌ Backend Go NO está corriendo${NC}"
fi

echo ""

# Check frontend
if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend Next.js corriendo${NC} (PID: $FRONTEND_PID)"
        echo "   URL: http://localhost:3000"
    else
        echo -e "${RED}❌ Frontend Next.js NO está corriendo${NC}"
    fi
else
    echo -e "${RED}❌ Frontend Next.js NO está corriendo${NC}"
fi

echo ""

# Check PostgreSQL
if pg_isready -q 2>/dev/null; then
    echo -e "${GREEN}✅ PostgreSQL corriendo${NC}"
else
    echo -e "${RED}❌ PostgreSQL NO está corriendo${NC}"
fi

echo ""
echo "=================================================="
echo ""
echo "🛠️  Comandos útiles:"
echo ""
echo "   Ver logs:"
echo "   - Backend:  tail -f logs/backend.log"
echo "   - Frontend: tail -f logs/frontend.log"
echo ""
echo "   Reiniciar servicios:"
echo "   - bash restart-services.sh"
echo ""
echo "   Detener servicios:"
echo "   - kill \$(cat logs/backend.pid) \$(cat logs/frontend.pid)"
echo ""
echo "=================================================="
