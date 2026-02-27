#!/usr/bin/env node
/**
 * Build de la API con esbuild: empaqueta el código de la API + @tickets-transfer/shared
 * en un solo dist/index.js para que en Railway no dependa de la resolución del workspace.
 */
import * as esbuild from 'esbuild';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'dist');
const sharedSrc = join(__dirname, '../../packages/shared/src/index.ts');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Resolver @tickets-transfer/shared desde el código fuente para empaquetarlo sin depender de dist/
const sharedPlugin = {
  name: 'shared-source',
  setup(build) {
    build.onResolve({ filter: /^@tickets-transfer\/shared$/ }, () => ({
      path: sharedSrc,
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
  'helmet',
  'jsonwebtoken',
  'multer',
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
