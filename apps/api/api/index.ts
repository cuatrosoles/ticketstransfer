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

if (process.env.VERCEL === '1') {
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  /** Ruta absoluta: no usar process.cwd() (en Vercel suele ser /var/task, no la carpeta de la app). */
  process.env.TESSERACT_WORKER_BOOTSTRAP_PATH = join(
    dirname(fileURLToPath(import.meta.url)),
    'tesseract-worker-bootstrap.cjs'
  );
  const { ensureTesseractCoreV7InTmp } = await import('./install-tesseract-core-tmp.mjs');
  await ensureTesseractCoreV7InTmp();
}

const { default: app } = await import('../dist/index.js');
export default app;
