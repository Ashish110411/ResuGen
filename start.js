// ==============================================================================
// ResuGen Unified Local Services Launcher
// Starts the embedded LaTeX Compiler, Angular Frontend, and optionally Spring Boot
// ==============================================================================

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = __dirname;
const FRONTEND_DIR = path.join(ROOT_DIR, 'rg-frontend');
const BACKEND_DIR = path.join(ROOT_DIR, 'rg-backend');
const COMPILER_DIR = path.join(FRONTEND_DIR, 'compiler');

const COMPILER_PORT = 8888;
const FRONTEND_PORT = 4200;
const BACKEND_PORT = 7777;

const args = process.argv.slice(2);
const startBackend = args.includes('--full') || args.includes('--backend') || args.includes('-b');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
=======================================================
  ResuGen Local Services Launcher - Help
=======================================================
Usage:
  node start.js [options]     (or start.bat / npm start)

Options:
  (no arguments)     Starts Local Compiler (8888) + Angular Frontend (4200)
                     Uses hosted cloud backend for auth & storage (Zero MySQL/Java setup needed)
  --full, --backend  Also starts the local Spring Boot backend on port 7777 (Requires Java 17 & MySQL)
  --help, -h         Show this help message
`);
  process.exit(0);
}

const processes = [];

function killProcess(proc) {
  if (!proc || !proc.pid) return;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } catch (_) {}
  } else {
    try {
      proc.kill('SIGINT');
    } catch (_) {}
  }
}

function cleanup() {
  console.log('\n[ResuGen] Gracefully shutting down all services...');
  for (const proc of processes) {
    killProcess(proc);
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Utility: check if an HTTP port is already active
function checkHttpService(port, pathname, callback) {
  const req = http.get(`http://localhost:${port}${pathname}`, (res) => {
    callback(res.statusCode >= 200 && res.statusCode < 400);
  });
  req.on('error', () => callback(false));
  req.setTimeout(1000, () => {
    req.destroy();
    callback(false);
  });
}

function ensureDependencies() {
  const nodeModulesPath = path.join(FRONTEND_DIR, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('[ResuGen] First-time setup: Installing frontend dependencies...');
    try {
      execSync('npm install', { cwd: FRONTEND_DIR, stdio: 'inherit', shell: true });
      console.log('[ResuGen] Dependencies installed successfully.\n');
    } catch (err) {
      console.error('[ResuGen] Failed to install dependencies. Please run "npm install" inside rg-frontend.');
      process.exit(1);
    }
  }
}

function startCompilerService(done) {
  checkHttpService(COMPILER_PORT, '/', (isRunning) => {
    if (isRunning) {
      console.log(`[ResuGen] LaTeX Compiler is already running on port ${COMPILER_PORT}.`);
      done();
      return;
    }

    console.log(`[ResuGen] [1/3] Starting Local LaTeX Compiler on port ${COMPILER_PORT}...`);
    const serverScript = path.join(COMPILER_DIR, 'server.js');
    const proc = spawn('node', [serverScript], {
      cwd: COMPILER_DIR,
      stdio: 'inherit',
      shell: true
    });

    processes.push(proc);
    proc.on('error', (err) => console.error('[ResuGen] Compiler Error:', err.message));
    setTimeout(done, 1000);
  });
}

function startBackendService(done) {
  if (!startBackend) {
    console.log('[ResuGen] Backend Mode: Using hosted cloud backend (https://resugen.onrender.com/api)');
    console.log('            (Pass --full or --backend to run Spring Boot locally)');
    done();
    return;
  }

  checkHttpService(BACKEND_PORT, '/api/auth/ping', (isRunning) => {
    if (isRunning) {
      console.log(`[ResuGen] Spring Boot backend is already active on port ${BACKEND_PORT}.`);
      done();
      return;
    }

    console.log(`[ResuGen] [2/3] Starting Local Spring Boot Backend on port ${BACKEND_PORT}...`);
    const proc = spawn('mvn', ['spring-boot:run'], {
      cwd: BACKEND_DIR,
      stdio: 'inherit',
      shell: true
    });

    processes.push(proc);
    proc.on('error', (err) => console.error('[ResuGen] Backend Error:', err.message));
    done();
  });
}

function startFrontendService() {
  console.log(`[ResuGen] Starting Angular Frontend dev server on port ${FRONTEND_PORT}...`);
  const proc = spawn('npx', ['ng', 'serve'], {
    cwd: FRONTEND_DIR,
    stdio: 'inherit',
    shell: true
  });

  processes.push(proc);
  proc.on('error', (err) => console.error('[ResuGen] Frontend Error:', err.message));

  console.log('\n=======================================================');
  console.log('  ResuGen Local Services Starting:');
  console.log(`    Frontend:     http://localhost:${FRONTEND_PORT}`);
  console.log(`    Compiler:     http://localhost:${COMPILER_PORT} (Embedded Tectonic, <1s compile)`);
  console.log(`    Backend API:  ${startBackend ? `http://localhost:${BACKEND_PORT}/api (Local)` : 'https://resugen.onrender.com/api (Cloud)'}`);
  console.log('-------------------------------------------------------');
  console.log('  Press Ctrl+C to stop all services.');
  console.log('=======================================================\n');
}

console.log('=======================================================');
console.log('  ResuGen - Real-Time LaTeX Resume Builder');
console.log('=======================================================\n');

ensureDependencies();

startCompilerService(() => {
  startBackendService(() => {
    setTimeout(startFrontendService, 500);
  });
});
