'use strict';

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const { withAndroidPathEnv } = require('./android-exec-env.cjs');

const { env, androidHome, adbPath, javaHome } = withAndroidPathEnv();

if (!javaHome) {
  console.error(
    '[mobile] No se encontro Java (JDK). Gradle necesita un JDK (recomendado: 17 para RN 0.73).\n' +
      '  Opciones en macOS:\n' +
     '  - Si tienes Android Studio: suele bastar con tenerlo en /Applications (se usa su JBR).\n' +
     '  - Homebrew: brew install --cask temurin@17\n' +
     '  - Luego en ~/.zshrc: export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)',
  );
  process.exit(1);
}

if (!androidHome) {
  console.error(
    '[mobile] No se encontro el Android SDK. Instala Android Studio (SDK) o define ANDROID_HOME.\n' +
      '  Ruta tipica en macOS: ~/Library/Android/sdk',
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

try {
  execSync('npx react-native run-android', { stdio: 'inherit', shell: true, env });
} catch (e) {
  process.exit(typeof e.status === 'number' ? e.status : 1);
}
