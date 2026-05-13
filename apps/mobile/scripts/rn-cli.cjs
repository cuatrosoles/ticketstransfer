'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const mobileRoot = path.join(__dirname, '..');
const args = process.argv.slice(2);
let cliJs;
try {
  cliJs = require.resolve('react-native/cli.js', { paths: [mobileRoot] });
} catch {
  console.error('[mobile] No se encontro react-native. En apps/mobile: pnpm install');
  process.exit(1);
}
execFileSync(process.execPath, [cliJs, ...args], { stdio: 'inherit', cwd: mobileRoot, env: process.env });
