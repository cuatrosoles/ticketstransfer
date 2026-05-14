// @ts-nocheck
/**
 * Punto de entrada serverless para Vercel.
 * Redirige todas las peticiones al bundle Express (dist/index.js).
 *
 * dist/index.js lo genera esbuild sin .d.ts; el chequeo de tipos no aporta en este archivo.
 */
const { default: app } = await import('../dist/index.js');
export default app;
