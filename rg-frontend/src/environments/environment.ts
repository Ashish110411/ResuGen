// ==============================================================================
// ResuGen Environment Configuration
// Automatically switches between Local Development and Production Hosting
// ==============================================================================

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Set to true if running rg-backend locally on port 7777 with local MySQL.
// Set to false to use hosted cloud backend (no Java/MySQL setup required when cloning).
const USE_LOCAL_BACKEND = false;

export const environment = {
  production: !isLocal,

  // 1. Backend REST API Server:
  // - Local dev defaults to cloud backend so anyone can clone and run immediately.
  // - Production on Netlify connects to hosted Render backend.
  apiUrl: (isLocal && USE_LOCAL_BACKEND)
    ? 'http://localhost:7777/api'
    : 'https://resugen.onrender.com/api',

  // 2. LaTeX Compiler Microservice:
  // - Local dev (localhost:4200): Uses bundled local Tectonic compiler (port 8888, <1s compile time)
  // - Production (Netlify): Uses hosted Tectonic service on Render
  compilerUrl: isLocal
    ? 'http://localhost:8888'
    : 'https://resugen-compiler.onrender.com'
};
