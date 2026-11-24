// ==============================================================================
// ResuGen Environment Configuration
// Automatically switches between Local Development and Production Hosting
// ==============================================================================

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const environment = {
  production: !isLocal,

  // 1. Backend REST API Server (Render in production, localhost:7777 in dev)
  apiUrl: isLocal ? 'http://localhost:7777/api' : 'https://resugen.onrender.com/api',

  // 2. LaTeX Compiler Microservice (Render in production, localhost:8888 in dev)
  compilerUrl: isLocal ? 'http://localhost:8888' : 'https://resugen-compiler.onrender.com'
};
