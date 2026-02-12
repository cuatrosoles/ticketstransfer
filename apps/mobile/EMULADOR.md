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
