/**
 * Vercel: no hay binarios `tar` ni `curl` en el PATH del runtime.
 * Descargamos el .tgz con fetch y lo extraemos con el paquete npm `tar`.
 */
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { x as tarExtract } from 'tar';

const VERSION = '7.0.0';
const DEST = join('/tmp', `tesseract-js-core-v${VERSION.replace(/\./g, '-')}`);
const TGZ_URL = `https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-${VERSION}.tgz`;

export async function ensureTesseractCoreV7InTmp() {
  if (process.env.VERCEL !== '1') return;

  if (existsSync(join(DEST, '.ok'))) {
    process.env.TESSERACT_CORE_V7_DIR = DEST;
    return;
  }

  const tgz = join('/tmp', `tesseract-js-core-${VERSION}-${Date.now()}.tgz`);
  const wdir = join('/tmp', `tesseract-extract-${Date.now()}`);

  const res = await fetch(TGZ_URL);
  if (!res.ok) {
    throw new Error(`[install-tesseract-core] HTTP ${res.status} al descargar ${TGZ_URL}`);
  }
  writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));

  mkdirSync(wdir, { recursive: true });
  try {
    await tarExtract({ file: tgz, cwd: wdir });
    rmSync(DEST, { recursive: true, force: true });
    renameSync(join(wdir, 'package'), DEST);
    writeFileSync(join(DEST, '.ok'), '1');
  } finally {
    rmSync(wdir, { recursive: true, force: true });
    rmSync(tgz, { force: true });
  }

  process.env.TESSERACT_CORE_V7_DIR = DEST;
}
