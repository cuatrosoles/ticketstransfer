#!/usr/bin/env node
/**
 * Asegura que `pnpm` este en PATH cuando Corepack viene con Node (recomendado).
 * Si no hay corepack ni pnpm, muestra instrucciones; el proyecto igual puede usarse
 * con `npm` + `npx --yes pnpm@...` en los scripts del package.json raiz.
 */

import { execSync } from 'node:child_process';

const PNPM_VERSION = '9.15.5';

function hasCmd(cmd) {
  try {
    const check = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
    execSync(check, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true });
}

if (hasCmd('pnpm')) {
  const v = execSync('pnpm -v', { encoding: 'utf8' }).trim();
  console.log(`pnpm ya disponible (${v}).`);
  process.exit(0);
}

if (hasCmd('corepack')) {
  console.log(`Activando pnpm@${PNPM_VERSION} con Corepack…`);
  run('corepack enable');
  run(`corepack prepare pnpm@${PNPM_VERSION} --activate`);
  process.exit(0);
}

console.error(
  [
    'No se encontro pnpm ni corepack en PATH.',
    '',
    'Instala pnpm con una de estas opciones:',
    `  1) Corepack (Node oficial):  corepack enable  &&  corepack prepare pnpm@${PNPM_VERSION} --activate`,
    '  2) Global npm:               npm install -g pnpm',
    '  3) Sin global: el monorepo usa "npx --yes pnpm@..." en install:clean y similares.',
    '',
  ].join('\n'),
);
process.exit(1);
