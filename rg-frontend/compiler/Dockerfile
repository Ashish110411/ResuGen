# ==============================================================================
# Production Dockerfile for ResuGen LaTeX Compiler API Service
# Designed for Render, Railway, Fly.io, AWS, or any Linux Docker Host
# ==============================================================================

FROM node:20-bookworm-slim

# Install dependencies needed for fonts and HTTPS downloads
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Install official Tectonic static binary for Linux x86_64 directly from GitHub
RUN curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic

# Verify Tectonic is installed and working
RUN which tectonic && tectonic --version

WORKDIR /app

# Copy package and server files
COPY package*.json ./
RUN npm install --production --silent || true
COPY . .

# Create non-root user for container security
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

# Render injects $PORT dynamically
ENV PORT=8888
EXPOSE 8888

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8888) + '/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
