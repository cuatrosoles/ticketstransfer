# Migración a Firebase - Tickets Transfer

Este documento describe la migración completa del sistema de PostgreSQL a Firebase (Firestore, Auth, Storage, Cloud Messaging).

## Resumen de cambios

| Componente | Antes | Después |
|------------|-------|---------|
| Base de datos | PostgreSQL (Neon) + Prisma | Firestore |
| Autenticación | JWT propio (bcrypt) | Firebase Auth |
| Archivos | Directorio local /uploads | Firebase Storage |
| Notificaciones | Parcial | Firebase Cloud Messaging |

## 1. Configuración Firebase Console

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** → Email/Password
3. Crear base de datos **Firestore** (modo producción)
4. Habilitar **Storage**
5. Crear **Cuenta de servicio** (Configuración → Cuentas de servicio → Generar nueva clave privada)

## 2. API (Backend)

### Variables de entorno

Copiar `.env.example` a `.env` y configurar:

```bash
# Credenciales Firebase (una de las dos)
GOOGLE_APPLICATION_CREDENTIALS="./firebase-service-account.json"
# O para hosting sin archivos:
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
```

### Índices Firestore

Crear índices compuestos en Firestore Console según los errores al ejecutar (ej: `ticketListings` status + createdAt, `conversations` user1Id + user2Id, etc.).

### Colecciones Firestore

- `users` - Perfiles de usuario (document ID = Firebase Auth UID)
- `userOnboarding` - Preferencias onboarding
- `kycVerifications` - Estado KYC
- `ticketListings` - Publicaciones de tickets
- `orders` - Órdenes de compra/venta
- `orderRatings` - Ratings de órdenes
- `disputes` - Disputas
- `disputeMessages` - Mensajes de disputas
- `conversations` - Conversaciones entre usuarios
- `messages` - Mensajes de chat

## 3. App Móvil (React Native)

### Dependencias

```bash
pnpm add @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/messaging @react-native-firebase/storage
```

### Configuración nativa

**Android:**
- Colocar `google-services.json` en `android/app/`
- En `android/build.gradle`: `classpath 'com.google.gms:google-services:4.4.0'`
- En `android/app/build.gradle`: `apply plugin: 'com.google.gms.google-services'`

**iOS:**
- Colocar `GoogleService-Info.plist` en el proyecto Xcode
- Habilitar Push Notifications y Background Modes → Remote notifications

### Flujo de autenticación

- **Login:** `signInWithEmailAndPassword` (Firebase Auth)
- **Registro:** POST `/api/auth/register` → recibe `customToken` → `signInWithCustomToken`
- **Token API:** Firebase ID token en header `Authorization: Bearer <token>`

## 4. Web y Admin

### Variables de entorno (Vite)

Crear `.env` con:

```
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Obtener estos valores en Firebase Console → Configuración del proyecto → Tus apps.

### Dependencias

```bash
pnpm add firebase
```

## 5. Notificaciones Push

1. El usuario concede permisos en la app móvil (Mensajes)
2. Se obtiene el FCM token con `messaging().getToken()`
3. Se envía al backend con `PATCH /api/users/profile` (`fcmToken`)
4. Al enviar un mensaje, el backend envía push al destinatario vía Firebase Admin Messaging

## 6. Migración de datos (opcional)

Si tenés datos en PostgreSQL, podés crear un script que:
1. Lea usuarios, tickets, órdenes, etc. de PostgreSQL
2. Cree usuarios en Firebase Auth con `admin.auth().importUsers()`
3. Inserte documentos en Firestore
4. Suba archivos a Storage desde las URLs actuales

## 7. Usuario admin

**Importante:** El usuario admin debe existir en **Firebase Auth** (no solo en Firestore).

### Crear el primer admin

1. **Firebase Console** → Authentication → Add user
   - Email: tu@email.com
   - Password: (elegir contraseña)

2. Copiar el **UID** del usuario creado (aparece en la lista de usuarios).

3. **Firestore** → Colección `users` → Crear documento con ID = UID copiado:
   ```json
   {
     "email": "tu@email.com",
     "role": "admin",
     "firstName": "...",
     "lastName": "...",
     "createdAt": (timestamp),
     "updatedAt": (timestamp)
   }
   ```

4. Iniciar sesión en el admin con ese email y contraseña.

### Admin en Railway

- Definir `VITE_API_URL` = URL de la API en producción (ej: `https://tu-api.up.railway.app`)
- Definir todas las `VITE_FIREBASE_*` para que el build las incluya
- **Reconstruir** el admin después de la migración: `pnpm run build:admin`
