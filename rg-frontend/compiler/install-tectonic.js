// ==============================================================================
// Automated Tectonic Installer for Linux (Render, Railway, Fly.io, Ubuntu)
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const binDir = path.join(__dirname, 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Skip on Windows (already has bundled bin/tectonic.exe)
if (process.platform === 'win32') {
  console.log('[install-tectonic] Windows detected. Using bundled bin/tectonic.exe.');
  process.exit(0);
}

const targetBinary = path.join(binDir, 'tectonic');

// Check if tectonic already exists in system PATH
try {
  const sysPath = execSync('which tectonic', { encoding: 'utf8' }).trim();
  if (sysPath) {
    console.log(`[install-tectonic] System tectonic found at: ${sysPath}`);
    process.exit(0);
  }
} catch (_) {}

// Check if already installed locally in bin/tectonic
if (fs.existsSync(targetBinary)) {
  try {
    execSync(`chmod +x "${targetBinary}"`);
    console.log(`[install-tectonic] Local tectonic binary already present at: ${targetBinary}`);
    process.exit(0);
  } catch (_) {}
}

console.log('[install-tectonic] Installing Tectonic for Linux (x86_64)...');

// Strategy 1: Direct official GitHub static release tarball
const TECTONIC_VERSION = '0.15.0';
const releaseUrl = `https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-x86_64-unknown-linux-gnu.tar.gz`;

try {
  console.log(`[install-tectonic] Downloading from GitHub release: ${releaseUrl}`);
  execSync(`curl -fsSL "${releaseUrl}" | tar -xz -C "${binDir}"`, { stdio: 'inherit' });
  execSync(`chmod +x "${targetBinary}"`);
  console.log('[install-tectonic] Successfully installed Tectonic to:', targetBinary);
  process.exit(0);
} catch (err1) {
  console.warn('[install-tectonic] GitHub direct download failed, trying official installer script...', err1.message);
}

// Strategy 2: Official drop-sh installer script
try {
  execSync(`curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh -s -- --to "${binDir}"`, { stdio: 'inherit' });
  execSync(`chmod +x "${targetBinary}"`);
  console.log('[install-tectonic] Successfully installed via drop-sh installer.');
  process.exit(0);
} catch (err2) {
  console.error('[install-tectonic] All installation strategies failed:', err2.message);
  process.exit(1);
}
