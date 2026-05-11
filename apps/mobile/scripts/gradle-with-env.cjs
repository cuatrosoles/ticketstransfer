'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { withAndroidPathEnv } = require('./android-exec-env.cjs');

const { env, javaHome } = withAndroidPathEnv();

if (!javaHome) {
  console.error(
    '[mobile] No se encontro Java (JDK). Instala JDK 17 (brew install --cask temurin@17) o Android Studio.',
  );
  process.exit(1);
}

const argv = process.argv.slice(2);
const isRelease = argv.some((a) => a.includes('assembleRelease') || a.includes('bundleRelease'));
const finalEnv = { ...env };
if (isRelease && !finalEnv.NODE_OPTIONS) {
  finalEnv.NODE_OPTIONS = '--max-old-space-size=8192';
}

const nodeMajor = parseInt(String(process.versions.node).split('.')[0], 10) || 0;
if (isRelease && nodeMajor >= 25) {
  console.warn(
    '[mobile] Aviso: estás usando Node.js ' +
      process.version +
      '. React Native 0.73 / Metro no están soportados en Node 25+.',
  );
  console.warn(
    '[mobile] Si falla :app:createBundleReleaseJsAndAssets con exit 139 (SIGSEGV), usá Node 20 LTS desde apps/mobile: `nvm use` o `fnm use` (ver archivo .nvmrc).',
  );
}

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const androidDir = path.join(__dirname, '..', 'android');

/** AGP/transforms: cachés "inmutables" en ~/.gradle/caches/transforms-4 se corrompen y fallan con checkReleaseAarMetadata */
function purgeGradleTransformsCacheForRelease() {
  if (process.env.MOBILE_SKIP_GRADLE_TRANSFORM_PURGE === '1') return;
  try {
    execSync(`${gradlew} --stop`, { cwd: androidDir, stdio: 'pipe', shell: true, env: finalEnv });
  } catch (_) {
    /* sin daemons */
  }
  const transformsRoot = path.join(os.homedir(), '.gradle', 'caches', 'transforms-4');
  try {
    if (fs.existsSync(transformsRoot)) {
      fs.rmSync(transformsRoot, { recursive: true, force: true });
      console.log('[mobile] Caché ~/.gradle/caches/transforms-4 eliminada (recrea workspaces AGP corruptos).');
    }
  } catch (e) {
    console.warn('[mobile] No se pudo borrar transforms-4. Probá: rm -rf ~/.gradle/caches/transforms-4');
    console.warn('[mobile]', e.message);
  }
}

if (isRelease) {
  purgeGradleTransformsCacheForRelease();
}

const argStr = argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ');
const cmd = argStr ? `${gradlew} ${argStr}` : gradlew;

execSync(cmd, { cwd: androidDir, stdio: 'inherit', shell: true, env: finalEnv });
