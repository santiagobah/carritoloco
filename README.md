# 🛒 Carrito Loco - Full-Stack POS System

Sistema completo de punto de venta (POS) y tienda en línea construido con Next.js 16, PostgreSQL y Go.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Documentation](#api-documentation)
- [Base de Datos](#base-de-datos)
- [Desarrollo](#desarrollo)

## ✨ Características

### Frontend (Next.js)
- ✅ Sistema completo de autenticación (registro, login, logout)
- ✅ Dashboard de usuario personalizado
- ✅ CRUD completo de productos
- ✅ Sistema de categorías dinámicas
- ✅ Catálogo de productos con filtros
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Session management con React Context
- ✅ Protección de rutas con middleware
- ✅ Validación de formularios con Zod

### Backend (Next.js API Routes)
- ✅ API RESTful completa
- ✅ Autenticación con JWT y cookies HttpOnly
- ✅ Rate limiting para login
- ✅ Validación de datos con Zod
- ✅ Manejo de errores robusto
- ✅ Integración con PostgreSQL

### POS (Go)
- ✅ Consulta de productos por código de barras
- ✅ Registro de ventas
- ✅ Gestión de inventario
- ✅ Conexión directa a PostgreSQL

### Base de Datos (PostgreSQL)
- ✅ Esquema completo normalizado
- ✅ Triggers para cálculos automáticos
- ✅ Índices para rendimiento óptimo
- ✅ Relaciones con integridad referencial

## 🛠 Tecnologías

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React (iconos)

### Backend
- Next.js API Routes
- PostgreSQL
- bcryptjs (hashing de contraseñas)
- jose (JWT)
- Zod (validación)

### POS
- Go 1.21+
- PostgreSQL driver

## 📦 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 14+
- Go 1.21+ (para el POS)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd carritoloco
```

### 2. Configurar la base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE carritoloco;"

# Ejecutar schema
psql -U postgres -d carritoloco -f database/schema.sql

# Cargar datos iniciales
psql -U postgres -d carritoloco -f database/seed.sql
```

### 3. Configurar el Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env.local
cat > .env.local << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=carritoloco
DB_PORT=5432

JWT_SECRET=carrito_loco_super_secret_key_2024_change_in_production
JWT_EXPIRES_IN=7d

NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
```

### 4. Configurar el POS Go

```bash
cd ../goo

# Crear archivo .env
cat > .env << 'EOF'
DB_HOST=localhost
DB_USER=postgres
DB_PASS=admin
DB_NAME=carritoloco
DB_PORT=5432
PORT=4001
EOF

# Instalar dependencias
go mod download
```

## ⚙️ Configuración

### Variables de Entorno

#### Frontend (`frontend/.env.local`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASS` | Contraseña de PostgreSQL | `admin` |
| `DB_NAME` | Nombre de la base de datos | `carritoloco` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `JWT_SECRET` | Clave secreta para JWT | ⚠️ CAMBIAR EN PRODUCCIÓN |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `7d` |

#### POS Go (`goo/.env`)

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASS` | Contraseña de PostgreSQL | `admin` |
| `DB_NAME` | Nombre de la base de datos | `carritoloco` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `PORT` | Puerto del servidor POS | `4001` |

## 🎯 Uso

### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### Iniciar el POS Go

```bash
cd goo
go run main.go
```

El POS estará disponible en `http://localhost:4001`

### Usuarios de Prueba

Después de ejecutar `seed.sql`, puedes crear usuarios a través de la interfaz de registro en `/register`.

**Usuario Admin de ejemplo:**
- Crear a través de `/register` y luego actualizar `is_admin = TRUE` en la base de datos

## 📁 Estructura del Proyecto

```
carritoloco/
├── frontend/                 # Aplicación Next.js
│   ├── src/
│   │   ├── app/             # App Router de Next.js
│   │   │   ├── api/         # API Routes
│   │   │   │   ├── auth/    # Autenticación
│   │   │   │   ├── productos/ # CRUD productos
│   │   │   │   ├── categorias/ # Categorías
│   │   │   │   └── pos/     # POS endpoints
│   │   │   ├── dashboard/   # Dashboard de usuario
│   │   │   ├── login/       # Página de login
│   │   │   ├── register/    # Página de registro
│   │   │   └── productos/   # Páginas de productos
│   │   ├── contexts/        # React Contexts
│   │   │   └── SessionContext.tsx
│   │   └── lib/             # Utilidades
│   │       ├── db.ts        # Configuración de DB
│   │       ├── auth.ts      # Utilidades de autenticación
│   │       └── validations.ts # Esquemas de validación
│   └── middleware.ts        # Middleware de protección de rutas
├── goo/                     # POS en Go
│   ├── db/                  # Conexión a DB
│   ├── handlers/            # Handlers HTTP
│   ├── models/              # Modelos de datos
│   └── main.go              # Punto de entrada
├── database/                # Scripts de base de datos
│   ├── schema.sql           # Esquema completo
│   ├── seed.sql             # Datos iniciales
│   └── README.md            # Documentación de DB
└── backend/                 # Backend Express (legacy)
```

## 📡 API Documentation

### Autenticación

#### POST `/api/auth/register`
Registro de nuevo usuario

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "name_p": "Juan",
  "ap_pat": "Pérez",
  "ap_mat": "López",
  "sell": true,
  "buy": true
}
```

#### POST `/api/auth/login`
Inicio de sesión

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Obtener información del usuario autenticado

#### POST `/api/auth/logout`
Cerrar sesión

### Productos

#### GET `/api/productos/list`
Listar productos (con filtros opcionales)

**Query Parameters:**
- `cat_id`: Filtrar por categoría
- `search`: Búsqueda por nombre/descripción
- `user_id`: Filtrar por usuario

#### POST `/api/productos/create`
Crear producto (requiere autenticación)

**Body:**
```json
{
  "name_pr": "Producto ejemplo",
  "description": "Descripción del producto",
  "cat_id": 1,
  "price": 99.99,
  "stock": 10,
  "barcode": "1234567890",
  "image_url": "https://example.com/image.jpg"
}
```

#### PUT `/api/productos/update`
Actualizar producto (requiere autenticación)

#### DELETE `/api/productos/delete?prod_id=1`
Eliminar producto (soft delete)

### Categorías

#### GET `/api/categorias`
Listar categorías

#### POST `/api/categorias`
Crear categoría (requiere admin)

### POS

#### POST `/api/pos/sale`
Registrar venta

**Body:**
```json
{
  "items": [
    {
      "prod_id": 1,
      "quantity": 2,
      "unit_price": 99.99
    }
  ],
  "payment_method": "cash"
}
```

#### POST `/api/pos/inventory`
Actualizar inventario

**Body:**
```json
{
  "prod_id": 1,
  "quantity": 10
}
```

## 🗄 Base de Datos

### Tablas Principales

- **personas**: Usuarios del sistema
- **user_pass**: Credenciales de autenticación
- **categor**: Categorías de productos
- **products**: Catálogo de productos
- **barcodes**: Códigos de barras
- **sales**: Registro de ventas
- **sale_items**: Items vendidos

Ver `database/schema.sql` para el esquema completo.

## 🔧 Desarrollo

### Scripts Disponibles

#### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

#### POS Go
```bash
go run main.go   # Ejecutar
go build         # Compilar
```

### Testing

Para crear usuarios de prueba, usa la interfaz de registro o inserta directamente en la base de datos:

```sql
-- Crear usuario de prueba (password: "password123")
-- Primero registra el usuario a través de /register
-- El hash de la contraseña se generará automáticamente
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT firmado con clave secreta
- ✅ Cookies HttpOnly para tokens
- ✅ Rate limiting en login (5 intentos máximo)
- ✅ Validación de entrada con Zod
- ✅ Protección contra SQL injection (consultas parametrizadas)
- ✅ CORS configurado
- ✅ Middleware de autenticación en rutas protegidas

## 📝 Notas Importantes

1. **Producción**: Cambiar `JWT_SECRET` a un valor aleatorio seguro
2. **Base de Datos**: Configurar backups regulares
3. **CORS**: Ajustar orígenes permitidos en producción
4. **HTTPS**: Usar HTTPS en producción para cookies seguras
5. **Validación**: Todas las entradas se validan con Zod
6. **Errores**: Los errores se registran en consola (configurar logger en producción)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT.

## 🎓 Créditos

Proyecto desarrollado como sistema POS full-stack integrado.

---

**Nota**: Este es un proyecto educativo. Para uso en producción, implementar medidas adicionales de seguridad y monitoreo.
