/**
 * Vercel: no hay binarios `tar` ni `curl` en el PATH del runtime.
 * Descargamos el .tgz con fetch y lo extraemos con el paquete npm `tar`.
 */
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { x as tarExtract } from 'tar';

const VERSION = '7.0.0';
const DEST = join('/tmp', `tesseract-js-core-v${VERSION.replace(/\./g, '-')}`);
const TGZ_URL = `https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-${VERSION}.tgz`;

export async function ensureTesseractCoreV7InTmp() {
  if (process.env.VERCEL !== '1') return;

  if (existsSync(join(DEST, '.ok'))) {
    process.env.TESSERACT_CORE_V7_DIR = DEST;
    return;
  }

  const tgz = join('/tmp', `tesseract-js-core-${VERSION}-${Date.now()}.tgz`);
  const wdir = join('/tmp', `tesseract-extract-${Date.now()}`);

  const res = await fetch(TGZ_URL);
  if (!res.ok) {
    throw new Error(`[install-tesseract-core] HTTP ${res.status} al descargar ${TGZ_URL}`);
  }
  writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));

  mkdirSync(wdir, { recursive: true });
  try {
    await tarExtract({ file: tgz, cwd: wdir });
    rmSync(DEST, { recursive: true, force: true });
    renameSync(join(wdir, 'package'), DEST);
    writeFileSync(join(DEST, '.ok'), '1');
  } finally {
    rmSync(wdir, { recursive: true, force: true });
    rmSync(tgz, { force: true });
  }

  process.env.TESSERACT_CORE_V7_DIR = DEST;
}

/**
 * Código del worker de Tesseract para Vercel (se escribe en /tmp al arrancar).
 * No puede vivir solo como .cjs en el repo: Vercel no lo incluye en el bundle del serverless.
 * createRequire usa TESSERACT_WORKER_REQUIRE_FROM (ruta absoluta a apps/api/package.json).
 */
export function getVercelTesseractWorkerBootstrapCjs() {
  return [
    "'use strict';",
    '',
    '/**',
    ' * Worker Tesseract (Vercel): redirige tesseract.js-core a TESSERACT_CORE_V7_DIR.',
    ' */',
    "const Module = require('module');",
    "const path = require('path');",
    "const fs = require('fs');",
    '',
    'const CORE = process.env.TESSERACT_CORE_V7_DIR;',
    "if (!CORE || !fs.existsSync(path.join(CORE, 'package.json'))) {",
    "  throw new Error(",
    "    '[tesseract-worker-bootstrap] TESSERACT_CORE_V7_DIR inválido: ' + String(CORE)",
    '  );',
    '}',
    '',
    'const orig = Module._resolveFilename;',
    'Module._resolveFilename = function (request, parent, isMain, options) {',
    "  if (request === 'tesseract.js-core' || request.startsWith('tesseract.js-core/')) {",
    "    const rel = request === 'tesseract.js-core' ? 'package.json' : request.slice('tesseract.js-core/'.length);",
    '    const base = path.join(CORE, rel);',
    "    const candidates = [base, base + '.js', base + '.json'];",
    '    for (const p of candidates) {',
    '      try {',
    '        if (fs.existsSync(p) && fs.statSync(p).isFile()) {',
    '          return path.resolve(p);',
    '        }',
    '      } catch {',
    '        /* */',
    '      }',
    '    }',
    '  }',
    '  return orig.apply(this, arguments);',
    '};',
    '',
    "const { createRequire } = require('module');",
    'const pkgJson = process.env.TESSERACT_WORKER_REQUIRE_FROM;',
    "if (!pkgJson) {",
    "  throw new Error('[tesseract-worker-bootstrap] Falta TESSERACT_WORKER_REQUIRE_FROM');",
    '}',
    'const req = createRequire(pkgJson);',
    "const realWorker = req.resolve('tesseract.js/src/worker-script/node/index.js');",
    'require(realWorker);',
    '',
  ].join('\n');
}
