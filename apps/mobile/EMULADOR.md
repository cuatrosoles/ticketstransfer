# Error INSTALL_PARSE_FAILED_NO_CERTIFICATES (SHA-256 digest did not verify)

Si al ejecutar `pnpm android` ves:

```
INSTALL_PARSE_FAILED_NO_CERTIFICATES: Failed to collect certificates... SHA-256 digest of contents did not verify
```

Probá en este orden:

```bash
# 1. Desinstalar la app del emulador (quita instalación anterior corrupta)
adb uninstall com.ticketstransfer.app
# Si falla con DELETE_FAILED_INTERNAL_ERROR, probá:
# adb shell pm uninstall --user 0 com.ticketstransfer.app

# 2. Limpiar build y caché
cd v2/apps/mobile/android
./gradlew clean
cd ../..

# 3. Volver a compilar e instalar
pnpm android
```

Si sigue fallando: en AVD Manager → menú del emulador → "Wipe Data" o crear un AVD nuevo.

---

# Error al instalar en el emulador: "Can't find service: package"

Si el build compila bien pero falla al instalar en el emulador, prueba:

## 1. solo compilar (sin instalar)

```bash
cd v2/apps/mobile
pnpm run apk:debug
```

El APK quedará en: `android/app/build/outputs/apk/debug/app-debug.apk`

## 2. Instalar manualmente

Con el emulador encendido y arrancado (desde la carpeta `mobile`):

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

O desde la raíz del proyecto:

```bash
adb install -r v2/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## 3. Arreglar el emulador

- **Cold boot**: en AVD Manager → menú del emulador → "Cold Boot Now"
- **Reiniciar ADB**: `adb kill-server && adb start-server`
- **Emulador más estable**: crear uno con API 34 (Android 14) en vez de API 36
- **Dispositivo físico**: conectar un teléfono por USB con depuración USB activada

---

# Cámara en emulador

Los emuladores Android suelen no tener cámara funcional. Si "Tomar foto" no hace nada o falla:

1. **Usar "Elegir de galería"** para seleccionar una imagen existente.
2. **Configurar cámara virtual**: en AVD Manager → editar emulador → "Show Advanced Settings" → Camera: "Webcam0" o "Virtual scene".
3. **Probar en dispositivo físico** para verificar que la cámara funciona.

---

# Debug en emulador

Para desarrollar y depurar con live reload y herramientas de desarrollo:

## 1. Iniciar Metro (bundler)

En una terminal, desde `apps/mobile`:

```bash
cd v2/apps/mobile
pnpm start
```

Dejá Metro corriendo. Sirve el JS y permite hot reload.

**Si ves `EADDRINUSE: address already in use :::8081`:** ya hay otro Metro (u otra app) usando el puerto. Cerrá esa terminal o liberá el puerto en macOS:

```bash
lsof -i :8081 -t | xargs kill
```

Luego volvé a ejecutar `pnpm start`. Alternativa: `pnpm start -- --port 8082` y en la app indicá el puerto nuevo si hace falta.

## 2. Ejecutar la app en el emulador

Con el emulador encendido, en **otra terminal**:

```bash
cd v2/apps/mobile
pnpm android
```

Esto compila el APK debug, lo instala en el emulador y lo conecta a Metro. Los cambios en JS se recargan al guardar.

**Si Gradle daemon crashea** (JVM crash, "daemon disappeared unexpectedly"):

```bash
cd v2/apps/mobile/android
./gradlew --stop
cd ..
pnpm android
```

O compilar sin daemon: `cd android && ./gradlew assembleDebug --no-daemon && cd ..`

**Si falla `checkDebugAarMetadata` con "Immutable workspace contents have been modified"** (caché de Gradle corrupta):

```bash
./gradlew --stop
rm -rf ~/.gradle/caches/transforms-4
cd v2/apps/mobile && pnpm android
```

Gradle volverá a generar esas carpetas en el primer build (puede tardar un poco más).

## 3. Menú de desarrollo (Dev Menu)

En el emulador Android:
- **Ctrl + M** (Windows/Linux) o **Cmd + M** (macOS)
- O: menú de 3 puntos del emulador → "Extended controls" → "Virtual sensors" → "Shake"

Desde el Dev Menu podés:
- **Reload**: recargar la app
- **Debug**: abrir Chrome DevTools para depurar JS (breakpoints, consola, etc.)
- **Enable Fast Refresh**: hot reload automático
- **Show Perf Monitor**: ver FPS y uso de memoria

## 4. Logs (Logcat)

Para ver logs de la app en tiempo real:

```bash
adb logcat *:S ReactNative:V ReactNativeJS:V
```

O filtrar por tu app:

```bash
adb logcat | grep -i "ReactNativeJS\|TTMobile"
```

## 5. API en local

El emulador usa `http://10.0.2.2:3001` para la API (10.0.2.2 = host). Asegurate de tener la API corriendo:

```bash
cd v2/apps/api
pnpm dev
```
