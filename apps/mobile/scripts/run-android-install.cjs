'use strict';

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { withAndroidPathEnv } = require('./android-exec-env.cjs');

const { env, androidHome, adbPath, javaHome } = withAndroidPathEnv();

if (!javaHome) {
  console.error(
    '[mobile] No se encontro Java (JDK). Instala JDK 17 (Temurin) o Android Studio. Ver salida de: npm run android',
  );
  process.exit(1);
}

if (!androidHome || !adbPath || !fs.existsSync(adbPath)) {
  console.error(
    '[mobile] No se encontro adb. Instala Platform-Tools y/o define ANDROID_HOME.\n' +
      '  Tip: ~/Library/Android/sdk/platform-tools/adb',
  );
  process.exit(1);
}

try {
  execFileSync(adbPath, ['reverse', 'tcp:8081', 'tcp:8081'], { stdio: 'inherit', env });
} catch {
  // sin dispositivo no falla el resto
}

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const androidDir = path.join(__dirname, '..', 'android');

try {
  execSync(`${gradlew} --stop`, { cwd: androidDir, stdio: 'ignore', shell: true, env });
} catch {
  // ignorar si no hay daemon
}

execSync(`${gradlew} app:installDebug -PreactNativeDevServerPort=8081 --no-daemon`, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
  env,
});
