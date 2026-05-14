'use strict';

/**
 * Entrada alternativa del worker de Tesseract en Vercel: el hilo del worker no hereda
 * parches de Module del proceso principal. Aquí redirigimos tesseract.js-core a
 * TESSERACT_CORE_V7_DIR (/tmp, poblado por install-tesseract-core-tmp.mjs).
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');

const CORE = process.env.TESSERACT_CORE_V7_DIR;
if (!CORE || !fs.existsSync(path.join(CORE, 'package.json'))) {
  throw new Error(
    '[tesseract-worker-bootstrap] Falta TESSERACT_CORE_V7_DIR o el directorio no es válido: ' + String(CORE)
  );
}

const orig = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'tesseract.js-core' || request.startsWith('tesseract.js-core/')) {
    const rel = request === 'tesseract.js-core' ? 'package.json' : request.slice('tesseract.js-core/'.length);
    const base = path.join(CORE, rel);
    const candidates = [base, base + '.js', base + '.json'];
    for (const p of candidates) {
      try {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          return path.resolve(p);
        }
      } catch {
        /* */
      }
    }
  }
  return orig.apply(this, arguments);
};

const { createRequire } = require('module');
const req = createRequire(path.join(__dirname, '..', 'package.json'));
const realWorker = req.resolve('tesseract.js/src/worker-script/node/index.js');
require(realWorker);
