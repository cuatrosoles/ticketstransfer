/**
 * Parches de apps/mobile (react-native). En CI que solo instala API/web (o sin node_modules
 * de mobile en la raíz), patch-package falla si se ejecuta desde el monorepo root.
 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const mobile = path.join(root, 'apps', 'mobile');

function hasReactNativeScreens() {
  return (
    fs.existsSync(path.join(mobile, 'node_modules', 'react-native-screens')) ||
    fs.existsSync(path.join(root, 'node_modules', 'react-native-screens'))
  );
}

if (hasReactNativeScreens()) {
  try {
    cp.execSync('npx --yes patch-package --patch-dir patches', {
      stdio: 'inherit',
      shell: true,
      cwd: mobile,
    });
  } catch (e) {
    console.warn('[postinstall-patches] patch-package:', e?.message || e);
  }
} else {
  console.log('[postinstall-patches] Sin react-native-screens; omitiendo patch-package (p. ej. build solo API en Vercel).');
}

try {
  cp.execSync('node apps/mobile/scripts/patch-react-native-screens-cpp.js', {
    stdio: 'inherit',
    shell: true,
    cwd: root,
  });
} catch (e) {
  console.warn('[postinstall-patches] patch-react-native-screens-cpp:', e?.message || e);
}
