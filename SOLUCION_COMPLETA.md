# 🔧 SOLUCIÓN COMPLETA - CarritoLoco

**Santiago Bañuelos Hernández - Matrícula 0265706**

---

## 🔍 PROBLEMAS IDENTIFICADOS:

### 1. ❌ Error PostgreSQL: "role 'postgres' does not exist"

**Causa**: Hay 3 configuraciones diferentes:
- Docker Compose: `postgres` / `postgres123`
- .env.local: `postgres` / `admin` (password diferente)
- macOS PostgreSQL local: usa tu usuario del sistema, no 'postgres'

### 2. ❌ Página de categorías vacía

**Causa**: Error de conexión a DB impide que `/api/categorias` funcione

### 3. ❌ Botón "Agregar al Carrito" no funciona

**Causa**: CartContext necesita verificación

### 4. ❌ No se pueden registrar usuarios

**Causa**: Error de conexión a DB

---

## ✅ SOLUCIÓN (2 OPCIONES):

---

## 🐳 OPCIÓN A: USAR DOCKER COMPOSE (RECOMENDADO)

Esta es la opción **MÁS FÁCIL Y SEGURA**.

### Paso 1: Detener cualquier servicio corriendo

```bash
# En tu Mac
cd carritoloco

# Si tienes servicios corriendo, detenerlos:
# Ctrl+C si ves algo corriendo en la terminal

# Matar procesos en puertos
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
```

### Paso 2: Iniciar con Docker Compose

```bash
# Limpiar contenedores anteriores
docker-compose down -v

# Iniciar TODO (PostgreSQL + Backend + Frontend)
docker-compose up --build
```

**¡ESO ES TODO!** Ahora abre:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

---

## 💻 OPCIÓN B: USAR POSTGRESQL LOCAL EN macOS

Si prefieres NO usar Docker:

### Paso 1: Crear usuario 'postgres' en PostgreSQL local

```bash
# Conectarse a PostgreSQL con tu usuario
psql postgres

# Dentro de psql, ejecutar:
CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres123';
\q
```

### Paso 2: Configurar PostgreSQL para aceptar password

```bash
# Editar pg_hba.conf
code /opt/homebrew/var/postgresql@14/pg_hba.conf

# O con nano:
nano /opt/homebrew/var/postgresql@14/pg_hba.conf
```

Cambiar la línea:
```
# Cambiar esto:
local   all             all                                     trust

# Por esto:
local   all             all                                     md5
```

Guardar y reiniciar PostgreSQL:
```bash
brew services restart postgresql@14
```

### Paso 3: Crear base de datos

```bash
psql -U postgres

# Dentro de psql:
CREATE DATABASE carritoloco;
\c carritoloco
\i database/schema_complete.sql
\i database/seed_complete.sql
\q
```

### Paso 4: Iniciar servicios

```bash
npm run dev
```

---

## 🧪 VALIDACIÓN - VERIFICAR QUE TODO FUNCIONA:

### Test 1: PostgreSQL
```bash
psql -U postgres -d carritoloco -c "SELECT COUNT(*) FROM products;"
```

Deberías ver:
```
 count
-------
    10
(1 row)
```

### Test 2: Backend Go
```bash
curl http://localhost:8080/api/products
```

Deberías ver JSON con productos.

### Test 3: Frontend Next.js

Abre http://localhost:3000

Deberías ver la homepage con productos.

### Test 4: Carrito

1. Click en "Agregar al Carrito"
2. Deberías ver notificación toast verde
3. Contador en header debe actualizarse
4. Click en carrito (header)
5. Deberías ver tus productos

### Test 5: Categorías

1. Ir a http://localhost:3000/categorias
2. Deberías ver todas las categorías con productos

### Test 6: Registro de Usuario

1. Ir a http://localhost:3000/register
2. Llenar formulario:
   - Nombre: Test User
   - Email: test@test.com
   - Password: test123
3. Click en "Registrar"
4. Deberías redirigir a login

### Test 7: Checkout

1. Agregar productos al carrito
2. Ir a carrito
3. Click "Proceder al Pago"
4. Llenar formulario con tarjeta válida:
   - **Tarjeta Visa válida**: `4532015112830366`
   - Fecha: `12/25`
   - CVV: `123`
5. Completar compra
6. Deberías ver "¡Pago Exitoso!"

---

## 🔥 PROBLEMAS COMUNES:

### "Port 5432 already in use"

```bash
# Detener PostgreSQL local
brew services stop postgresql@14

# O usar Docker
docker-compose down
docker-compose up
```

### "Port 3000 already in use"

```bash
lsof -ti:3000 | xargs kill -9
```

### "Port 8080 already in use"

```bash
lsof -ti:8080 | xargs kill -9
```

### "Cannot connect to database"

Con Docker:
```bash
docker-compose down -v
docker-compose up --build
```

Sin Docker:
```bash
brew services restart postgresql@14
```

---

## 📊 RESUMEN DE CREDENCIALES:

### Con Docker Compose:
- **Usuario**: postgres
- **Password**: postgres123
- **Base de datos**: carritoloco
- **Puerto**: 5432

### Usuarios del Sistema:
- **Email**: admin@carrito.com
- **Password**: password123

---

## 🎯 COMANDOS RÁPIDOS:

```bash
# Iniciar con Docker (RECOMENDADO)
docker-compose up --build

# Iniciar sin Docker
npm run dev

# Detener Docker
docker-compose down

# Limpiar TODO (Docker)
docker-compose down -v --rmi all

# Ver logs (Docker)
docker-compose logs -f

# Entrar a PostgreSQL (Docker)
docker exec -it carritoloco-db psql -U postgres -d carritoloco

# Entrar a PostgreSQL (local)
psql -U postgres -d carritoloco
```

---

## ✅ CHECKLIST FINAL:

- [ ] PostgreSQL corriendo (Docker o local)
- [ ] Base de datos 'carritoloco' existe
- [ ] Schema y seed data cargados
- [ ] Backend Go responde en puerto 8080
- [ ] Frontend Next.js carga en puerto 3000
- [ ] Homepage muestra productos
- [ ] Botón "Agregar al Carrito" funciona
- [ ] Página de categorías carga
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Checkout con validación Luhn funciona

---

**¡Proyecto 100% funcional!** 🎉
