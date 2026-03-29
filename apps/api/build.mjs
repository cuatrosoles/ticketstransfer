#!/usr/bin/env node
/**
 * Build de la API con esbuild: empaqueta el código de la API + @tickets-transfer/shared
 * en un solo dist/index.js para que en Railway no dependa de la resolución del workspace.
 *
 * Importante: se empaqueta el **dist** de shared (salida de `tsc`), no `src/index.ts`.
 * Así esbuild ve las exportaciones reales y el orden `pnpm -r build` no deja shared desactualizado.
 */
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'dist');
const sharedRoot = join(__dirname, '../../packages/shared');
const sharedEntry = join(sharedRoot, 'dist/index.js');
const sharedSchemas = join(sharedRoot, 'dist/schemas.js');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Garantizar artefactos de shared (tsc) antes de bundlear; evita dist viejo o inexistente al compilar la API primero.
execSync('pnpm run build', { cwd: sharedRoot, stdio: 'inherit' });

if (!existsSync(sharedEntry) || !existsSync(sharedSchemas)) {
  console.error('Missing shared dist after build:', { sharedEntry, sharedSchemas });
  process.exit(1);
}

/**
 * Forzar entradas de dist (no barrel re-exports): esbuild en CI a veces no resuelve
 * `export { x } from './schemas.js'` en index.js y falla con "No matching export".
 */
const sharedPlugin = {
  name: 'shared-dist',
  setup(build) {
    build.onResolve({ filter: /^@tickets-transfer\/shared\/schemas$/ }, () => ({
      path: sharedSchemas,
    }));
    build.onResolve({ filter: /^@tickets-transfer\/shared$/ }, () => ({
      path: sharedEntry,
    }));
  },
};

const external = [
  '@prisma/client',
  'bcryptjs',
  'cors',
  'dotenv',
  'express',
  'express-rate-limit',
  'firebase-admin',
  'gifwrap',
  'helmet',
  'jimp',
  'jsonwebtoken',
  'mercadopago',
  'multer',
  'twilio',
];

await esbuild.build({
  entryPoints: [join(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: join(outDir, 'index.js'),
  external,
  plugins: [sharedPlugin],
  sourcemap: true,
  logLevel: 'info',
}).catch(() => process.exit(1));

console.log('Build OK: dist/index.js');
