#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOT_DIR="$(cd "${ADMIN_DIR}/../.." && pwd)"

if [[ ! -f "${ROOT_DIR}/package.json" ]]; then
  echo "[admin/build-vercel] No se encontró package.json en ${ROOT_DIR}" >&2
  exit 1
fi

echo "[admin/build-vercel] Workspace root: ${ROOT_DIR}"
pnpm --dir "${ROOT_DIR}" --filter @tickets-transfer/shared build
cd "${ADMIN_DIR}"
pnpm run build
