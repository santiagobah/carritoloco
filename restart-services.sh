#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Reiniciando servicios CarritoLoco...${NC}"
echo ""

# Kill existing services
echo "   - Deteniendo servicios existentes..."
if [ -f logs/backend.pid ]; then
    kill $(cat logs/backend.pid) 2>/dev/null || true
fi
if [ -f logs/frontend.pid ]; then
    kill $(cat logs/frontend.pid) 2>/dev/null || true
fi

# Kill by port
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

sleep 2

# Start backend
echo "   - Iniciando backend Go..."
cd goo
nohup go run main_complete.go > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

sleep 3

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend corriendo (PID: $BACKEND_PID)${NC}"
else
    echo "❌ Error en backend, mostrando log:"
    tail -20 logs/backend.log
    exit 1
fi

# Start frontend
echo "   - Iniciando frontend Next.js..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

echo -e "${GREEN}✅ Frontend corriendo (PID: $FRONTEND_PID)${NC}"
echo ""
echo -e "${GREEN}🎉 Servicios iniciados!${NC}"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:8080"
echo ""
echo "📊 Ver logs:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
