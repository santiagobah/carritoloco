#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step} ${message}`, 'cyan');
}

async function checkPostgreSQL() {
  return new Promise((resolve) => {
    exec('pg_isready', (error) => {
      resolve(!error);
    });
  });
}

async function checkDatabase() {
  return new Promise((resolve) => {
    const user = os.userInfo().username;
    exec(`psql -U ${user} -d carritoloco -c "SELECT 1" 2>/dev/null`, (error) => {
      resolve(!error);
    });
  });
}

async function setupDatabase() {
  logStep('📊', 'Configurando base de datos PostgreSQL...');

  const user = os.userInfo().username;
  const dbName = 'carritoloco';

  return new Promise((resolve, reject) => {
    // Drop y crear base de datos
    exec(`psql -U ${user} -d postgres -c "DROP DATABASE IF EXISTS ${dbName}; CREATE DATABASE ${dbName};"`, async (error) => {
      if (error) {
        log('   ⚠️  Error creando base de datos', 'yellow');
        log('      Intentando con base de datos existente...', 'yellow');
      }

      // Aplicar schema
      exec(`psql -U ${user} -d ${dbName} -f database/schema_complete.sql`, (error) => {
        if (error) {
          log('   ❌ Error aplicando schema', 'red');
          return reject(error);
        }

        // Aplicar seed data
        exec(`psql -U ${user} -d ${dbName} -f database/seed_complete.sql`, (error) => {
          if (error) {
            log('   ❌ Error cargando datos de prueba', 'red');
            return reject(error);
          }

          log('   ✅ Base de datos configurada', 'green');
          resolve();
        });
      });
    });
  });
}

async function setupGoEnv() {
  const envPath = path.join(__dirname, '..', 'goo', '.env');

  if (!fs.existsSync(envPath)) {
    logStep('⚙️', 'Creando archivo .env para Go backend...');

    const user = os.userInfo().username;
    const envContent = `DB_HOST=localhost
DB_USER=${user}
DB_PASS=
DB_NAME=carritoloco
DB_PORT=5432
`;

    fs.writeFileSync(envPath, envContent);
    log('   ✅ Archivo .env creado', 'green');
  }
}

async function installDependencies() {
  logStep('📦', 'Verificando dependencias...');

  // Go dependencies
  return new Promise((resolve, reject) => {
    log('   - Instalando dependencias de Go...', 'blue');
    const goDir = path.join(__dirname, '..', 'goo');

    exec('go mod tidy', { cwd: goDir }, (error) => {
      if (error) {
        log('   ⚠️  Error con dependencias de Go', 'yellow');
      } else {
        log('   ✅ Dependencias de Go listas', 'green');
      }

      // Frontend dependencies
      const frontendDir = path.join(__dirname, '..', 'frontend');
      if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
        log('   - Instalando dependencias de npm (esto puede tardar)...', 'blue');

        exec('npm install', { cwd: frontendDir }, (error) => {
          if (error) {
            log('   ❌ Error instalando dependencias de npm', 'red');
            return reject(error);
          }

          log('   ✅ Dependencias del frontend listas', 'green');
          resolve();
        });
      } else {
        log('   ✅ Dependencias del frontend ya instaladas', 'green');
        resolve();
      }
    });
  });
}

function startServices() {
  logStep('🚀', 'Iniciando servicios...');

  const goDir = path.join(__dirname, '..', 'goo');
  const frontendDir = path.join(__dirname, '..', 'frontend');

  // Iniciar backend Go
  log('   - Iniciando backend Go en http://localhost:8080', 'blue');
  const backend = spawn('go', ['run', 'main_complete.go'], {
    cwd: goDir,
    stdio: 'inherit'
  });

  // Esperar un momento antes de iniciar el frontend
  setTimeout(() => {
    log('   - Iniciando frontend Next.js en http://localhost:3000', 'blue');
    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: frontendDir,
      stdio: 'inherit',
      shell: true
    });

    frontend.on('error', (error) => {
      log(`\n❌ Error en frontend: ${error.message}`, 'red');
    });
  }, 2000);

  backend.on('error', (error) => {
    log(`\n❌ Error en backend: ${error.message}`, 'red');
  });

  // Manejar Ctrl+C
  process.on('SIGINT', () => {
    log('\n\n🛑 Deteniendo servicios...', 'yellow');
    backend.kill();
    process.exit();
  });
}

async function main() {
  console.clear();

  log('╔═══════════════════════════════════════════════════════════╗', 'bright');
  log('║         🛒 CARRITOLOCO - Sistema POS Full-Stack           ║', 'bright');
  log('║     Santiago Bañuelos Hernández - Matrícula 0265706      ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'bright');

  try {
    // Verificar PostgreSQL
    logStep('🔍', 'Verificando PostgreSQL...');
    const pgRunning = await checkPostgreSQL();

    if (!pgRunning) {
      log('   ❌ PostgreSQL no está corriendo', 'red');
      log('      macOS: brew services start postgresql@14', 'yellow');
      log('      Linux: sudo service postgresql start', 'yellow');
      process.exit(1);
    }
    log('   ✅ PostgreSQL está corriendo', 'green');

    // Verificar si la base de datos existe
    const dbExists = await checkDatabase();

    if (!dbExists) {
      await setupDatabase();
    } else {
      log('   ℹ️  Base de datos ya existe (usando existente)', 'blue');
    }

    // Setup Go .env
    await setupGoEnv();

    // Instalar dependencias
    await installDependencies();

    // Iniciar servicios
    log('\n' + '═'.repeat(60), 'green');
    log('🎉 ¡TODO LISTO! Iniciando servicios...', 'green');
    log('═'.repeat(60) + '\n', 'green');

    log('📍 URLs:', 'cyan');
    log('   🌐 Frontend:  http://localhost:3000', 'bright');
    log('   🔧 Backend:   http://localhost:8080', 'bright');

    log('\n👤 Usuarios de prueba (password: password123):', 'cyan');
    log('   📧 admin@carrito.com     - Admin', 'bright');
    log('   📧 manager@carrito.com   - Gerente', 'bright');
    log('   📧 cashier1@carrito.com  - Cajero', 'bright');

    log('\n💡 Presiona Ctrl+C para detener los servicios\n', 'yellow');

    startServices();

  } catch (error) {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
