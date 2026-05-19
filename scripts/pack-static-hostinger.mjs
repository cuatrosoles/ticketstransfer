/**
 * Copia apps/web/dist y apps/admin/dist a static-deploy/{web,admin}/ para subir por FTP
 * al hosting (solo archivos estáticos; la API no se toca).
 *
 * Uso (desde la carpeta v2):
 *   pnpm run pack:static          # requiere dist ya generados
 *   pnpm run static:prepare       # build web+admin y luego copia
 *
 * Variables VITE_*: definilas en apps/web/.env.production y apps/admin/.env.production
 * antes del build (vite build carga .env.production).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'static-deploy');
const webDist = path.join(root, 'apps', 'web', 'dist');
const adminDist = path.join(root, 'apps', 'admin', 'dist');

function assertDist(name, dir) {
  const index = path.join(dir, 'index.html');
  if (!fs.existsSync(index)) {
    console.error(`[pack-static] Falta ${path.relative(root, index)}. Ejecutá antes: pnpm run build:web && pnpm run build:admin`);
    process.exit(1);
  }
  const ht = path.join(dir, '.htaccess');
  if (!fs.existsSync(ht)) {
    console.warn(`[pack-static] Aviso: no hay .htaccess en ${name}/dist. Volvé a build tras añadir public/.htaccess.`);
  }
}

assertDist('web', webDist);
assertDist('admin', adminDist);

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const webOut = path.join(outDir, 'web');
const adminOut = path.join(outDir, 'admin');
fs.cpSync(webDist, webOut, { recursive: true });
fs.cpSync(adminDist, adminOut, { recursive: true });

console.log('[pack-static] Listo. Subí por FTP/SFTP el *contenido* de cada carpeta:');
console.log(`  Landing → document root del sitio: ${path.relative(root, webOut)}`);
console.log(`  Admin   → document root del subdominio/sitio: ${path.relative(root, adminOut)}`);
console.log(`  Carpeta base: ${outDir}`);
