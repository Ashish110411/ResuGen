# ResuGen LaTeX Compiler API Service

The dedicated, lightweight backend compilation service for **ResuGen**. It executes the embedded [Tectonic](https://tectonic-typesetting.github.io/) typesetting engine to compile LaTeX templates into ATS-friendly vector PDFs in real time.

---

## 🏗️ Architecture & How It Works

1. **Locally (Windows)**:
   - Starts automatically via `start-app.js` (`npm start`) on port `8888`.
   - Executes the pre-bundled Windows binary: `bin/tectonic.exe`.
   - Zero local TeXLive / MiKTeX installation required.

2. **In Production (Linux / Cloud)**:
   - Runs as a standalone Web Service on Render, Railway, Fly.io, or Docker.
   - Executes the pre-bundled Linux x86_64 binary: `bin/tectonic`.
   - Exposes `GET /` (health check) and `POST /builds/sync` (synchronous compilation to binary PDF).

---

## 🚀 How to Run Locally

### Start Compiler Independently:
```bash
cd rg-frontend/compiler
npm start
# or: node server.js
```
The server will start on `http://localhost:8888`.

### Start Entire Frontend + Compiler Together:
```bash
cd rg-frontend
npm start
```
This uses `start-app.js` to launch both the compiler (port `8888`) and the Angular dev server (port `4200`).

---

## ☁️ How to Deploy the Compiler to Production (Render)

Because Netlify only hosts static frontend assets and cannot execute binary executables, the compiler runs as a separate backend service on Render.

### Option A: Deploy via Docker (Recommended)
1. In [Render Dashboard](https://dashboard.render.com/), click **New +** &rarr; **Web Service**.
2. Connect your **`ResuGen`** GitHub repository.
3. Configure the service:
   - **Name**: `resugen-compiler` (or your chosen name)
   - **Root Directory**: `rg-frontend/compiler`
   - **Runtime**: **Docker**
   - **Instance Type**: **Free**
4. Click **Create Web Service**.
5. Render builds the Dockerfile, starts the server, and provides an HTTPS URL (e.g. `https://resugen-compiler.onrender.com`).

### Option B: Deploy via Node.js
1. In Render Dashboard, click **New +** &rarr; **Web Service**.
2. Set:
   - **Root Directory**: `rg-frontend/compiler`
   - **Runtime**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Click **Create Web Service**.
   *(During build, `npm install` runs `install-tectonic.js` to ensure the Linux binary is present and executable).*

---

## ⚙️ Environment Variables & Configuration

### Compiler Backend (Render / Cloud)
| Variable | Default | Description |
| :--- | :---: | :--- |
| `PORT` | `8888` | Injected dynamically by Render / cloud host |
| `TECTONIC_PATH` | *(Auto-detected)* | Custom path to Tectonic binary if not using `bin/` |

### Frontend Connection ([rg-frontend/src/environments/environment.ts](../src/environments/environment.ts))
The frontend automatically detects whether you are on `localhost` or Netlify:
- **On `localhost`**: Automatically uses `http://localhost:8888`.
- **On Netlify**: Automatically uses `https://resugen-compiler.onrender.com`.

If your deployed Render compiler URL is different, update `compilerUrl` in `src/environments/environment.ts`:
```typescript
export const environment = {
  apiUrl: isLocal ? 'http://localhost:7777/api' : 'https://resugen.onrender.com/api',
  compilerUrl: isLocal ? 'http://localhost:8888' : 'https://<your-compiler-app>.onrender.com'
};
```

---

## 🧪 Testing the Compiler

### 1. Healthcheck Test
```bash
curl https://<your-compiler-app>.onrender.com/
```
Expected response:
```json
{
  "name": "ResuGen LaTeX Compiler API Service",
  "status": "UP",
  "engine": "Tectonic (XeTeX)",
  "tectonicReady": true
}
```

### 2. Compilation Test (Generate PDF)
```bash
curl -X POST https://<your-compiler-app>.onrender.com/builds/sync \
  -H "Content-Type: application/json" \
  -d '{"compiler":"pdflatex","resources":[{"path":"main.tex","content":"\\documentclass{article}\\begin{document}Hello World\\end{document}"}]}' \
  --output test.pdf
```
If successful, `test.pdf` is created and valid.
