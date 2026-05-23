/**
 * Copia apps/web/dist y apps/admin/dist a carpetas listas para FTP en Hostinger.
 *
 * Destinos en producción:
 *   - static-deploy/ticketstransfer.net/       → https://ticketstransfer.net (raíz del dominio)
 *   - static-deploy/admin.ticketstransfer.net/ → https://admin.ticketstransfer.net (subdominio)
 *
 * Uso (desde v2):
 *   pnpm run pack:static
 *   pnpm run static:prepare
 *
 * Variables VITE_*: apps/web/.env.production y apps/admin/.env.production (antes del build).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'static-deploy');

const WEB_URL = 'https://ticketstransfer.net';
const ADMIN_URL = 'https://admin.ticketstransfer.net';

const webDist = path.join(root, 'apps', 'web', 'dist');
const adminDist = path.join(root, 'apps', 'admin', 'dist');
const webOutName = 'ticketstransfer.net';
const adminOutName = 'admin.ticketstransfer.net';

function assertDist(name, dir) {
  const index = path.join(dir, 'index.html');
  if (!fs.existsSync(index)) {
    console.error(
      `[pack-static] Falta ${path.relative(root, index)}. Ejecutá: pnpm run build:web && pnpm run build:admin`
    );
    process.exit(1);
  }
  const ht = path.join(dir, '.htaccess');
  if (!fs.existsSync(ht)) {
    console.warn(`[pack-static] Aviso: no hay .htaccess en ${name}/dist. Volvé a build tras añadir public/.htaccess.`);
  }
}

function writeReadme(targetDir, { title, url, hpanelHint }) {
  const text = `${title}
URL pública: ${url}

Subí por FTP/SFTP TODO el contenido de esta carpeta (incluido .htaccess)
al document root que Hostinger asigne a ese dominio/subdominio.

${hpanelHint}

La API y la base de datos NO se suben aquí; siguen en Vercel/Railway/Neon/Firebase.
`;
  fs.writeFileSync(path.join(targetDir, 'LEEME-SUBIR-ESTO.txt'), text, 'utf8');
}

assertDist('web', webDist);
assertDist('admin', adminDist);

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const webOut = path.join(outDir, webOutName);
const adminOut = path.join(outDir, adminOutName);
fs.cpSync(webDist, webOut, { recursive: true });
fs.cpSync(adminDist, adminOut, { recursive: true });

writeReadme(webOut, {
  title: 'Landing (frontend web)',
  url: WEB_URL,
  hpanelHint:
    'Hostinger: sitio principal ticketstransfer.net → public_html (o document root del dominio raíz).',
});
writeReadme(adminOut, {
  title: 'Panel de administración',
  url: ADMIN_URL,
  hpanelHint:
    'Hostinger: subdominio admin → carpeta del subdominio (ej. public_html/admin o ruta que indique hPanel para admin.ticketstransfer.net).',
});

const rootReadme = `Despliegue estático Tickets Transfer (Hostinger)
============================================

1. static-deploy/ticketstransfer.net/
   → Subir al document root de https://ticketstransfer.net

2. static-deploy/admin.ticketstransfer.net/
   → Subir al document root de https://admin.ticketstransfer.net

Generado con: pnpm run static:prepare (desde la carpeta v2)
Guía completa: docs/HOSTINGER_ESTATICOS.md
`;
fs.writeFileSync(path.join(outDir, 'LEEME.txt'), rootReadme, 'utf8');

console.log('[pack-static] Listo. Subí el *contenido* de cada carpeta por FTP/SFTP:\n');
console.log(`  ${WEB_URL}`);
console.log(`    ← ${path.relative(root, webOut)}`);
console.log(`  ${ADMIN_URL}`);
console.log(`    ← ${path.relative(root, adminOut)}`);
console.log(`\n  Carpeta base: ${outDir}`);
