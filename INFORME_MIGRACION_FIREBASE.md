# Informe de migración a Firebase

**Proyecto:** Tickets Transfer v2  
**Fecha:** Febrero 2026  
**Objetivo:** Evaluar la migración de PostgreSQL + API Express a Firebase (Firestore + Storage) y poner el panel de administración online.

---

## 1. Resumen ejecutivo

| Aspecto | Complejidad | Estimación |
|---------|-------------|------------|
| Migración a Firestore | **Alta** | 3–5 semanas |
| Migración a Firebase Storage | **Media** | 1–2 semanas |
| Admin online | **Baja** | 2–4 días |
| **Total** | **Alta** | **5–8 semanas** |

La migración es **compleja** porque el proyecto usa un modelo relacional (PostgreSQL + Prisma) con relaciones, transacciones y lógica de negocio en la API. Firestore es NoSQL y requiere un rediseño del modelo de datos y de la arquitectura.

---

## 2. Estado actual del proyecto

### 2.1 Base de datos (PostgreSQL + Prisma)

- **Modelos:** User, UserOnboarding, KycVerification, TicketListing, Order, Dispute, DisputeMessage, Conversation, Message
- **Relaciones:** Muchas relaciones (1:N, N:N) y cascadas
- **Enums:** Sexo, KycStatus, Ticketera, OrderStatus, etc.
- **Uso de Prisma:** ~15 archivos con queries, transacciones (`$transaction`), `findMany`, `findUnique`, `create`, `update`, `upsert`

### 2.2 API (Express)

- **Rutas:** auth, users, tickets, orders, disputes, messages, admin, webhooks, health
- **Autenticación:** JWT (access + refresh) con bcrypt para contraseñas
- **Uploads:** Multer → disco local/Volume (perfil, KYC, tickets, evidencia de órdenes)
- **Webhooks:** Didit KYC
- **Middleware:** CORS, rate-limit, helmet, auth, admin

### 2.3 Admin (Vite + React)

- **Stack:** React 18, React Router, Vite
- **Puerto:** 5174
- **API:** `VITE_API_URL` (por defecto `http://localhost:3001`)
- **Funcionalidad:** Dashboard, usuarios, KYC, disputas, conversaciones, órdenes
- **Acceso:** Solo local (`localhost:5174`)

### 2.4 App móvil (React Native)

- Consume la API REST actual
- Autenticación con JWT
- Subida de imágenes (perfil, tickets, etc.)

---

## 3. Migración a Firestore

### 3.1 Cambios en el modelo de datos

Firestore es NoSQL (documentos y colecciones). Hay que adaptar el esquema:

| PostgreSQL (Prisma) | Firestore |
|---------------------|-----------|
| Tablas relacionadas | Colecciones (`users`, `orders`, etc.) |
| Foreign keys | Referencias por ID o datos embebidos |
| Transacciones ACID | Transacciones de Firestore (limitadas) |
| Enums | Strings en documentos |
| `createdAt`/`updatedAt` | Timestamps de Firestore |

**Estructura sugerida de colecciones:**

```
users/
  {userId}/
    - email, firstName, lastName, role, profileImageUrl, ...
    - subcolección: kyc (o documento embebido)
    - subcolección: onboarding

ticketListings/
  {listingId}/
    - sellerId (referencia), eventName, price, status, captureTicketUrl, ...

orders/
  {orderId}/
    - ticketListingId, buyerId, sellerId, status, totalAmount, evidenceUrl, ...

disputes/
  {disputeId}/
    - orderId, status, resolution, ...
    - subcolección: messages

conversations/
  {conversationId}/
    - user1Id, user2Id
    - subcolección: messages
```

### 3.2 Qué habría que cambiar en el código

| Archivo/Área | Cambios |
|--------------|---------|
| `prisma/schema.prisma` | Eliminar o reemplazar por reglas de Firestore |
| `lib/prisma.ts` | Sustituir por cliente Firestore (`firebase-admin`) |
| Todas las rutas que usan `prisma.*` | Reescribir con `getDoc`, `setDoc`, `updateDoc`, `query`, `collection`, etc. |
| `auth.ts` | Reemplazar bcrypt + JWT por Firebase Auth o mantener JWT con Firestore |
| Transacciones (`$transaction`) | Usar `runTransaction` de Firestore |
| Queries con `where`, `include`, `orderBy` | Traducir a queries de Firestore (menos flexibles) |
| Índices compuestos | Definir índices en Firestore para cada query compleja |

### 3.3 Limitaciones de Firestore

- **Sin JOINs:** Hay que hacer varias lecturas y combinar en código
- **Sin `contains`/`LIKE`:** Búsquedas de texto requieren Algolia/Elastic o similares
- **Límite de documentos por transacción:** 500
- **Costo:** Por lecturas/escrituras; puede subir con muchas consultas

---

## 4. Migración a Firebase Storage

### 4.1 Archivos que se suben actualmente

| Ruta | Archivos | Uso |
|------|----------|-----|
| `POST /profile/avatar` | avatar | Foto de perfil |
| `POST /kyc/upload` | dniFront, dniBack, selfie | KYC |
| `POST /tickets` | captureTicket, captureOwnership | Publicación de tickets |
| `POST /orders/:id/evidence` | evidence | Evidencia de pago |

### 4.2 Cambios necesarios

| Componente | Cambio |
|------------|--------|
| **API** | Quitar Multer; recibir archivos y subirlos a Storage con `getStorage().bucket().upload()` |
| **Storage** | Crear buckets/carpetas: `avatars/`, `kyc/`, `tickets/`, `evidence/` |
| **URLs** | Usar URLs firmadas o públicas de Storage en lugar de `/uploads/{filename}` |
| **App móvil** | Puede seguir enviando multipart a la API o subir directo a Storage con SDK (requiere reglas de seguridad) |

### 4.3 Reglas de Storage

Definir reglas para que solo usuarios autenticados suban a sus propias rutas (ej. `avatars/{userId}/`).

---

## 5. Admin online (accesible por internet)

### 5.1 Complejidad: **Baja**

El admin ya está preparado para usar una API remota. Solo falta:

1. **Desplegar el build del admin** en un hosting estático
2. **Configurar la URL de la API** en producción

### 5.2 Opciones de hosting para el admin

| Opción | Costo | Dificultad |
|--------|-------|------------|
| **Firebase Hosting** | Gratis (plan Spark) | Baja |
| **Vercel** | Gratis | Baja |
| **Netlify** | Gratis | Baja |
| **Railway** (junto a la API) | Incluido | Media |
| **Cloudflare Pages** | Gratis | Baja |

### 5.3 Pasos concretos

1. **Build del admin:**
   ```bash
   cd v2/apps/admin
   VITE_API_URL=https://tu-api.railway.app pnpm build
   ```

2. **Subir** la carpeta `dist/` a Firebase Hosting (o similar)

3. **CORS en la API:** Añadir el dominio del admin (ej. `https://admin-tu-proyecto.web.app`) a `CORS_ORIGIN_ADMIN` en producción

4. **Variables de entorno:** En el build, usar `VITE_API_URL` con la URL pública de la API

### 5.4 Seguridad

- El admin usa JWT; el token se guarda en `localStorage`
- Asegurar HTTPS en admin y API
- Considerar restricciones por IP o VPN si el admin es muy sensible

---

## 6. Alternativas a una migración completa

### 6.1 Opción A: Solo admin online (recomendada para corto plazo)

- **Esfuerzo:** 2–4 días
- **Cambios:** Desplegar admin en Firebase Hosting/Vercel, configurar CORS y `VITE_API_URL`
- **Base de datos y API:** Sin cambios

### 6.2 Opción B: Solo Firebase Storage

- **Esfuerzo:** 1–2 semanas
- **Cambios:** Sustituir Multer por subida a Firebase Storage en la API
- **Base de datos:** Sigue siendo PostgreSQL

### 6.3 Opción C: Migración completa a Firebase

- **Esfuerzo:** 5–8 semanas
- **Cambios:** Firestore + Storage + posiblemente Firebase Auth
- **Riesgo:** Alto; requiere pruebas exhaustivas

---

## 7. Recomendación

1. **Corto plazo:** Poner el admin online (Opción A) sin tocar base de datos ni API.
2. **Mediano plazo:** Si los uploads en Railway dan problemas, migrar solo Storage (Opción B).
3. **Largo plazo:** La migración completa a Firestore (Opción C) solo compensa si hay requisitos fuertes de escalabilidad o integración con otros servicios de Google Cloud.

---

## 8. Checklist de migración (si se opta por Firebase completo)

### Fase 1: Preparación
- [ ] Crear proyecto en Firebase Console
- [ ] Habilitar Firestore, Storage, Auth (si se usa)
- [ ] Instalar `firebase-admin` en la API
- [ ] Definir estructura de colecciones y documentos

### Fase 2: Firestore
- [ ] Crear cliente Firestore en `lib/firestore.ts`
- [ ] Migrar datos de PostgreSQL a Firestore (script de migración)
- [ ] Reescribir `auth.ts` (registro, login, refresh)
- [ ] Reescribir `users.ts`, `tickets.ts`, `orders.ts`, `disputes.ts`, `messages.ts`, `admin.ts`
- [ ] Eliminar Prisma y dependencias
- [ ] Crear índices compuestos en Firestore
- [ ] Probar todas las rutas

### Fase 3: Storage
- [ ] Configurar buckets y reglas de Storage
- [ ] Sustituir Multer por subida a Storage en users, tickets, orders
- [ ] Actualizar URLs en documentos (profileImageUrl, captureTicketUrl, etc.)
- [ ] Probar subida y descarga desde app móvil y admin

### Fase 4: Admin online
- [ ] Build con `VITE_API_URL` de producción
- [ ] Desplegar en Firebase Hosting
- [ ] Configurar CORS
- [ ] Probar login y flujos principales

### Fase 5: App móvil
- [ ] Verificar que la API siga siendo compatible (REST)
- [ ] Actualizar `API_BASE_OVERRIDE` si cambia la URL
- [ ] Probar flujos completos

---

## 9. Archivos que habría que modificar (resumen)

| Ruta | Cambio |
|------|--------|
| `apps/api/prisma/schema.prisma` | Eliminar o dejar solo para referencia |
| `apps/api/src/lib/prisma.ts` | Reemplazar por `lib/firestore.ts` |
| `apps/api/src/lib/uploads.ts` | Reemplazar por lógica de Firebase Storage |
| `apps/api/src/routes/auth.ts` | Reescribir con Firestore |
| `apps/api/src/routes/users.ts` | Reescribir + Storage para avatar y KYC |
| `apps/api/src/routes/tickets.ts` | Reescribir + Storage para capturas |
| `apps/api/src/routes/orders.ts` | Reescribir + Storage para evidencia |
| `apps/api/src/routes/disputes.ts` | Reescribir |
| `apps/api/src/routes/messages.ts` | Reescribir |
| `apps/api/src/routes/admin.ts` | Reescribir |
| `apps/api/src/routes/webhooks.ts` | Adaptar a Firestore |
| `apps/api/src/routes/health.ts` | Cambiar check de DB por Firestore |
| `apps/api/src/middleware/auth.ts` | Adaptar a Firestore |
| `apps/admin/` | Solo build + deploy + `VITE_API_URL` |

---

*Documento generado para Tickets Transfer v2. No se realizaron cambios en el código.*
