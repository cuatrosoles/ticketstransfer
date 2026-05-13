'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { withAndroidPathEnv } = require('./android-exec-env.cjs');

const { env, androidHome, adbPath, javaHome } = withAndroidPathEnv();

const mobileRoot = path.join(__dirname, '..');

if (!javaHome) {
  const winHint =
    process.platform === 'win32'
      ? '\n  En Windows: instalá JDK 17 (Temurin) o Android Studio y definí JAVA_HOME (ej. C:\\\\Program Files\\\\Android\\\\Android Studio\\\\jbr).'
      : '';
  console.error(
    '[mobile] No se encontro Java (JDK). Gradle necesita un JDK (recomendado: 17 para RN 0.73).\n' +
      '  Opciones en macOS:\n' +
      '  - Si tienes Android Studio: suele bastar con tenerlo en /Applications (se usa su JBR).\n' +
      '  - Homebrew: brew install --cask temurin@17\n' +
      '  - Luego en ~/.zshrc: export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)' +
      winHint,
  );
  process.exit(1);
}

if (!androidHome) {
  const winHint =
    process.platform === 'win32'
      ? '\n  En Windows: ANDROID_HOME suele ser %LOCALAPPDATA%\\\\Android\\\\Sdk (instalá Android Studio).'
      : '';
  console.error(
    '[mobile] No se encontro el Android SDK. Instala Android Studio (SDK) o define ANDROID_HOME.\n' +
      '  Ruta tipica en macOS: ~/Library/Android/sdk' +
      winHint,
  );
  process.exit(1);
}

if (!adbPath || !fs.existsSync(adbPath)) {
  console.error(
    '[mobile] Falta adb. En Android Studio: Settings → SDK → SDK Tools → Android SDK Platform-Tools (instalar).\n' +
      `  Se esperaba en: ${adbPath || '(sin ANDROID_HOME)'}`,
  );
  process.exit(1);
}

try {
  execFileSync(adbPath, ['reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'inherit', env });
} catch {
  // Si no hay dispositivo aun, no bloqueamos; run-android lo indicara
}

/** Mismo intérprete que corrió este script (nunca depender de `node` en PATH ni de react-native.cmd). */
function runReactNativeRunAndroid() {
  let cliJs;
  try {
    cliJs = require.resolve('react-native/cli.js', { paths: [mobileRoot] });
  } catch {
    console.error(
      '[mobile] No se encontro react-native.\n' + '  En apps/mobile ejecutá: pnpm install',
    );
    process.exit(1);
  }
  execFileSync(process.execPath, [cliJs, 'run-android'], { stdio: 'inherit', env, cwd: mobileRoot });
}

try {
  runReactNativeRunAndroid();
} catch (e) {
  process.exit(typeof e.status === 'number' ? e.status : 1);
}
