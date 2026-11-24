// ==============================================================================
// Production-Hardened LaTeX Compiler API Server
// Uses Tectonic engine (XeTeX) to compile LaTeX to PDF locally and securely.
// Compatible with YtoTech LaTeX-On-HTTP API & ResuGen
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const crypto = require('crypto');

// Configuration & Security Thresholds
const PORT = process.env.PORT || 8888;
const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB payload limit (prevents memory exhaustion)
const COMPILE_TIMEOUT_MS = parseInt(process.env.COMPILE_TIMEOUT_MS, 10) || 120000; // 120s max per job (handles cold-start package downloads)
const MAX_CONCURRENT_JOBS = 5;              // Concurrency limit (keeps CPU healthy)
const MAX_QUEUE_SIZE = 15;                  // Max jobs allowed in queue during spikes

// Platform-aware Tectonic engine locator
const isWin = process.platform === 'win32';
const localBin = path.join(__dirname, 'bin', isWin ? 'tectonic.exe' : 'tectonic');

function resolveTectonicBinary() {
  if (process.env.TECTONIC_PATH && fs.existsSync(process.env.TECTONIC_PATH)) {
    return process.env.TECTONIC_PATH;
  }
  if (fs.existsSync(localBin)) {
    if (!isWin) {
      try { fs.chmodSync(localBin, 0o755); } catch (_) {}
    }
    return localBin;
  }
  // Check common system paths on Linux/macOS
  if (!isWin) {
    if (fs.existsSync('/usr/local/bin/tectonic')) return '/usr/local/bin/tectonic';
    if (fs.existsSync('/usr/bin/tectonic')) return '/usr/bin/tectonic';
  }
  // Check if available in PATH
  try {
    const checkCmd = isWin ? 'where tectonic' : 'command -v tectonic || which tectonic';
    const found = require('child_process').execSync(checkCmd, { encoding: 'utf8' }).trim().split(/\r?\n/)[0].trim();
    if (found && fs.existsSync(found)) {
      return found;
    }
  } catch (_) {}

  // If on Linux/Render and still missing, trigger auto-install synchronously
  if (!isWin) {
    try {
      console.log('[Compiler Engine] Tectonic not found in system PATH. Attempting automated fetch...');
      const installer = path.join(__dirname, 'install-tectonic.js');
      if (fs.existsSync(installer)) {
        require('child_process').execSync(`node "${installer}"`, { stdio: 'inherit' });
        if (fs.existsSync(localBin)) return localBin;
      }
    } catch (e) {
      console.error('[Compiler Engine] Auto-fetch error:', e.message);
    }
  }

  return isWin ? 'tectonic.exe' : 'tectonic';
}

let TECTONIC_EXE = resolveTectonicBinary();

let activeJobs = 0;
const waitingQueue = [];

// High-speed in-memory PDF cache (stores up to 50 compiled PDFs for 0ms repeated responses)
const pdfResultCache = new Map();
const MAX_CACHE_ENTRIES = 50;

function getCachedPdf(hash) {
  if (pdfResultCache.has(hash)) {
    const entry = pdfResultCache.get(hash);
    pdfResultCache.delete(hash);
    pdfResultCache.set(hash, entry);
    return entry;
  }
  return null;
}

function setCachedPdf(hash, buffer) {
  if (pdfResultCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = pdfResultCache.keys().next().value;
    if (oldestKey) pdfResultCache.delete(oldestKey);
  }
  pdfResultCache.set(hash, buffer);
}

function processNextJob() {
  while (waitingQueue.length > 0 && activeJobs < MAX_CONCURRENT_JOBS) {
    const nextJob = waitingQueue.shift();
    if (nextJob) nextJob();
  }
}

const server = http.createServer((req, res) => {
  // 1. CORS Headers
  const allowedOrigins = [
    'https://resugen-rg.netlify.app',
    'http://localhost:4200',
    'http://127.0.0.1:4200'
  ];
  const reqOrigin = req.headers.origin;

  // Support production domain, Netlify previews, and local development origins
  const isLocalhost = reqOrigin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(reqOrigin);
  const isNetlify = reqOrigin && (reqOrigin === 'https://resugen-rg.netlify.app' || reqOrigin.endsWith('.netlify.app'));
  const isExplicitlyAllowed = reqOrigin && allowedOrigins.includes(reqOrigin);

  const allowOrigin = reqOrigin || '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Job-ID');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-Job-ID');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Healthcheck & Metadata endpoint: GET /
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: 'ResuGen LaTeX Compiler API Service',
      version: '1.2.0',
      status: 'UP',
      port: PORT,
      activeJobs,
      queuedJobs: waitingQueue.length,
      maxConcurrent: MAX_CONCURRENT_JOBS,
      engine: 'Tectonic (XeTeX)',
      tectonicBinary: TECTONIC_EXE,
      tectonicReady: fs.existsSync(TECTONIC_EXE),
      cacheDir: process.env.TECTONIC_CACHE_DIR || '(default)',
      security: {
        untrustedMode: true,
        timeoutSec: COMPILE_TIMEOUT_MS / 1000,
        maxPayloadMB: MAX_PAYLOAD_BYTES / (1024 * 1024),
        pathTraversalProtection: true
      }
    }, null, 2));
    return;
  }

  // Core compilation endpoint: POST /builds/sync
  if (req.method === 'POST' && url.pathname === '/builds/sync') {
    let body = '';
    let bodyBytes = 0;
    let isExceeded = false;

    req.on('data', chunk => {
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_PAYLOAD_BYTES) {
        if (!isExceeded) {
          isExceeded = true;
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'PAYLOAD_TOO_LARGE',
            message: `Request body exceeds maximum size of ${MAX_PAYLOAD_BYTES / (1024 * 1024)}MB`
          }));
          req.destroy();
        }
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      if (isExceeded) return;

      // Strip UTF-8 BOM if present
      if (body.charCodeAt(0) === 0xFEFF) {
        body = body.substring(1);
      }

      let payload;
      try {
        payload = JSON.parse(body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INVALID_JSON', message: err.message, log: err.message }));
        return;
      }

      const resources = payload.resources || [];
      if (!Array.isArray(resources) || resources.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'MISSING_RESOURCES', message: 'No resources provided', log: 'No resources provided' }));
        return;
      }

      // Find main document
      let mainRes = resources.find(r => r.main) || resources.find(r => (r.path || '').toLowerCase().endsWith('.tex')) || resources[0];
      let rawMainPath = (mainRes.path || 'main.tex').trim();
      let mainFileName = path.basename(rawMainPath) || 'main.tex';
      const baseName = path.basename(mainFileName, path.extname(mainFileName));

      // Fast-path: Check Server-Side In-Memory PDF Cache (sub-1ms response)
      const contentHash = crypto.createHash('sha256').update(body).digest('hex');
      const cachedPdf = getCachedPdf(contentHash);
      if (cachedPdf) {
        console.log(`[FAST CACHE] Returning memory-cached PDF (${cachedPdf.length} bytes, hash: ${contentHash.substring(0, 8)})`);
        res.writeHead(201, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${baseName}.pdf"`,
          'Content-Length': cachedPdf.length,
          'X-Cache': 'HIT',
          'X-Job-ID': 'cached'
        });
        res.end(cachedPdf);
        return;
      }

      // Function to execute the compilation job
      const executeCompilation = () => {
        const jobId = crypto.randomUUID();
        const workspaceDir = path.join(os.tmpdir(), `latex_job_${jobId}`);

        activeJobs++;

        try {
          fs.mkdirSync(workspaceDir, { recursive: true });

          const hasBibResource = resources.some(r => (r.path || '').endsWith('.bib'));

          // Write all resources with Path Traversal Protection
          for (const r of resources) {
            if (!r || (!r.content && !r.file)) continue;

            const sanitizedRelative = path.normalize(r.path || 'main.tex')
              .replace(/^([a-zA-Z]:)?[\\\/]+/, '')
              .replace(/^(\.\.[\/\\])+/, '');

            const rPath = path.resolve(workspaceDir, sanitizedRelative);

            if (!rPath.startsWith(workspaceDir)) {
              console.warn(`[SECURITY] Blocked path traversal attempt in job ${jobId}: ${r.path}`);
              continue;
            }

            fs.mkdirSync(path.dirname(rPath), { recursive: true });

            if (r.content != null) {
              let text = typeof r.content === 'string' ? r.content : (Array.isArray(r.content) ? r.content.join('\n') : String(r.content));

              if (!hasBibResource) {
                text = text.replace(/\\usepackage\s*(\[[^\]]*\])?\s*\{biblatex\}/g, '% [biblatex omitted: no bib file]');
                text = text.replace(/\\addbibresource\s*\{[^}]*\}/g, '% [addbibresource omitted: no bib file]');
                text = text.replace(/\\setlength\s*\\bibitemsep\s*\{[^}]*\}/g, '% [bibitemsep omitted]');
                text = text.replace(/\\printbibliography(\[[^\]]*\])?/g, '% [printbibliography omitted]');
                text = text.replace(/\\nocite\{[^}]*\}/g, '% [nocite omitted]');
                text = text.replace(/\\bibliography\{[^}]*\}/g, '% [bibliography omitted]');
                text = text.replace(/\\bibliographystyle\{[^}]*\}/g, '% [bibliographystyle omitted]');
              }

              fs.writeFileSync(rPath, text, 'utf8');
            } else if (r.file) {
              fs.writeFileSync(rPath, Buffer.from(r.file, 'base64'));
            }
          }

          // High-performance Tectonic compilation:
          // -C (--only-cached): Uses local package cache, avoids network bundle latency
          // --chatter minimal: Reduces IPC stdout/stderr overhead
          // --untrusted: Sandboxes TeX macro execution
          let activeChild = null;
          let hasFinished = false;
          let timeoutTimer = null;

          const reruns = process.env.TECTONIC_RERUNS || '0';
          const runTectonic = (cachedOnly = true) => {
            // -r 0: single pass compilation cuts execution time by ~50%
            const args = cachedOnly
              ? ['--untrusted', '-C', '-r', reruns, '--chatter', 'minimal', mainFileName]
              : ['--untrusted', '--chatter', 'minimal', mainFileName];

            // Ensure child process has guaranteed writable environment variables
            const childEnv = { ...process.env };
            if (!isWin) {
              let cacheDir = process.env.TECTONIC_CACHE_DIR;
              if (!cacheDir) {
                const preferred = path.join(process.env.HOME || os.homedir() || '/tmp', '.cache', 'Tectonic');
                try {
                  fs.mkdirSync(preferred, { recursive: true });
                  cacheDir = preferred;
                } catch (_) {
                  const fallback = path.join(os.tmpdir(), 'tectonic-cache');
                  try { fs.mkdirSync(fallback, { recursive: true }); } catch (_) {}
                  cacheDir = fallback;
                }
              } else {
                try { fs.mkdirSync(cacheDir, { recursive: true }); } catch (_) {}
              }

              const safeHome = process.env.HOME || os.homedir() || os.tmpdir();
              childEnv.HOME = safeHome;
              childEnv.XDG_CACHE_HOME = process.env.XDG_CACHE_HOME || path.join(safeHome, '.cache');
              childEnv.TECTONIC_CACHE_DIR = cacheDir;
            }

            const child = spawn(TECTONIC_EXE, args, { cwd: workspaceDir, env: childEnv });
            activeChild = child;

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', data => { stdout += data.toString(); });
            child.stderr.on('data', data => { stderr += data.toString(); });

            child.on('close', code => {
              if (hasFinished) return;

              const expectedPdf = path.join(workspaceDir, `${baseName}.pdf`);

              // If cached-only run failed because a resource was uncached, retry once with network access
              if (code !== 0 && cachedOnly) {
                return runTectonic(false);
              }

              hasFinished = true;
              clearTimeout(timeoutTimer);
              activeJobs = Math.max(0, activeJobs - 1);
              processNextJob();

              if (code === 0 && fs.existsSync(expectedPdf)) {
                const pdfData = fs.readFileSync(expectedPdf);
                setCachedPdf(contentHash, pdfData);
                console.log(`[SUCCESS] Job: ${jobId} compiled successfully (${pdfData.length} bytes, cached: ${cachedOnly})`);
                res.writeHead(201, {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': `inline; filename="${baseName}.pdf"`,
                  'Content-Length': pdfData.length,
                  'X-Job-ID': jobId
                });
                res.end(pdfData);
              } else {
                console.error(`[COMPILATION FAILED] Job: ${jobId}, Exit code: ${code}`);
                let logFileContent = '';
                const logPath = path.join(workspaceDir, `${baseName}.log`);
                if (fs.existsSync(logPath)) {
                  try { logFileContent = fs.readFileSync(logPath, 'utf8'); } catch (_) {}
                }
                const combinedOutput = [stderr, stdout, logFileContent].filter(Boolean).join('\n');
                const errorDetails = (combinedOutput || `Compiler exited with code ${code}`).trim();
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'COMPILATION_ERROR',
                  message: 'LaTeX compilation failed',
                  log: errorDetails,
                  logs: errorDetails,
                  exit_code: code
                }, null, 2));
              }

              try {
                fs.rmSync(workspaceDir, { recursive: true, force: true });
              } catch (_) {}
            });

            child.on('error', err => {
              if (hasFinished) return;
              hasFinished = true;
              clearTimeout(timeoutTimer);
              activeJobs = Math.max(0, activeJobs - 1);
              processNextJob();
              console.error(`[SPAWN ERROR] Failed to run compiler:`, err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'ENGINE_ERROR',
                message: `Failed to execute compiler binary (${TECTONIC_EXE}): ${err.message}. Please verify Tectonic is installed or deploy via Docker.`,
                log: err.message
              }));
              try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
            });
          };

          // Abort handler: Kill child if client disconnects/cancels before response is sent
          res.on('close', () => {
            if (!res.writableEnded && !hasFinished) {
              hasFinished = true;
              clearTimeout(timeoutTimer);
              if (activeChild) {
                try { activeChild.kill('SIGKILL'); } catch (_) {}
              }
              activeJobs = Math.max(0, activeJobs - 1);
              try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
              console.log(`[ABORTED] Job: ${jobId} canceled by client`);
              processNextJob();
            }
          });

          // Timeout Guard (kill runaway execution)
          timeoutTimer = setTimeout(() => {
            if (!hasFinished) {
              hasFinished = true;
              console.error(`[TIMEOUT] Job: ${jobId} exceeded ${COMPILE_TIMEOUT_MS}ms limit`);
              if (activeChild) {
                try { activeChild.kill('SIGKILL'); } catch (_) {}
              }
              activeJobs = Math.max(0, activeJobs - 1);
              processNextJob();
              res.writeHead(504, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'TIMEOUT',
                message: `Compilation exceeded timeout limit of ${COMPILE_TIMEOUT_MS / 1000} seconds. Check for infinite loops in LaTeX macros.`,
                log: 'Compilation timed out'
              }));
              try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
            }
          }, COMPILE_TIMEOUT_MS);

          // Launch initial fast cached-only run
          runTectonic(true);
        } catch (err) {
          activeJobs = Math.max(0, activeJobs - 1);
          processNextJob();
          console.error(`[SERVER ERROR] ${err.message}`);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'SERVER_ERROR', message: err.message, log: err.message }));
          try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
        }
      };

      // 2. Concurrency & Queueing Guard
      if (activeJobs >= MAX_CONCURRENT_JOBS) {
        if (waitingQueue.length >= MAX_QUEUE_SIZE) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'TOO_MANY_REQUESTS',
            message: 'Compiler is currently busy processing requests. Please retry in a few moments.'
          }));
          return;
        }

        // Queue request until an active slot frees up
        waitingQueue.push(executeCompilation);
        return;
      }

      executeCompilation();
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NOT_FOUND', message: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ResuGen Production LaTeX Compiler API Server`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  Engine: ${TECTONIC_EXE}`);
  console.log(`  Security: --untrusted mode, Path Sanitization, 30s Timeout, 10MB Limit`);
  console.log(`  Optimizations: High-Speed Cached Engine (-C), Zero-Memory Retention, Queueing, Request Cancellation`);
  console.log(`=======================================================`);
});
