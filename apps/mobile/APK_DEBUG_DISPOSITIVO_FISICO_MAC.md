# APK debug en Android físico (Mac + hub USB)

Guía precisa para **compilar e instalar la variante debug** de la app móvil Tickets Transfer en un **teléfono Android físico** conectado al Mac (incluye uso de **hub USB**). Probada mentalmente contra el layout del monorepo `v2` y React Native **0.73**.

**Equipo de referencia:** MacBook Pro 2019 (Intel i9), **macOS Tahoe** (ajustá rutas si tu usuario o carpeta del repo difieren).

---

## 0. Qué vas a obtener

- Un **APK debug** firmado con la clave de debug de Android.
- La app instalada en el teléfono con id **`com.ticketstransfer.app`**.
- En modo típico de desarrollo, el JS se sirve desde **Metro** en el Mac (puerto **8081**); el script `android` ya intenta hacer **`adb reverse`** para que el teléfono alcance ese puerto.

---

## 1. Requisitos en la Mac

1. **Node.js** ≥ 20 (el monorepo lo pide en la raíz `v2`).
2. **JDK 17** (recomendado para este proyecto; si Gradle falla, probá **Eclipse Temurin 17**).
3. **Android SDK** instalado (Android Studio es lo más simple).
4. **`adb`** accesible (suele venir en `platform-tools` del SDK).

### 1.1 Variables de entorno (Terminal)

Añadí a `~/.zshrc` (o ejecutá estas líneas en la sesión actual), ajustando la ruta del SDK si la tuyas es distinta:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

Recargá la configuración:

```bash
source ~/.zshrc
```

Comprobación:

```bash
which adb
adb version
```

### 1.2 `local.properties` del proyecto Android

Si Gradle se queja de *SDK location not found*, creá o editá:

`v2/apps/mobile/android/local.properties`

```properties
sdk.dir=/Users/TU_USUARIO/Library/Android/sdk
```

(Sustituí `TU_USUARIO` por tu usuario corto de macOS.)

---

## 2. Hub USB y cable (importante)

1. Preferí un **hub con alimentación** si conectás varios dispositivos; el USB para datos puede fallar si el hub reparte poca energía.
2. Usá un **cable de datos** (no “solo carga”); probá otro cable si `adb` no ve el dispositivo.
3. Si el teléfono **no aparece** en `adb devices`, conectalo **directo al Mac** (sin hub) para aislar el problema; luego volvé al hub si necesitás ese arreglo físico.

---

## 3. Configuración del teléfono Android

1. **Ajustes → Acerca del teléfono**: tocá **Número de compilación** (o similar) **7 veces** hasta activar **Opciones de desarrollador**.
2. **Ajustes → Opciones de desarrollador**:
   - Activá **Depuración USB**.
   - (Opcional) **Depuración USB (configuración de seguridad)** si tu ROM lo pide.
3. Conectá el USB. En la notificación USB, elegí **Transferencia de archivos (MTP)** o **PTP**, no “solo cargar”, si el sistema lo ofrece.
4. La primera vez, el teléfono mostrará el diálogo **¿Permitir depuración USB?** → **Permitir** (podés marcar “Siempre desde este ordenador”).

---

## 4. Verificar que el Mac ve el dispositivo

```bash
adb kill-server
adb start-server
adb devices -l
```

En la lista debería aparecer una línea con tu dispositivo y estado **`device`** (no `unauthorized` ni vacío).

- Si sale **`unauthorized`**: revocá claves en el teléfono (**Revocar autorizaciones de depuración USB**) y volvé a conectar.
- Si **no sale nada**: cable, puerto, hub o drivers en el dispositivo; probá puerto USB del Mac directo.

---

## 5. Dependencias del monorepo (una vez o tras cambios grandes)

En la raíz del monorepo (carpeta **`v2`**):

```bash
cd /Users/user/Desarrollos/ticketTransfer/v2
npm install
```

Si tu flujo habitual es con **pnpm** y ya lo tenés en PATH, también podés usar `pnpm install` desde la misma carpeta.

---

## 6. Flujo recomendado: instalar debug **y** poder usar Metro

Este es el flujo habitual para **desarrollo**: la app debug en el teléfono se conecta al bundler en el Mac.

### Terminal 1 — Metro (dejar abierto)

```bash
cd /Users/user/Desarrollos/ticketTransfer/v2/apps/mobile
npm start
```

### Terminal 2 — Compilar, `adb reverse` e instalar en el dispositivo

Con el teléfono en **`device`** según `adb devices`:

```bash
cd /Users/user/Desarrollos/ticketTransfer/v2/apps/mobile
npm run android
```

Ese script intenta `adb reverse tcp:8081 tcp:8081` y luego **`react-native run-android`**, que instala la variante debug en el aparato conectado.

Si hay **más de un dispositivo** (emulador + físico), podés forzar el dispositivo:

```bash
cd /Users/user/Desarrollos/ticketTransfer/v2/apps/mobile
adb devices
# Anotá el serial del físico, por ejemplo RZ8M90ABCDE
npx react-native run-android --deviceId RZ8M90ABCDE
```

(El `adb reverse` deberías ejecutarlo igual para ese serial si hace falta; el script del `package.json` ya lo lanza sin especificar serial — si tenés conflicto, ejecutá manualmente `adb -s SERIAL reverse tcp:8081 tcp:8081`.)

---

## 7. Flujo alternativo: generar el **APK debug** e instalarlo con `adb`

Sirve para obtener el archivo `.apk` o reinstalar sin pasar por `run-android` en algunos casos. **Ojo:** en React Native, la build **debug** suele esperar **Metro** para el JavaScript; si abrís la app sin Metro abierto, podés ver error de carga de bundle. Para uso sin Mac, normalmente se usa **release** o un pipeline que empaquete el bundle.

### 7.1 Generar el APK

```bash
cd /Users/user/Desarrollos/ticketTransfer/v2/apps/mobile
npm run apk:debug
```

**Salida esperada:**

`android/app/build/outputs/apk/debug/app-debug.apk`

(ruta absoluta típica:  
`/Users/user/Desarrollos/ticketTransfer/v2/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`)

### 7.2 Instalar o actualizar en el físico

```bash
adb install -r /Users/user/Desarrollos/ticketTransfer/v2/apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

`-r` reemplaza una instalación anterior.

### 7.3 Desinstalar (si necesitás estado limpio)

```bash
adb uninstall com.ticketstransfer.app
```

---

## 8. Problemas frecuentes

| Síntoma | Qué probar |
|--------|------------|
| `adb: command not found` | Definí `ANDROID_HOME` (o instalá el SDK en `~/Library/Android/sdk`). El script `npm run android` añade `platform-tools` al `PATH` si el SDK está ahí. Instalá **Android SDK Platform-Tools** desde Android Studio. |
| `spawn ./gradlew EACCES` / permiso denegado en `gradlew` | En `apps/mobile/android`: `chmod +x gradlew` (en el repo ya debería estar ejecutable). |
| Avisos npm `Unknown project config "node-linker"` | La opción `node-linker` es de **pnpm**; en este monorepo está en `v2/package.json` bajo `"pnpm".nodeLinker`. No hace falta `.npmrc` en la raíz para eso. |
| `adb devices` vacío | Cable datos, otro puerto, sin hub, desbloquear teléfono, modo MTP/PTP. |
| `unauthorized` | Revocar depuración USB en el teléfono; volver a conectar y aceptar RSA. |
| Instalación fallida / firma | `adb uninstall com.ticketstransfer.app` y reinstalar. |
| App abre pero error de JS / Metro | Dejá `npm start` corriendo; comprobá `adb reverse tcp:8081 tcp:8081`. |
| `Unable to locate a Java Runtime` al ejecutar `./gradlew` a mano | En la terminal **no** se aplica el `JAVA_HOME` de los scripts npm. Usá **`npm run gradle:stop`** (o `npm run gradle -- clean`) desde `apps/mobile`, o exportá Java antes: `export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)` y luego `./gradlew`. |
| `Unable to locate a Java Runtime` / sin JDK | Instala **JDK 17** (p. ej. `brew install --cask temurin@17`) o deja **Android Studio** en `/Applications` (el script usa su JBR). Opcional: `export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)`. El enlace a java.com del aviso del sistema suele ser poco util para Gradle; mejor JDK de desarrollo (Temurin/Android Studio). |
| `Requesting vendor list failed` / `pkg cache is currently ... restored` | Gradle intentaba resolver JDK por red para `@react-native/gradle-plugin`. En `android/gradle.properties` queda `org.gradle.java.installations.auto-download=false` para usar solo tu JDK local; necesitas **JDK 17** instalado. Si sigue igual: `cd android && ./gradlew --stop` y reintentar; a veces es fallo temporal del servicio remoto. |
| `ANDROID_HOME` | Export correcto; `local.properties` con `sdk.dir`. |

---

## 9. Referencias en este repo

- `BUILD_APK.md` — APK debug/release y troubleshooting de Gradle/JDK.
- `EMULADOR.md` — Metro, puerto 8081, instalación manual de APK.
- Raíz `v2/FONTS.md` — si tocaste fuentes y hay que enlazar assets en mobile.

---

**Última actualización:** documento alineado con scripts `npm run` del `package.json` de `apps/mobile` y aplicación `com.ticketstransfer.app`.
