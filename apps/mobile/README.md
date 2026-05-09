# Tickets Transfer – App móvil (React Native, sin Expo)

App Android/iOS usando React Native CLI (sin Expo), integrada con la API de v2.

## Requisitos

- Node >= 18
- Android: Android Studio, SDK, emulador o dispositivo
- iOS (solo macOS): Xcode, CocoaPods
- JDK 17 (Android)

## Generar carpetas nativas (android / ios)

Esta carpeta contiene todo el código JavaScript/TypeScript. Para obtener los proyectos nativos **android** e **ios**, hay que crear un proyecto React Native con la CLI y copiar esas carpetas:

```bash
# Desde la raíz del repo (ticketTransfer)
cd v2

# Crear proyecto temporal con la CLI oficial
npx @react-native-community/cli@latest init TTMobileTemp --directory apps/mobile-temp --skip-install

# Copiar carpetas nativas a la app móvil
cp -R apps/mobile-temp/android apps/mobile/
cp -R apps/mobile-temp/ios apps/mobile/

# Opcional: copiar archivos de configuración nativa si hace falta
# cp apps/mobile-temp/android/app/build.gradle apps/mobile/android/app/  # solo si necesitás ajustes

# Eliminar temporal
rm -rf apps/mobile-temp
```

Luego instalar dependencias de la app móvil:

```bash
cd apps/mobile
pnpm install
# o: npm install
```

En **iOS** (solo macOS):

```bash
cd ios && pod install && cd ..
```

## Configurar URL de la API

Por defecto la app usa:
- **Emulador Android:** `http://10.0.2.2:3001` (10.0.2.2 = máquina host).
- **Simulador iOS:** `http://localhost:3001`.

Para **dispositivo físico** (o si la API está en otra máquina), en `src/lib/api.ts` asigná `API_BASE_OVERRIDE`:

```ts
const API_BASE_OVERRIDE = 'http://192.168.1.10:3001';  // IP de tu PC en la red
```

La API debe estar corriendo (ej. `pnpm dev` en `v2/apps/api`). Las peticiones tienen timeout de 15 s y mensajes de error claros si no hay conexión.

## Ejecutar

- **Metro (bundler):** desde `apps/mobile`: `pnpm start` o `npm start`
- **Android:** en otra terminal, desde `apps/mobile`: `pnpm android` o `npm run android`
- **iOS:** desde `apps/mobile`: `pnpm ios` o `npm run ios`

## Estructura

- `App.tsx` – Raíz con SafeArea, Auth, Navigation
- `src/context/AuthContext.tsx` – Estado de login y token
- `src/lib/api.ts` – Cliente HTTP (auth, KYC, tickets, órdenes) y soporte FormData para subida de imágenes
- `src/navigation/` – Navegación (stack)
- `src/screens/` – Welcome, Login, Register, Home, **KycScreen**, **PublishTicketScreen**, **MyPurchasesScreen**, **MySalesScreen**
- `src/theme.ts` – Colores y espaciado (alineado con la web)

**Dependencia:** `react-native-image-picker` para seleccionar fotos (DNI, selfie, capturas de ticket). En iOS hace falta `cd ios && pod install` después de instalar dependencias.

## Solución completa cuando el build de Android falla

En este proyecto ya están aplicadas todas las correcciones necesarias para que el build funcione (pnpm monorepo, RN 0.73, Kotlin 1.8, Gradle 8.6, manifest, codegen, etc.). Si aun así falla:

### 1. Caché de Gradle corrupta

Si aparece **"Immutable workspace contents have been modified"** en `~/.gradle/caches/transforms-4`:

```bash
pnpm run fix:android
pnpm android
```

Eso ejecuta `scripts/fix-android-build.sh`: borra la caché de transforms y hace `gradlew clean`. Luego volvé a correr el build.

### 2. Daemon de Gradle crasheado

Si ves **"Gradle build daemon disappeared unexpectedly"** o un crash del JVM:

```bash
cd android && ./gradlew --stop && cd ..
pnpm android -- --no-daemon
```

### 3. Qué está ya configurado (no tocar)

- **Dependencias directas (pnpm):** `@react-native-community/cli-platform-android`, `@react-native/codegen`, `@react-native/gradle-plugin` en devDependencies.
- **Kotlin 1.8.0** en `android/build.gradle` (las libs nativas no compilan con 2.x).
- **Gradle 8.6** en `android/gradle/wrapper/gradle-wrapper.properties`.
- **Placeholder** `usesCleartextTraffic` en `android/app/build.gradle` (manifestPlaceholders).
- **settings.gradle** y **native_modules** al estilo RN 0.73 (sin plugin com.facebook.react.settings).
- **Parche** en `patches/react-native-screens+3.37.0.patch`: en RN 0.73 no existe `BaseReactPackage`; el parche hace que `react-native-screens` extienda `TurboReactPackage`. Se aplica con `patch-package` en `postinstall`.
- **Script C++** `scripts/patch-react-native-screens-cpp.js`: tras `patch-package`, adapta la firma `getContentOriginOffset(bool)` → `getContentOriginOffset()` en los `.h`/`.cpp` de react-native-screens para que compile con RN 0.73 (LayoutableShadowNode sin ese parámetro).
- **Nueva Arquitectura desactivada** (`android/gradle.properties` → `newArchEnabled=false`): con Fabric activo, react-native-safe-area-context y otras libs fallan en C++ (Yoga/ConcreteComponentDescriptor incompatibles con RN 0.73). Con el bridge clásico el build termina bien.
- **react-native-safe-area-context** fijado en **4.5.0** por compatibilidad.

## Generar APK instalable (pruebas en dispositivo físico)

Desde `apps/mobile`:

| Comando | Uso | Dónde queda el APK |
|--------|-----|--------------------|
| `pnpm apk:debug` | Pruebas con opción de conectar a Metro (live reload). Más rápido de compilar. | `android/app/build/outputs/apk/debug/app-debug.apk` |
| `pnpm apk:release` | Pruebas sin PC: instalar y usar en el teléfono sin Metro. Optimizado. | `android/app/build/outputs/apk/release/app-release.apk` |

**Recomendación para pruebas:** usar `pnpm apk:release`, copiar `app-release.apk` al teléfono (USB, Drive, etc.) e instalar. No hace falta tener el ordenador conectado.

**Nota:** La firma actual usa el keystore de debug (`android/app/debug.keystore`). Para producción hay que configurar un keystore propio en `android/app/build.gradle` (signingConfigs.release).

## Build AAB (Google Play)

Para subir a Play Store: desde `apps/mobile/android`: `./gradlew bundleRelease`. El AAB queda en `android/app/build/outputs/bundle/release/`.
