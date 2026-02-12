# Verificación de Identidad (KYC) con Didit

## Resumen

El proyecto integra **Didit** (didit.me) para verificación de identidad KYC en **Mobile** (Android/iOS) y **Web**, usando:

- **Mobile**: WebView con sesión Didit (documento + liveness check). Didit no ofrece SDK nativo para React Native; su enfoque recomendado es WebView, que permite acceso completo a la cámara para captura de documentos y prueba de vida (liveness).
- **Web**: Redirect a Didit, callback a `/kyc/callback`
- **Backend**: API para crear sesiones y webhook para recibir estados

## Implementación técnica

### Mobile (React Native)

1. **KycScreen**: Muestra estado y botón "Iniciar verificación"
2. **createKycSession('mobile')**: Llama a la API para crear sesión Didit
3. **KycWebViewScreen**: Abre la URL de Didit en WebView con:
   - `userAgent` móvil
   - `mediaPlaybackRequiresUserAction={false}` y `allowsInlineMediaPlayback={true}` para liveness
   - `originWhitelist` que incluye `ticketTransfer://*` para el callback
4. Al completar, Didit redirige a `ticketTransfer://kyc/callback` → la app detecta y cierra el WebView

### Web

1. **Kyc**: Muestra estado y botón "Iniciar verificación"
2. **createKycSession('web')**: Llama a la API
3. Redirect a la URL de Didit
4. Al completar, Didit redirige a `/kyc/callback`
5. **KycCallback**: Muestra mensaje y enlace a `/kyc`

## Configuración

### 1. Didit Business Console

1. Crear cuenta en [business.didit.me](https://business.didit.me)
2. Obtener:
   - **API Key** (X-Api-Key para v3)
   - **Webhook Secret Key**

### 2. Variables de entorno (API)

En `apps/api/.env`:

```env
DIDIT_API_KEY="tu-api-key"
DIDIT_WEBHOOK_SECRET_KEY="tu-webhook-secret"
WEB_URL="https://tu-dominio-web.com"   # Para callback web
```

### 3. Webhook en Didit

En la consola de Didit, configurar la URL del webhook:

```
https://tu-api.com/api/webhooks/didit
```

### 4. Callback URL en Didit

Configurar en Didit las URLs de callback permitidas:

- **Web**: `https://tu-dominio-web.com/kyc/callback`
- **Mobile**: `ticketTransfer://kyc/callback`

## Flujo

1. Usuario va a **Verificación KYC** (Inicio → tarjeta KYC)
2. Si está Pendiente o Rechazado, hace clic en **Iniciar verificación**
3. **Mobile**: se abre WebView con la sesión Didit (documento + selfie + liveness)
4. **Web**: redirect a Didit, al terminar vuelve a `/kyc/callback`
5. Didit envía webhook con el resultado; el backend actualiza el estado
6. Usuario ve el estado en la pantalla KYC

## Base de datos

Se añadió el campo `diditSessionId` en `KycVerification`. Ejecutar:

```bash
cd apps/api && pnpm db:push
```

## Permisos móvil

- **Android**: `CAMERA` en AndroidManifest.xml (ya configurado)
- **iOS**: `NSCameraUsageDescription` en Info.plist (ya configurado)

## Deep link (mobile)

- **Android**: `intent-filter` con scheme `ticketTransfer`, host `kyc`, path `/callback` (ya configurado)
- **iOS**: `CFBundleURLTypes` con scheme `ticketTransfer` (ya configurado)

## Dependencias

- **Mobile**: `react-native-webview` para el flujo Didit en WebView
