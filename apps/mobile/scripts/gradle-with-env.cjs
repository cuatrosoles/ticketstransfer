'use strict';

const { execSync } = require('child_process');
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
  finalEnv.NODE_OPTIONS = '--max-old-space-size=4096';
}

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const androidDir = path.join(__dirname, '..', 'android');
const argStr = argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ');
const cmd = argStr ? `${gradlew} ${argStr}` : gradlew;

execSync(cmd, { cwd: androidDir, stdio: 'inherit', shell: true, env: finalEnv });
