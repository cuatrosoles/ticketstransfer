/**
 * Punto de entrada serverless para Vercel.
 * Redirige todas las peticiones al bundle Express (dist/index.js).
 */
// @ts-ignore - dist generado en build
import app from '../dist/index.js';
export default app;
