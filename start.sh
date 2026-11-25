#!/usr/bin/env bash
# ==============================================================================
# ResuGen Unified Local Services Launcher (Linux / macOS)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/start.js" "$@"
