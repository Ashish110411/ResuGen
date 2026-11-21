// ==============================================================================
// ResuGen Runner: Starts Local Compiler (Port 8888) + Angular Frontend (Port 4200)
// ==============================================================================

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const COMPILER_PORT = 8888;
let compilerProcess = null;
let frontendProcess = null;

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
  frontendProcess = spawn('npx', ['ng', 'serve'], {
    stdio: 'inherit',
    shell: true
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
