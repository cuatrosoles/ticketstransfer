#!/usr/bin/env node
/**
 * Build de la API con esbuild: empaqueta la API + @tickets-transfer/shared en dist/index.js.
 *
 * Esbuild en Vercel falla al enlazar imports nombrados contra el JS emitido por `tsc`
 * (`dist/schemas.js`): no reconoce exportaciones aunque existan. Por eso los módulos
 * shared se resuelven al **fuente TypeScript** (`src/*.ts`); esbuild los transpila y
 * ve los `export const` en el AST sin depender del output de tsc.
 */
import * as esbuild from 'esbuild';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'dist');
const sharedRoot = join(__dirname, '../../packages/shared');
const sharedIndexSrc = join(sharedRoot, 'src/index.ts');
const sharedSchemasSrc = join(sharedRoot, 'src/schemas.ts');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

if (!existsSync(sharedIndexSrc) || !existsSync(sharedSchemasSrc)) {
  console.error('Missing @tickets-transfer/shared source:', { sharedIndexSrc, sharedSchemasSrc });
  process.exit(1);
}

const sharedPlugin = {
  name: 'shared-typescript-source',
  setup(build) {
    // Subpath más específico primero
    build.onResolve({ filter: /^@tickets-transfer\/shared\/schemas$/ }, () => ({
      path: sharedSchemasSrc,
    }));
    build.onResolve({ filter: /^@tickets-transfer\/shared$/ }, () => ({
      path: sharedIndexSrc,
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
