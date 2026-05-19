#!/usr/bin/env node
/**
 * Build de la API con esbuild: empaqueta el código de la API + @tickets-transfer/shared
 * en un solo dist/index.js.
 *
 * Vercel/pnpm: el `import "esbuild"` desde apps/api a veces falla (ERR_MODULE_NOT_FOUND)
 * si el paquete queda solo hoisteado en node_modules de la raíz del monorepo.
 * Carga explícita caminando directorios.
 */
import { createRequire } from 'node:module';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @returns {import('esbuild')} */
function loadEsbuild() {
  const fromApi = (() => {
    try {
      return createRequire(join(__dirname, 'package.json'))('esbuild');
    } catch {
      return null;
    }
  })();
  if (fromApi) return fromApi;

  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const esbuildPkg = join(dir, 'node_modules', 'esbuild', 'package.json');
    if (existsSync(esbuildPkg)) {
      try {
        const r = createRequire(esbuildPkg);
        return r('.');
      } catch {
        /* seguir */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'esbuild no encontrado al subir desde apps/api. Instalación incompleta: ejecutá `pnpm install` en la raíz del monorepo (v2).'
  );
}

const esbuild = loadEsbuild();
const outDir = join(__dirname, 'dist');
const sharedSrc = join(__dirname, '../../packages/shared/src/index.ts');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

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
  'gifwrap',
  'helmet',
  'jimp',
  'jsonwebtoken',
  'mercadopago',
  'multer',
  'sharp',
  'twilio',
  'tesseract.js',
  'jsqr',
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
