// ==============================================================================
// ResuGen Runner: Starts Local Compiler (Port 8888) + Angular Frontend (Port 4200)
// ==============================================================================

const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const COMPILER_PORT = 8888;
let compilerProcess = null;
let frontendProcess = null;

function ensureDependencies() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const devServerBuilder = path.join(nodeModulesPath, '@angular-devkit', 'build-angular');
  const angularCli = path.join(nodeModulesPath, '@angular', 'cli');

  const needsInstall = !fs.existsSync(nodeModulesPath) ||
                       !fs.existsSync(devServerBuilder) ||
                       !fs.existsSync(angularCli);

  if (needsInstall) {
    console.log('[ResuGen] Dependencies missing or incomplete. Installing frontend dependencies (including devDependencies)...');
    try {
      execSync('npm install --include=dev', {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, NODE_ENV: 'development' }
      });
      console.log('[ResuGen] Dependencies installed successfully.\n');
    } catch (err) {
      console.error('[ResuGen] Failed to install dependencies. Please run "npm install --include=dev" inside rg-frontend.');
      process.exit(1);
    }
  }
}

function checkCompiler(callback) {
  const req = http.get(`http://localhost:${COMPILER_PORT}/`, (res) => {
    callback(res.statusCode === 200);
  });
  req.on('error', () => callback(false));
  req.setTimeout(1000, () => {
    req.destroy();
    callback(false);
  });
}

function startCompiler() {
  console.log(`[ResuGen] Starting embedded LaTeX compiler server on port ${COMPILER_PORT}...`);
  const serverScript = path.join(__dirname, 'compiler', 'server.js');
  compilerProcess = spawn('node', [serverScript], {
    stdio: 'inherit',
    shell: true
  });

  compilerProcess.on('error', (err) => {
    console.error('[ResuGen] Failed to start compiler server:', err);
  });
}

function startFrontend() {
  console.log('[ResuGen] Starting Angular dev server (ng serve)...');
  frontendProcess = spawn('npm', ['run', 'start:frontend'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  frontendProcess.on('error', (err) => {
    console.error('[ResuGen] Failed to start Angular frontend:', err);
  });
}

function cleanup() {
  console.log('\n[ResuGen] Shutting down services...');
  if (compilerProcess) {
    try { compilerProcess.kill(); } catch (_) {}
  }
  if (frontendProcess) {
    try { frontendProcess.kill(); } catch (_) {}
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

ensureDependencies();

// Check if compiler is already active
checkCompiler((isRunning) => {
  if (isRunning) {
    console.log(`[ResuGen] LaTeX compiler is already running on port ${COMPILER_PORT}.`);
  } else {
    startCompiler();
  }
  // Start frontend after brief pause for compiler socket
  setTimeout(startFrontend, 500);
});
