# Generar APK para pruebas – Tickets Transfer

Instrucciones para generar un APK actualizado y enviarlo a tu cliente para pruebas.

---

## Requisitos previos

- **Node.js** ≥ 18 (el monorepo pide ≥ 20)
- **pnpm** instalado
- **JDK 17** (recomendado para React Native 0.73)
- **Android SDK** con `ANDROID_HOME` configurado

---

## Paso 1: Ir al directorio del proyecto

```bash
cd /Users/juanprogramador/Trabajos/ticketTransfer/v2
```

---

## Paso 2: Instalar dependencias (si hiciste cambios)

```bash
npm install
```

(Si falla, probá `npm run install:clean`)

---

## Paso 3 (opcional): Actualizar versión del APK

Para que el cliente distinga esta versión de la anterior, podés incrementar la versión en `android/app/build.gradle`:

```gradle
versionCode 2        // era 1, incrementar en cada entrega
versionName "2.0.1"  // o la versión que corresponda
```

---

## Paso 4: Verificar la URL de la API

En `apps/mobile/src/lib/api.ts` la API ya está apuntando a producción:

```ts
const API_BASE_OVERRIDE: string | null = 'https://ticketstransfer-production.up.railway.app';
```

Si necesitás otra URL, cambiá ese valor antes de generar el APK.

---

## Paso 5: Generar el APK

### Opción A: APK Debug (para pruebas rápidas)

- Más fácil de instalar
- No requiere keystore de producción
- Firmado con el keystore de debug

```bash
cd apps/mobile
pnpm apk:debug
```

O directamente:

```bash
cd apps/mobile/android
./gradlew assembleDebug
cd ../..
```

**Salida:**  
`apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

---

### Opción B: APK Release (recomendado para cliente)

- Más pequeño y optimizado
- Listo para distribución

**Nota:** Actualmente el `build.gradle` usa el keystore de debug también para release. Para producción real deberías configurar un keystore propio.

```bash
cd apps/mobile
pnpm apk:release
```

O:

```bash
cd apps/mobile/android
./gradlew assembleRelease
cd ../..
```

**Salida:**  
`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

---

## Paso 6: Ubicación del APK generado

| Tipo    | Ruta completa |
|---------|---------------|
| Debug   | `v2/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release | `v2/apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |

---

## Paso 7: Enviar al cliente

1. Copiá el APK a una carpeta accesible.
2. Enviá el archivo por:
   - Email (si el cliente lo permite)
   - Google Drive / Dropbox
   - WeTransfer u otro servicio similar
3. Indicá al cliente que:
   - Debe permitir **“Instalar apps de fuentes desconocidas”** en su Android.
   - Desinstale la versión anterior si ya tenía la app instalada (evita conflictos).
   - Instale el nuevo APK desde el archivo descargado.

---

## Solución de problemas

### Error: `ANDROID_HOME` no configurado

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

En macOS, agregá esto a `~/.zshrc` o `~/.bash_profile`.

### Error: "Gradle build daemon disappeared unexpectedly" (crash JVM)

Es un bug conocido de Zulu JDK 17 en macOS. Probá en este orden:

**1. Ejecutar sin daemon (evita el crash del daemon):**

```bash
cd apps/mobile/android
./gradlew --stop
./gradlew assembleRelease --no-daemon
```

**2. Si sigue fallando, usar JDK 11 o Temurin:**

```bash
# Con SDKMAN (si lo tenés):
sdk install java 11.0.21-tem
sdk use java 11.0.21-tem

# O con Homebrew:
brew install openjdk@11
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
cd apps/mobile
pnpm apk:release
```

**3. Reducir uso de memoria del compilador (gradle.properties):**

Agregar a `android/gradle.properties` en `org.gradle.jvmargs`:

```
-XX:+UseSerialGC
```

---

### Error: "Illegal type at constant pool entry" / "Constant pool index invalid" (TestComponentImpl)

Incompatibilidad entre Zulu JDK 17 y AGP 8.1.1. Ya se actualizó AGP a 8.4.2 en `android/build.gradle`. Si sigue fallando:

**Usar Eclipse Temurin JDK 17 en lugar de Zulu:**

```bash
brew install --cask temurin@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
# Verificá que apunte a Temurin, no a Zulu:
java -version   # debe decir "Eclipse Temurin"
cd apps/mobile
pnpm android
```

---

### Error de Gradle o compilación

```bash
cd apps/mobile/android
./gradlew clean --no-daemon
cd ..
pnpm apk:debug
```

### Error: "SDK location not found"

Creá `apps/mobile/android/local.properties` con:

```properties
sdk.dir=/Users/juanprogramador/Library/Android/sdk
```

(Ajustá la ruta según tu instalación del Android SDK.)

---

### Error al instalar dependencias

Si `rm -rf node_modules` falla con "Directory not empty" (firebase tiene symlinks circulares), usá **rimraf**:

```bash
cd v2
npm run install:clean
```

Ese script usa `rimraf` que maneja symlinks correctamente. Si falla, probá manualmente:

```bash
npx rimraf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

---

### Error: "Couldn't determine Hermesc location"

En monorepos (pnpm/yarn workspaces), el plugin de React Native a veces no encuentra el binario `hermesc`. Ya está resuelto en `android/app/build.gradle` con `hermesCommand` apuntando a `node_modules/react-native/sdks/hermesc/osx-bin/hermesc` (macOS) o `linux64-bin` (Linux).

Si el error persiste, verificá que exista:

```bash
ls v2/node_modules/react-native/sdks/hermesc/osx-bin/hermesc
```

---

## Resumen rápido

```bash
cd /Users/juanprogramador/Trabajos/ticketTransfer/v2
npm install
cd apps/mobile
npm run apk:release
```

El APK estará en:  
`android/app/build/outputs/apk/release/app-release.apk`
