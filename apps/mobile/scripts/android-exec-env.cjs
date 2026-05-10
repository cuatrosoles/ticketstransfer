'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

/**
 * JDK para Gradle: JAVA_HOME, Android Studio JBR, java_home (macOS), rutas tipicas Linux.
 */
function resolveJavaHome() {
  const javaBinName = process.platform === 'win32' ? 'java.exe' : 'java';

  if (process.env.JAVA_HOME) {
    const jh = process.env.JAVA_HOME;
    if (fs.existsSync(path.join(jh, 'bin', javaBinName))) return jh;
  }

  if (process.platform === 'darwin') {
    const preferStudioJbr = process.env.RN_CLI_USE_ANDROID_STUDIO_JAVA === '1';

    /** JBR ~21 desde Android Studio: en macOS Darwin 25+ ha dado SIGSEGV en C1 al compilar clases de Gradle (p. ej. FileHierarchySet$Node). */
    function androidStudioJbr() {
      const asJbrHome = '/Applications/Android Studio.app/Contents/jbr/Contents/Home';
      if (fs.existsSync(path.join(asJbrHome, 'bin', javaBinName))) return asJbrHome;
      const asJbrRoot = '/Applications/Android Studio.app/Contents/jbr';
      if (fs.existsSync(path.join(asJbrRoot, 'bin', javaBinName))) return asJbrRoot;
      return null;
    }

    if (!preferStudioJbr) {
      const versionsPreferred = ['17', '11', '1.17'];
      for (const v of versionsPreferred) {
        try {
          const out = execSync(`/usr/libexec/java_home -v ${v}`, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
          }).trim();
          if (out && fs.existsSync(path.join(out, 'bin', javaBinName))) return out;
        } catch {
          /* siguiente */
        }
      }
    }

    const studio = androidStudioJbr();
    if (studio) return studio;

    for (const v of ['21', '17', '11', '1.17']) {
      try {
        const out = execSync(`/usr/libexec/java_home -v ${v}`, {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
        if (out && fs.existsSync(path.join(out, 'bin', javaBinName))) return out;
      } catch {
        /* siguiente */
      }
    }
    try {
      const out = execSync('/usr/libexec/java_home', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (out && fs.existsSync(path.join(out, 'bin', javaBinName))) return out;
    } catch {
      /* no hay JDK */
    }
  }

  if (process.platform === 'linux') {
    const candidates = [
      '/usr/lib/jvm/java-17-openjdk-amd64',
      '/usr/lib/jvm/java-17-openjdk',
      '/usr/lib/jvm/java-21-openjdk-amd64',
    ];
    for (const c of candidates) {
      if (fs.existsSync(path.join(c, 'bin', javaBinName))) return c;
    }
  }

  return null;
}

/**
 * ANDROID_HOME + PATH (platform-tools) + JAVA_HOME + PATH (java bin).
 */
function withAndroidPathEnv() {
  let androidHome = process.env.ANDROID_HOME;
  if (!androidHome || !fs.existsSync(androidHome)) {
    androidHome = process.env.ANDROID_SDK_ROOT;
  }
  if (!androidHome || !fs.existsSync(androidHome)) {
    const macDefault = path.join(os.homedir(), 'Library', 'Android', 'sdk');
    if (fs.existsSync(macDefault)) {
      androidHome = macDefault;
    } else {
      androidHome = null;
    }
  }

  const env = { ...process.env };
  const parts = [env.PATH || ''].filter(Boolean);

  if (androidHome) {
    env.ANDROID_HOME = androidHome;
    env.ANDROID_SDK_ROOT = androidHome;
    const toAdd = [
      path.join(androidHome, 'platform-tools'),
      path.join(androidHome, 'emulator'),
      path.join(androidHome, 'tools', 'bin'),
    ];
    for (const dir of toAdd) {
      if (fs.existsSync(dir)) parts.push(dir);
    }
  }

  env.PATH = parts.join(path.delimiter);
  const adbPath = androidHome ? path.join(androidHome, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb') : null;

  const javaHome = resolveJavaHome();
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    const javaBin = path.join(javaHome, 'bin');
    if (fs.existsSync(javaBin)) {
      env.PATH = [javaBin, env.PATH].filter(Boolean).join(path.delimiter);
    }
  }

  return { env, androidHome, adbPath, javaHome };
}

module.exports = { withAndroidPathEnv, resolveJavaHome };
