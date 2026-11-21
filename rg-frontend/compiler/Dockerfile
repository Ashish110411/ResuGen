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
    && rm -rf /var/lib/apt/lists/*

# Install official Tectonic static binary for Linux x86_64
RUN curl -fsSL https://drop-sh.tectonic-typesetting.github.io/install-tectonic.sh | sh -s -- --to /usr/local/bin

WORKDIR /app

# Copy server script
COPY server.js .

# Create non-root user for container security
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

# Render and other cloud providers inject $PORT dynamically
ENV PORT=8888
EXPOSE 8888

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8888) + '/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
