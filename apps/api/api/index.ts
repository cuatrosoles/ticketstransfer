// @ts-nocheck
/**
 * Punto de entrada serverless para Vercel.
 * Redirige todas las peticiones al bundle Express (dist/index.js).
 *
 * En Vercel, los .wasm de tesseract.js-core no entran en el bundle de pnpm; antes de
 * cargar la app instalamos el paquete oficial en /tmp y el worker usa
 * api/tesseract-worker-bootstrap.cjs (ver image-sensitive-detection.ts).
 *
 * dist/index.js lo genera esbuild sin .d.ts; el chequeo de tipos no aporta en este archivo.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

if (process.env.VERCEL === '1') {
  require('./install-tesseract-core-tmp-sync.cjs');
}

const { default: app } = await import('../dist/index.js');
export default app;
