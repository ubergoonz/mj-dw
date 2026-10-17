#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to start the app and documentation servers." >&2
  exit 1
fi

CONCURRENTLY="$ROOT_DIR/node_modules/.bin/concurrently"

if [[ ! -x "$CONCURRENTLY" ]]; then
  echo "Project dependencies are missing. Run 'npm install' first." >&2
  exit 1
fi

exec "$CONCURRENTLY" \
  --kill-others \
  --names app,docs \
  --prefix-colors blue,magenta \
  "npm run dev:app -- --open" \
  "npm run dev:docs"
