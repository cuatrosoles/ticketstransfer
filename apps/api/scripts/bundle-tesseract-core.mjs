#!/usr/bin/env node
/**
 * Vercel + pnpm: el worker hace require('tesseract.js-core/...') y Node resuelve
 * el paquete en .pnpm/.../node_modules/tesseract.js-core, no en el hoist plano.
 * El file tracing de Vercel no sube los .wasm. Reemplazamos cada instalación física
 * del paquete por una copia completa (mismo origen que resolve()).
 */
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(__dirname, '..');
const monorepoRoot = join(apiRoot, '..', '..');

function resolveSourceCoreDir() {
  for (const root of [monorepoRoot, apiRoot]) {
    try {
      const r = createRequire(join(root, 'package.json'));
      return dirname(r.resolve('tesseract.js-core/package.json'));
    } catch {
      /* siguiente */
    }
  }
  throw new Error('[bundle-tesseract-core] No se pudo resolver tesseract.js-core. Ejecutá pnpm install en la raíz v2.');
}

/**
 * Rutas donde pnpm/npm suelen instalar tesseract.js-core.
 * @param {string} nodeModulesRoot
 */
function collectTesseractCoreDirs(nodeModulesRoot) {
  const out = [];
  const pushIfPackage = (dir) => {
    try {
      const raw = readFileSync(join(dir, 'package.json'), 'utf8');
      if (JSON.parse(raw).name === 'tesseract.js-core') out.push(dir);
    } catch {
      /* */
    }
  };

  const flat = join(nodeModulesRoot, 'tesseract.js-core');
  if (existsSync(flat)) pushIfPackage(flat);

  const pnpmDir = join(nodeModulesRoot, '.pnpm');
  if (existsSync(pnpmDir)) {
    for (const name of readdirSync(pnpmDir)) {
      if (!name.startsWith('tesseract.js-core@')) continue;
      const nested = join(pnpmDir, name, 'node_modules', 'tesseract.js-core');
      if (existsSync(nested)) pushIfPackage(nested);
    }
  }
  return out;
}

function uniqueRealpaths(paths) {
  const seen = new Set();
  const targets = [];
  for (const p of paths) {
    try {
      const rp = realpathSync(p);
      if (!seen.has(rp)) {
        seen.add(rp);
        targets.push(rp);
      }
    } catch {
      if (!seen.has(p)) {
        seen.add(p);
        targets.push(p);
      }
    }
  }
  return targets;
}

const srcDir = resolveSourceCoreDir();
if (!existsSync(srcDir)) {
  console.error('[bundle-tesseract-core] Origen inexistente:', srcDir);
  process.exit(1);
}

const nmRoots = [join(monorepoRoot, 'node_modules'), join(apiRoot, 'node_modules')].filter((d) => existsSync(d));

const candidates = [];
for (const nm of nmRoots) {
  candidates.push(...collectTesseractCoreDirs(nm));
}

if (candidates.length === 0) {
  console.error('[bundle-tesseract-core] No hay tesseract.js-core bajo node_modules. Revisá:', nmRoots.join(', '));
  process.exit(1);
}

const targets = uniqueRealpaths(candidates);
if (targets.length === 0) {
  console.error('[bundle-tesseract-core] No quedaron destinos tras deduplicar.');
  process.exit(1);
}

// No borrar srcDir antes de copiar: suele ser la misma ruta física que uno de los targets (.pnpm).
const staging = mkdtempSync(join(tmpdir(), 'tesseract-core-src-'));
cpSync(srcDir, staging, { recursive: true });

for (const dest of targets) {
  rmSync(dest, { recursive: true, force: true });
  cpSync(staging, dest, { recursive: true });
  console.log('[bundle-tesseract-core] OK:', dest);
}

rmSync(staging, { recursive: true, force: true });
