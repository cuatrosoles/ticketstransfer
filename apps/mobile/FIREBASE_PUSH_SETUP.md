# Configuración de Notificaciones Push con Firebase

Este documento describe cómo implementar notificaciones push para la mensajería de Tickets Transfer usando Firebase Cloud Messaging (FCM).

**Estado actual:** La app ya solicita permisos de notificación al entrar en Mensajes (`requestNotificationPermission` en `src/lib/pushNotifications.ts`). Para notificaciones en tiempo real, completá los pasos siguientes.

## 1. Crear proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear un nuevo proyecto o usar uno existente
3. Agregar una app Android y/o iOS según corresponda

## 2. Android

### 2.1 Descargar google-services.json

1. En Firebase Console → Configuración del proyecto → Tus apps
2. Descargar `google-services.json` y colocarlo en `android/app/`

### 2.2 Editar android/build.gradle

```gradle
buildscript {
  dependencies {
    // ... otras dependencias
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

### 2.3 Editar android/app/build.gradle

Al final del archivo:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 2.4 Dependencias en package.json

```bash
pnpm add @react-native-firebase/app @react-native-firebase/messaging
```

## 3. iOS

### 3.1 Descargar GoogleService-Info.plist

1. En Firebase Console, agregar app iOS
2. Descargar `GoogleService-Info.plist` y arrastrarlo a Xcode en el proyecto iOS (marcar "Copy items if needed")

### 3.2 Habilitar Push Notifications en Xcode

1. Abrir `ios/TTMobileTemp.xcworkspace` en Xcode
2. Seleccionar el target → Signing & Capabilities
3. Agregar "Push Notifications"
4. Agregar "Background Modes" y marcar "Remote notifications"

### 3.3 Subir clave APNs a Firebase

1. En Apple Developer, crear una clave APNs (.p8)
2. En Firebase Console → Configuración del proyecto → Cloud Messaging → Subir la clave APNs

## 4. Permisos en la app

La app solicita permiso de notificaciones al entrar en Mensajes (y al subir foto de perfil/KYC para cámara).

## 5. Backend: enviar notificaciones

El backend debe:

1. Almacenar el FCM token del usuario (endpoint `PATCH /api/users/profile` con `fcmToken`)
2. Cuando llega un mensaje nuevo, enviar push al token del destinatario usando la Admin SDK de Firebase

Ejemplo en Node.js:

```javascript
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });

async function sendPushToUser(fcmToken, title, body) {
  await admin.messaging().send({
    token: fcmToken,
    notification: { title, body },
    data: { type: 'new_message' },
  });
}
```

## 6. Variables de entorno

- Firebase: las credenciales se leen de `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
- Backend: `GOOGLE_APPLICATION_CREDENTIALS` apuntando al archivo de credenciales de la cuenta de servicio de Firebase
