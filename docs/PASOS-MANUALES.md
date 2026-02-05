# Pasos manuales – Tickets Transfer v2

Acciones que debes realizar tú para dejar la plataforma lista y desplegada.

---

## 1. Entorno local

1. **Clonar / abrir el repo** y entrar en `v2`.
2. **Instalar dependencias**: `pnpm install`.
3. **PostgreSQL**: tener un servidor corriendo y crear una base de datos (ej. `tickets_transfer`).
4. **Variables de entorno de la API**  
   En `apps/api/`:
   - Copiar `.env.example` a `.env`.
   - Completar:
     - `DATABASE_URL`: URL de PostgreSQL (ej. `postgresql://user:pass@localhost:5432/tickets_transfer`).
     - `JWT_SECRET` y opcionalmente `JWT_REFRESH_SECRET`: cadenas aleatorias seguras.
     - Opcional: `CORS_ORIGIN_WEB`, `CORS_ORIGIN_ADMIN`, `APP_URL` (ej. `http://localhost:3001`).
5. **Prisma**:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```
   Para usar migraciones en lugar de `db:push`:
   ```bash
   cd apps/api && npx prisma migrate dev --name init
   ```
6. **Variable para la web** (si la API no está en `http://localhost:3001`):  
   En `apps/web/` crear `.env` con:
   ```
   VITE_API_URL=http://localhost:3001
   ```
7. **Usuario admin** (opcional): registrar un usuario desde la web y en la BD asignarle `role = 'admin'` (p. ej. con `pnpm db:studio`).
8. **Arrancar**:
   - `pnpm dev:api` o `npm run dev:api:run` (API en 3001).
   - `pnpm dev:web` o `npm run dev:web:run` (web en 5173).
   - `pnpm dev:admin` o `npm run dev:admin:run` (admin en 5174).

---

## 2. Pagos (Mercado Pago / Stripe)

La API actualmente no procesa pagos reales. Para producción:

- **Mercado Pago** o **Stripe**: crear cuenta, obtener claves (test/producción) y guardarlas en variables de entorno de la API.
- En `apps/api/src/routes/orders.ts` (y/o un servicio de pagos):
  - Crear el payment intent / preferencia con la SDK correspondiente.
  - Devolver al front el `client_secret` o `init_point` para que el usuario pague.
  - Implementar el **webhook** que recibe la notificación de pago aprobado y actualiza la orden a `PAGADO` / `ESPERANDO_TRANSFERENCIA`.
- En la web, en la pantalla de pago, integrar el checkout (botón de MP o elementos de Stripe) usando lo que devuelva la API.

---

## 3. Subida de archivos (producción)

En desarrollo los archivos se guardan en `apps/api/uploads/`. En producción:

- Configurar un almacenamiento externo (S3, Cloudinary, etc.).
- Ajustar la API para subir a ese servicio y guardar la URL en la BD (KYC, capturas de tickets, evidencia).
- Opcional: servir `/uploads` con un proxy o CDN en lugar del disco local.

---

## 4. Versión web (pública y admin)

- **Web pública**  
  - Build: `pnpm build:web`.  
  - Salida: `apps/web/dist/`.  
  - Desplegar en Vercel, Netlify, o cualquier host estático (Nginx, etc.).  
  - Configurar la variable de entorno `VITE_API_URL` con la URL de la API en producción.

- **Panel admin**  
  - La app está en `apps/admin`. Build: `pnpm build:admin` o desde `apps/admin`: `npm run build`.  
  - Desplegar igual que un SPA (puerto 5174 en dev). La API usa rol `admin` para `/api/admin/*`.

---

## 5. Versión móvil y APK (Android)

- La app está en **`apps/mobile`** (React Native **sin Expo**). Incluye Bienvenida, Login, Registro y Home, usando la misma API.
- **Carpetas nativas:** si no tenés `android/` e `ios/`, seguí las instrucciones de `apps/mobile/README.md` (crear proyecto temporal con la CLI y copiar android e ios).
- **APK:** desde `apps/mobile`: configurar firma en `android/app/build.gradle` si hace falta, luego `cd android && ./gradlew assembleRelease`. El APK queda en `android/app/build/outputs/apk/release/`.
- Configurar la URL de la API en `apps/mobile/src/lib/api.ts` (en dispositivo físico no usar `localhost`).

---

## 6. Resumen de ubicaciones de código

| Tarea | Ubicación |
|-------|-----------|
| Schema y migraciones | `apps/api/prisma/` |
| Registro / login / JWT | `apps/api/src/routes/auth.ts` |
| Perfil, onboarding, KYC | `apps/api/src/routes/users.ts` |
| Tickets y órdenes | `apps/api/src/routes/tickets.ts`, `orders.ts` |
| Constantes y validación | `packages/shared/src/` |
| Pantallas Bienvenida, Login, Registro | `apps/web/src/pages/` |
| Estilos y tema | `apps/web/src/styles/global.css` |

Con estos pasos tendrás el entorno listo, la base de datos creada, y las indicaciones para pagos, archivos, deploy web y generación del APK.
