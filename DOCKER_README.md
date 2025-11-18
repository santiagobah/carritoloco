# 🐳 CarritoLoco - Docker Compose Guide

## 📋 Requisitos Previos

Antes de ejecutar el proyecto con Docker, asegúrate de tener instalado:

- **Docker Desktop** (incluye Docker Compose)
  - macOS: `brew install --cask docker`
  - Windows: Descargar desde docker.com
  - Linux: Instalar Docker y Docker Compose por separado

## 🚀 Inicio Rápido con Docker

### Opción 1: Usando Docker Compose (Recomendado)

```bash
# 1. Clona el repositorio
git clone <tu-repo-url>
cd carritoloco

# 2. Inicia todos los servicios
docker-compose up --build

# O en modo detached (segundo plano)
docker-compose up -d --build
```

### Opción 2: Servicios individuales

```bash
# Construir imágenes
docker-compose build

# Iniciar solo la base de datos
docker-compose up postgres

# Iniciar backend
docker-compose up backend

# Iniciar frontend
docker-compose up frontend
```

## 📦 Arquitectura de Contenedores

El proyecto está dividido en **3 contenedores independientes**:

### 1. 🗄️ PostgreSQL Database (`postgres`)
- **Puerto:** 5432
- **Imagen:** postgres:15-alpine
- **Usuario:** postgres
- **Password:** postgres123
- **Base de datos:** carritoloco
- **Volumen:** Datos persistentes en `postgres_data`
- **Inicialización:** Carga automáticamente schema y seed data

### 2. 🔧 Backend Go API (`backend`)
- **Puerto:** 8080
- **Tecnología:** Go 1.21 con Gin
- **Dockerfile:** Multi-stage build optimizado
- **Endpoints:** RESTful API para POS, inventario, ventas
- **Conexión DB:** Automática via variables de entorno
- **Health check:** Espera a que PostgreSQL esté listo

### 3. 🌐 Frontend Next.js (`frontend`)
- **Puerto:** 3000
- **Tecnología:** Next.js 15 + React 19 + TypeScript
- **Dockerfile:** Multi-stage build con standalone output
- **UI:** Completamente responsive (mobile, tablet, desktop)
- **Features:** E-commerce moderno con carrito de compras

## 🔗 URLs de Acceso

Una vez que los contenedores estén corriendo:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Tienda en línea e-commerce |
| **Backend API** | http://localhost:8080 | API RESTful  |
| **PostgreSQL** | localhost:5432 | Base de datos |

## 🛠️ Comandos Útiles

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Detener servicios
```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar TODO (incluyendo volúmenes)
docker-compose down -v
```

### Reiniciar servicios
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend
```

### Ver estado de contenedores
```bash
docker-compose ps
```

### Ejecutar comandos dentro de contenedores
```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d carritoloco

# Acceder a shell del backend
docker-compose exec backend sh

# Acceder a shell del frontend
docker-compose exec frontend sh
```

### Rebuild forzado
```bash
# Rebuild sin cache
docker-compose build --no-cache

# Rebuild y restart
docker-compose up --build --force-recreate
```

## 📊 Verificar que todo funciona

### 1. Verificar base de datos
```bash
docker-compose exec postgres psql -U postgres -d carritoloco -c "SELECT COUNT(*) FROM products;"
```

Deberías ver el número de productos cargados.

### 2. Verificar backend API
```bash
curl http://localhost:8080/api/products
```

Deberías recibir JSON con la lista de productos.

### 3. Verificar frontend
Abre tu navegador en: http://localhost:3000

Deberías ver la página principal de Carrito Loco con productos destacados.

## 🐛 Solución de Problemas

### Problema: "Port already in use"

```bash
# Ver qué está usando el puerto
lsof -i :3000
lsof -i :8080
lsof -i :5432

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en docker-compose.yml
```

### Problema: "Database connection failed"

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar que esté healthy
docker-compose ps

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Problema: "Frontend build failed"

```bash
# Limpiar node_modules y rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up frontend
```

### Problema: Cambios no se reflejan

```bash
# Rebuild completamente
docker-compose down
docker-compose up --build --force-recreate
```

## 🔄 Workflow de Desarrollo

### Desarrollo local SIN Docker
```bash
# Terminal 1: PostgreSQL
brew services start postgresql@14

# Terminal 2: Backend
cd goo
go run main_complete.go

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Desarrollo local CON Docker
```bash
# Modo desarrollo con hot-reload
docker-compose up

# Los cambios en el código se reflejan automáticamente
```

### Producción
```bash
# Build optimizado
docker-compose -f docker-compose.prod.yml up -d

# O usando las imágenes ya construidas
docker-compose up -d
```

## 📦 Volúmenes y Persistencia

### Datos Persistentes
Los datos de PostgreSQL se guardan en un volumen Docker:
```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect carritoloco_postgres_data

# Backup de datos
docker-compose exec postgres pg_dump -U postgres carritoloco > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres carritoloco < backup.sql
```

### Limpiar Todo
```bash
# CUIDADO: Esto elimina TODO (contenedores, volúmenes, imágenes)
docker-compose down -v --rmi all
```

## 🌐 Deployment

### Docker Hub
```bash
# Tag images
docker tag carritoloco-backend:latest tu-usuario/carritoloco-backend:latest
docker tag carritoloco-frontend:latest tu-usuario/carritoloco-frontend:latest

# Push to Docker Hub
docker push tu-usuario/carritoloco-backend:latest
docker push tu-usuario/carritoloco-frontend:latest
```

### Producción con Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Usar .env
  backend:
    restart: always
    environment:
      DB_PASS: ${DB_PASSWORD}
  frontend:
    restart: always
```

## 📱 Responsive Design

El frontend está optimizado para:

- **📱 Mobile** (< 640px): Menú hamburger, 1 columna
- **📲 Tablet** (640px - 1024px): 2-3 columnas
- **💻 Desktop** (> 1024px): 4 columnas, menú completo

## ✅ Checklist Pre-Presentación

- [ ] Docker Desktop instalado y corriendo
- [ ] `docker-compose up --build` ejecuta sin errores
- [ ] Los 3 contenedores están corriendo (`docker-compose ps`)
- [ ] PostgreSQL tiene datos (`docker-compose exec postgres psql...`)
- [ ] Backend responde en http://localhost:8080
- [ ] Frontend carga en http://localhost:3000
- [ ] La UI es responsive (probar en mobile/desktop)
- [ ] Se pueden ver productos en la homepage
- [ ] Login funciona correctamente

## 👨‍💻 Autor

**Santiago Bañuelos Hernández**
- Matrícula: 0265706
- Proyecto: CarritoLoco - Sistema POS Full-Stack
- Curso: Desarrollo Web - Universidad Panamericana

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

**¡Listo para presentar! 🎉**
