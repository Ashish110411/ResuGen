// ==============================================================================
// ResuGen Environment Configuration
// Centralized API and Compiler URLs to prevent CORS and Mixed Content issues
// ==============================================================================

export const environment = {
  production: true,

  // 1. Backend REST API Server (Render / Local)
  // For Production on Render:
  apiUrl: 'https://resugen.onrender.com/api',
  // For Local Development:
  // apiUrl: 'http://localhost:7777/api',

  // 2. LaTeX Compiler Microservice (Render Docker / Local)
  // For Production on Render:
  compilerUrl: 'https://resugen-compiler.onrender.com',
  // For Local Development:
  // compilerUrl: 'http://localhost:8888',
};
