# ==============================================================================
# Production Dockerfile for ResuGen LaTeX Compiler API Service
# Designed for Render, Railway, Fly.io, AWS, or any Linux Docker Host
# ==============================================================================

FROM node:20-bookworm-slim

# Install system runtime libraries required by Tectonic (fontconfig, graphite2, ssl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    libgraphite2-3 \
    libssl3 \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Install official Tectonic static binary for Linux x86_64
RUN curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C /usr/local/bin \
    && chmod +x /usr/local/bin/tectonic

# Verify Tectonic executes cleanly (using direct path, no 'which' dependency)
RUN /usr/local/bin/tectonic --version

WORKDIR /app

# Copy package and server files
COPY package*.json ./
RUN npm install --production --silent || true
COPY . .

# Ensure local bin copy is also executable
RUN if [ -f bin/tectonic ]; then chmod +x bin/tectonic; fi

# Create non-root user with home directory and cache permissions
RUN groupadd -r appuser && useradd -m -r -g appuser appuser \
    && mkdir -p /home/appuser/.cache/Tectonic /tmp/tectonic-cache \
    && chown -R appuser:appuser /home/appuser /app /tmp/tectonic-cache \
    && chmod 777 /tmp/tectonic-cache

ENV HOME=/home/appuser
ENV XDG_CACHE_HOME=/home/appuser/.cache
ENV TECTONIC_CACHE_DIR=/home/appuser/.cache/Tectonic

USER appuser

# Pre-warm Tectonic TeX bundles, packages, and fonts during Docker build
# This bakes all required packages into the Docker image so runtime compilation is instant (1-2s)
RUN printf '\\documentclass[a4paper,11pt]{article}\n\\usepackage[english]{babel}\n\\usepackage{geometry,url,parskip,color,graphicx,adjustbox,tabularx,fontawesome5,enumitem,supertabular,titlesec,multicol,multirow,fancyhdr,etoolbox,paracol,microtype,hyperref}\n\\begin{document}\nPrewarm\n\\end{document}\n' > /tmp/prewarm1.tex \
    && (/usr/local/bin/tectonic /tmp/prewarm1.tex -o /tmp || true) \
    && printf '\\documentclass[a4paper,11pt]{article}\n\\usepackage[english]{babel}\n\\usepackage{cmbright,enumitem,fancyhdr,fontawesome5,geometry,hyperref,microtype,paracol,supertabular,titlesec,etoolbox}\n\\usepackage[sf]{libertine}\n\\begin{document}\nPrewarmHR\n\\end{document}\n' > /tmp/prewarm2.tex \
    && (/usr/local/bin/tectonic /tmp/prewarm2.tex -o /tmp || true) \
    && rm -f /tmp/prewarm*

# Render injects $PORT dynamically
ENV PORT=8888
EXPOSE 8888

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 8888) + '/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
