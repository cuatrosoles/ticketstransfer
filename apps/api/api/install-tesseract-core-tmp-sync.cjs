'use strict';

/**
 * Versión síncrona (curl + tar) para ejecutar antes de importar dist/index.js vía dynamic import.
 * Solo se carga en Vercel (VERCEL=1).
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VERSION = '7.0.0';
const DEST = path.join('/tmp', `tesseract-js-core-v${VERSION.replace(/\./g, '-')}`);
const TGZ_URL = `https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-${VERSION}.tgz`;

if (process.env.VERCEL !== '1') {
  module.exports = {};
} else if (fs.existsSync(path.join(DEST, '.ok'))) {
  process.env.TESSERACT_CORE_V7_DIR = DEST;
} else {
  const tgz = path.join('/tmp', `tesseract-js-core-${VERSION}-${Date.now()}.tgz`);
  const wdir = path.join('/tmp', `tesseract-extract-${Date.now()}`);
  fs.mkdirSync(wdir, { recursive: true });
  try {
    execFileSync('curl', ['-fsSL', TGZ_URL, '-o', tgz], { stdio: 'inherit' });
    execFileSync('tar', ['-xzf', tgz, '-C', wdir], { stdio: 'inherit' });
    fs.rmSync(DEST, { recursive: true, force: true });
    fs.renameSync(path.join(wdir, 'package'), DEST);
    fs.writeFileSync(path.join(DEST, '.ok'), '1');
  } finally {
    fs.rmSync(wdir, { recursive: true, force: true });
    fs.rmSync(tgz, { force: true });
  }
  process.env.TESSERACT_CORE_V7_DIR = DEST;
}
