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
const COMPILE_TIMEOUT_MS = 30000;           // 30 seconds max per job (prevents infinite loop DoS)
const MAX_CONCURRENT_JOBS = 5;              // Concurrency semaphore (prevents CPU exhaustion)

// Platform-aware Tectonic engine locator
const isWin = process.platform === 'win32';
const localBin = path.join(__dirname, 'bin', isWin ? 'tectonic.exe' : 'tectonic');
const TECTONIC_EXE = fs.existsSync(localBin) ? localBin : (process.env.TECTONIC_PATH || 'tectonic');

let activeJobs = 0;

const server = http.createServer((req, res) => {
  // 1. CORS Headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Job-ID');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, X-Job-ID');

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
      version: '1.1.0',
      status: 'UP',
      port: PORT,
      activeJobs,
      maxConcurrent: MAX_CONCURRENT_JOBS,
      engine: 'Tectonic (XeTeX)',
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
    // Concurrency Check
    if (activeJobs >= MAX_CONCURRENT_JOBS) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'TOO_MANY_REQUESTS',
        message: 'Compiler is currently busy processing requests. Please retry in a few moments.'
      }));
      return;
    }

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

      // Find main document (safely prioritize .main flag, then .tex extension)
      let mainRes = resources.find(r => r.main) || resources.find(r => (r.path || '').toLowerCase().endsWith('.tex')) || resources[0];
      let rawMainPath = (mainRes.path || 'main.tex').trim();
      let mainFileName = path.basename(rawMainPath) || 'main.tex';

      // Create isolated temporary workspace
      const jobId = crypto.randomUUID();
      const workspaceDir = path.join(os.tmpdir(), `latex_job_${jobId}`);

      activeJobs++;

      try {
        fs.mkdirSync(workspaceDir, { recursive: true });

        const hasBibResource = resources.some(r => (r.path || '').endsWith('.bib'));

        // Write all resources with Path Traversal Protection
        for (const r of resources) {
          if (!r || (!r.content && !r.file)) continue;

          // Security: Normalize path, remove '../', './', and drive letters
          const sanitizedRelative = path.normalize(r.path || 'main.tex')
            .replace(/^([a-zA-Z]:)?[\\\/]+/, '')
            .replace(/^(\.\.[\/\\])+/, '');

          const rPath = path.resolve(workspaceDir, sanitizedRelative);

          // Hard verification that rPath resides inside workspaceDir
          if (!rPath.startsWith(workspaceDir)) {
            console.warn(`[SECURITY] Blocked path traversal attempt in job ${jobId}: ${r.path}`);
            continue;
          }

          fs.mkdirSync(path.dirname(rPath), { recursive: true });

          if (r.content != null) {
            let text = typeof r.content === 'string' ? r.content : (Array.isArray(r.content) ? r.content.join('\n') : String(r.content));

            // ResuGen & Resume template fix:
            // Strip biblatex & biber hooks if no .bib is uploaded
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

        // Tectonic execution with --untrusted flag for sandboxing
        const baseName = path.basename(mainFileName, path.extname(mainFileName));
        const child = spawn(TECTONIC_EXE, ['--untrusted', mainFileName], { cwd: workspaceDir });

        let stdout = '';
        let stderr = '';
        let hasFinished = false;

        child.stdout.on('data', data => { stdout += data.toString(); });
        child.stderr.on('data', data => { stderr += data.toString(); });

        // Timeout Guard (kill runaway execution)
        const timeoutTimer = setTimeout(() => {
          if (!hasFinished) {
            hasFinished = true;
            console.error(`[TIMEOUT] Job: ${jobId} exceeded ${COMPILE_TIMEOUT_MS}ms limit`);
            try { child.kill('SIGKILL'); } catch (_) {}
            activeJobs = Math.max(0, activeJobs - 1);
            res.writeHead(504, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'TIMEOUT',
              message: `Compilation exceeded timeout limit of ${COMPILE_TIMEOUT_MS / 1000} seconds. Check for infinite loops in LaTeX macros.`,
              log: stderr || stdout
            }));
            try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
          }
        }, COMPILE_TIMEOUT_MS);

        child.on('close', code => {
          if (hasFinished) return;
          hasFinished = true;
          clearTimeout(timeoutTimer);
          activeJobs = Math.max(0, activeJobs - 1);

          const expectedPdf = path.join(workspaceDir, `${baseName}.pdf`);

          if (code === 0 && fs.existsSync(expectedPdf)) {
            const pdfData = fs.readFileSync(expectedPdf);
            console.log(`[SUCCESS] Job: ${jobId} compiled successfully (${pdfData.length} bytes)`);
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

          // Guaranteed Workspace Cleanup
          try {
            fs.rmSync(workspaceDir, { recursive: true, force: true });
          } catch (_) {}
        });

        child.on('error', (err) => {
          if (hasFinished) return;
          hasFinished = true;
          clearTimeout(timeoutTimer);
          activeJobs = Math.max(0, activeJobs - 1);
          console.error(`[SPAWN ERROR] Failed to run compiler:`, err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'ENGINE_ERROR',
            message: `Failed to execute compiler binary: ${err.message}`,
            log: err.message
          }));
          try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
        });

      } catch (err) {
        activeJobs = Math.max(0, activeJobs - 1);
        console.error(`[SERVER ERROR] ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SERVER_ERROR', message: err.message, log: err.message }));
        try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch (_) {}
      }
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
  console.log(`=======================================================`);
});
