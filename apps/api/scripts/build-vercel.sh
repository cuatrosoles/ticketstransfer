#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

if [[ ! -f "${ROOT_DIR}/package.json" ]]; then
  echo "[build-vercel] No se encontró package.json en ${ROOT_DIR}" >&2
  exit 1
fi

echo "[build-vercel] Workspace root: ${ROOT_DIR}"
pnpm --dir "${ROOT_DIR}" --filter @tickets-transfer/shared build
pnpm --dir "${ROOT_DIR}" --filter api build
node "${SCRIPT_DIR}/bundle-tesseract-core.mjs"
