# Generar APK para pruebas – Tickets Transfer

Instrucciones para generar un APK actualizado y enviarlo a tu cliente para pruebas.

---

## Requisitos previos

- **Node.js** **20 LTS** (hay un `.nvmrc` en `apps/mobile`). Con **Node 25+** el paso `:app:createBundleReleaseJsAndAssets` a veces cae con **exit 139** (Metro). Node 18 suele servir; 20 es lo más estable para RN 0.73.
- **pnpm** en la versión del monorepo (**9.15.5**, ver `packageManager` en `v2/package.json`). Si instalaste **pnpm 10+** con `npm i -g pnpm`, con Node 20 falla con `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` y avisos de “pnpm requires Node.js v22.13”. **No mezcles** ese pnpm global con Node 20: usá Corepack (abajo) o `npx pnpm@9.15.5`.
- **JDK 17** (recomendado para React Native 0.73)
- **Android SDK** con `ANDROID_HOME` configurado

### Node 20 en macOS si no usás nvm

Si `nvm` no existe en tu terminal (`command not found`), elegí **una** de estas vías:

**A) Homebrew (simple)**

```bash
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node -v   # v20.x
```

En Mac Intel la ruta suele ser `/usr/local/opt/node@20/bin`.

**B) fnm (gestor liviano, similar a nvm)**

```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
source ~/.zshrc
cd /ruta/a/ticketTransfer/v2/apps/mobile
fnm install
fnm use
node -v
```

**C) Instalador oficial**

Descargá el instalador **LTS 20** desde [https://nodejs.org/](https://nodejs.org/) y volvé a abrir la terminal.

**D) nvm (si lo querés usar)**

Instalación típica: [https://github.com/nvm-sh/nvm#installing-and-updating](https://github.com/nvm-sh/nvm#installing-and-updating) (después reiniciá la terminal o `source ~/.zshrc` para cargar `nvm`).

### pnpm con Node 20 (evitar `node:sqlite` / pnpm “pide Node 22”)

**Opción rápida** (sin tocar el pnpm global), desde `apps/mobile`:

```bash
npx --yes pnpm@9.15.5 apk:release
```

**Opción recomendada** (dejá `pnpm` en PATH alineado al repo):

```bash
corepack enable
corepack prepare pnpm@9.15.5 --activate
pnpm -v   # debe mostrar 9.15.5
```

Si seguís viendo la versión vieja, el `pnpm` del principio del `PATH` suele ser el global: `which -a pnpm` y, si hace falta, `npm uninstall -g pnpm` y volvé a activar Corepack.

**Alternativa:** subir a **Node 22 LTS** (suele ir bien con Metro en RN 0.73 y permite pnpm 10+ si lo necesitás). Evitá **Node 25+** para el bundle release.

### Gradle y Java en la terminal (macOS)

Si en `apps/mobile/android` ejecutás `./gradlew` y macOS dice **Unable to locate a Java Runtime**, es porque esa terminal **no tiene** `JAVA_HOME` (los comandos `npm run android` / `npm run apk:debug` sí lo resuelven con scripts del repo).

Desde **`apps/mobile`** (no hace falta entrar en `android/`):

```bash
npm run gradle:stop
npm run gradle -- assembleDebug
```

Cualquier tarea de Gradle: `npm run gradle -- <argumentos>` (por ejemplo `npm run gradle -- clean`).

Alternativa manual antes de `./gradlew`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)
```

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

No es un error de tu código React Native: el proceso **Java de Gradle** (Temurin 17 u otro JDK) se cae con **SIGSEGV** en macOS reciente (**Darwin 25/26**). En los logs `android/hs_err_pid*.log` suele aparecer el frame `Klass::search_secondary_supers` (compilador **C2** del HotSpot).

**Ya aplicado en el repo:** en `android/gradle.properties`, `org.gradle.jvmargs` incluye **`-XX:TieredStopAtLevel=1`** (solo compilación hasta C1; evita el bug de C2 en el daemon) y **ParallelGC** (no usar SerialGC aquí: en algunos setups rompe D8/R8).

Pasos si aún falló con una copia vieja de `gradle.properties`:

```bash
cd apps/mobile/android
./gradlew --stop
rm -f hs_err_pid*.log
cd ..
npx --yes pnpm@9.15.5 apk:release
```

**Si sigue fallando:** probá otro JDK solo para la terminal del build, por ejemplo Temurin 21 (a veces va mejor con macOS muy nuevo):

```bash
brew install --cask temurin@21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
cd apps/mobile
npx --yes pnpm@9.15.5 apk:release
```

(O JDK 11 como último recurso, con el mismo `export JAVA_HOME=...`.)

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
