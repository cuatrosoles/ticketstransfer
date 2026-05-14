// @ts-nocheck
/**
 * Punto de entrada serverless para Vercel.
 * Redirige todas las peticiones al bundle Express (dist/index.js).
 *
 * Tesseract: los .wasm no van en el bundle; el core se instala en /tmp. El worker bootstrap
 * tampoco puede ser solo un .cjs en el repo (Vercel no lo empaqueta): se genera en /tmp.
 *
 * dist/index.js lo genera esbuild sin .d.ts; el chequeo de tipos no aporta en este archivo.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VERCEL_WORKER_TMP = '/tmp/tesseract-worker-bootstrap.cjs';

if (process.env.VERCEL === '1') {
  const apiEntryDir = dirname(fileURLToPath(import.meta.url));
  process.env.TESSERACT_WORKER_REQUIRE_FROM = join(apiEntryDir, '..', 'package.json');

  const { ensureTesseractCoreV7InTmp, getVercelTesseractWorkerBootstrapCjs } = await import(
    './install-tesseract-core-tmp.mjs'
  );
  await ensureTesseractCoreV7InTmp();
  writeFileSync(VERCEL_WORKER_TMP, getVercelTesseractWorkerBootstrapCjs(), 'utf8');
  process.env.TESSERACT_WORKER_BOOTSTRAP_PATH = VERCEL_WORKER_TMP;
}

const { default: app } = await import('../dist/index.js');
export default app;
