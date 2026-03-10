# Migración completa: Railway → Vercel

Guía paso a paso para migrar todos los servicios de Tickets Transfer desde Railway a Vercel, manteniendo las mismas funcionalidades (API, Web, Admin, base de datos Neon, Firebase Auth/Storage/Firestore).

---

## Resumen de cambios

| Componente        | En Railway                    | En Vercel                                      |
|-------------------|-------------------------------|------------------------------------------------|
| **API**           | Servicio Node + Volume uploads| Proyecto Vercel (serverless) + Firebase Storage|
| **Web**           | Servicio estático (opcional)  | Proyecto Vercel (Vite)                         |
| **Admin**         | Servicio estático             | Proyecto Vercel (Vite)                         |
| **Base de datos**  | Neon (sin cambios)            | Neon (misma `DATABASE_URL`)                    |
| **Auth / Firestore** | Firebase (sin cambios)     | Firebase (sin cambios)                         |
| **Uploads**       | Volume en Railway o Firebase  | Solo Firebase Storage (obligatorio en Vercel) |

---

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com) (con GitHub conectado).
- Repositorio del proyecto en GitHub (el mismo que usabas con Railway).
- Base de datos en **Neon** y proyecto **Firebase** ya configurados (no se migran; se siguen usando).
- **Importante:** En Vercel no hay disco persistente. Las imágenes/archivos deben servirse desde **Firebase Storage**. No uses `STORAGE_FALLBACK=local` en la API.

---

## Paso 1: Crear los proyectos en Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con GitHub.
2. **Add New…** → **Project**.
3. Importá el repositorio de Tickets Transfer (si no está, conectá GitHub y elegí el repo).
4. Vas a crear **tres proyectos** vinculados al mismo repo, con distintos **Root Directory** y variables. Podés hacerlo de dos maneras:
   - **Opción A:** Un solo proyecto “monorepo” con varios despliegues (más avanzado).
   - **Opción B (recomendada):** Tres proyectos separados: `tt-api`, `tt-web`, `tt-admin`.

En esta guía se usa la **Opción B**: tres proyectos.

---

## Paso 2: Proyecto 1 – API (`tt-api`)

### 2.1 Crear el proyecto

1. **Add New…** → **Project** → elegí el repo.
2. Nombre del proyecto: por ejemplo **tt-api** (o el que prefieras).
3. **Root Directory:** hacé clic en **Edit** y elegí **`apps/api`**.
4. **Framework Preset:** Vercel puede detectar “Other” o “Node.js”; no hace falta elegir Vite aquí.
5. Dejá **Build and Output Settings** para configurarlos en el siguiente paso.

### 2.2 Configuración de build (API)

En **Settings** del proyecto **tt-api**:

| Campo               | Valor |
|---------------------|--------|
| **Root Directory**  | `apps/api` |
| **Install Command** | `cd ../.. && pnpm install` (instala desde la raíz del monorepo para resolver `workspace:*`) |
| **Build Command**   | `pnpm run build` |
| **Output Directory** | *(dejar vacío; la API se sirve como función serverless)* |
| **Development Command** | `pnpm run dev` (opcional, para `vercel dev`) |
| **Node.js Version** | 20.x (en Settings → General, si está disponible) |

No configures **Start Command**; en Vercel la API se expone como función serverless (el archivo `api/index.ts` importa la app desde `dist/index.js`). Asegurate de que el **Build Command** termine bien para que exista `dist/index.js`.

### 2.3 Variables de entorno (API)

En el proyecto **tt-api** → **Settings** → **Environment Variables**, añadí **todas** las variables que tenías en Railway para la API. Ejemplo:

| Variable | Valor | Notas |
|----------|--------|--------|
| `NODE_ENV` | `production` | |
| `VERCEL` | `1` | Lo define Vercel automáticamente; no hace falta que lo pongas vos. |
| `DATABASE_URL` | `postgresql://...?sslmode=require` | La misma URL de Neon que usabas en Railway. |
| `JWT_SECRET` | *(valor largo aleatorio)* | |
| `JWT_REFRESH_SECRET` | *(valor largo aleatorio)* | |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account",...}` | JSON completo de la cuenta de servicio de Firebase (como en Railway). |
| `FIREBASE_STORAGE_BUCKET` | `tu-proyecto.firebasestorage.app` | Bucket de Firebase Storage. |
| `APP_URL` | `https://tt-api.vercel.app` | **Importante:** reemplazá por la URL que te asigne Vercel para este proyecto (ej. `https://tt-api-xxx.vercel.app`). Sin barra final. |
| `WEB_URL` | `https://tt-web.vercel.app` | URL del proyecto Web en Vercel (la configurás en el Paso 3). |
| `CORS_ORIGIN_WEB` | `https://tt-web.vercel.app` | Opcional; en producción la API suele permitir cualquier origen. |
| `CORS_ORIGIN_ADMIN` | `https://tt-admin.vercel.app` | Opcional. |
| `RESEND_API_KEY` | `re_xxx` | Si usás verificación por email. |
| `EMAIL_FROM_VERIFICATION` | `Tickets Transfer <noreply@tudominio.com>` | Si tenés dominio verificado en Resend. |
| `TWILIO_ACCOUNT_SID` | `ACxxx` | Si usás verificación por SMS. |
| `TWILIO_AUTH_TOKEN` | *(token)* | |
| `TWILIO_PHONE_NUMBER` | `+54...` | |
| `MERCADOPAGO_ACCESS_TOKEN` | *(opcional si usás Firestore para credenciales)* | |
| `MERCADOPAGO_WEBHOOK_SECRET` | *(si usás webhooks)* | |
| `DIDIT_*` | *(si usás Didit KYC)* | |

**No definas** `STORAGE_FALLBACK=local` en Vercel. En Vercel no hay disco persistente; la API debe usar **solo Firebase Storage** para subir y servir archivos (avatares, tickets, etc.).

### 2.4 Desplegar la API

1. Guardá las variables y hacé **Deploy** (o un push a la rama conectada).
2. Cuando termine el deploy, anotá la **URL del proyecto**, por ejemplo:  
   `https://tt-api-xxxx.vercel.app`  
   (o el dominio que hayas configurado).
3. Probá el health check:  
   `https://tt-api-xxxx.vercel.app/api/health`  
   Debería responder algo como `{"ok":true}`.

---

## Paso 3: Proyecto 2 – Web (`tt-web`)

### 3.1 Crear el proyecto

1. **Add New…** → **Project** → mismo repositorio.
2. Nombre: **tt-web**.
3. **Root Directory:** **`apps/web`**.

### 3.2 Configuración de build (Web)

| Campo               | Valor |
|---------------------|--------|
| **Root Directory**  | `apps/web` |
| **Install Command** | `cd ../.. && pnpm install` |
| **Build Command**   | `pnpm run build` |
| **Output Directory**| `dist` |
| **Framework**       | Vite (Vercel suele detectarlo) |

### 3.3 Variables de entorno (Web)

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | `https://tt-api-xxxx.vercel.app` | URL de la API en Vercel (la del Paso 2), **sin** barra final. |

Las variables de Firebase para el cliente (si las usás en `apps/web`) configuralas igual que en tu entorno actual (por ejemplo en un `.env` o en variables de Vercel con prefijo `VITE_`).

### 3.4 Desplegar la Web

Deploy del proyecto. La URL será algo como `https://tt-web-xxxx.vercel.app`. Actualizá en la API las variables `WEB_URL` y `CORS_ORIGIN_WEB` si las usás.

---

## Paso 4: Proyecto 3 – Admin (`tt-admin`)

### 4.1 Crear el proyecto

1. **Add New…** → **Project** → mismo repositorio.
2. Nombre: **tt-admin**.
3. **Root Directory:** **`apps/admin`**.

### 4.2 Configuración de build (Admin)

| Campo               | Valor |
|---------------------|--------|
| **Root Directory**  | `apps/admin` |
| **Install Command** | `cd ../.. && pnpm install` |
| **Build Command**   | `pnpm run build` |
| **Output Directory**| `dist` |

### 4.3 Variables de entorno (Admin)

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | `https://tt-api-xxxx.vercel.app` | Misma URL de la API en Vercel. |

### 4.4 Desplegar el Admin

Deploy. URL típica: `https://tt-admin-xxxx.vercel.app`. Actualizá en la API `CORS_ORIGIN_ADMIN` si la usás.

---

## Paso 5: Actualizar la app móvil (APK / builds)

La app móvil debe apuntar a la nueva URL de la API en Vercel.

1. Abrí `apps/mobile/src/lib/api.ts`.
2. Reemplazá la URL de Railway por la de Vercel:

```ts
const API_BASE_OVERRIDE: string | null = 'https://tt-api-xxxx.vercel.app';
```

(Usá la URL real de tu proyecto API en Vercel, **sin** barra final.)

3. Volvé a generar el APK cuando corresponda:

```bash
cd apps/mobile
pnpm apk:release
```

---

## Paso 6: Base de datos (Neon) y migraciones

- La base de datos **sigue siendo la misma** en Neon; no hace falta migrarla.
- La **API en Vercel** usa la misma `DATABASE_URL` que configuraste en el Paso 2.
- Las migraciones de Prisma seguís ejecutándolas **en local** contra esa misma base:

```bash
cd apps/api
pnpx prisma migrate deploy
```

(O desde la raíz: `pnpm --filter api exec -- prisma migrate deploy`.)

No es necesario ejecutar migraciones “dentro” de Vercel; solo asegurate de que `DATABASE_URL` en el proyecto **tt-api** sea la correcta.

---

## Paso 7: Webhooks y dominios externos

Si tenés webhooks (Mercado Pago, Didit, Twilio, etc.) que apuntan a la API en Railway:

1. En cada servicio (Mercado Pago, Didit, etc.), actualizá la URL del webhook a la nueva URL de la API en Vercel, por ejemplo:  
   `https://tt-api-xxxx.vercel.app/api/mercadopago/webhook`  
   (y las rutas que correspondan).
2. Si usabas un dominio propio en Railway (ej. `api.tudominio.com`), en Vercel podés añadir ese dominio en **tt-api** → **Settings** → **Domains** y configurar el DNS según las instrucciones de Vercel.

---

## Paso 8: Dominios personalizados (opcional)

Para cada proyecto (API, Web, Admin):

1. Entrá al proyecto en Vercel → **Settings** → **Domains**.
2. Añadí el dominio (ej. `api.ticketstransfer.com`, `app.ticketstransfer.com`, `admin.ticketstransfer.com`).
3. Configurá en tu proveedor DNS los registros que indique Vercel (CNAME, A, etc.).
4. Actualizá `APP_URL`, `WEB_URL`, `VITE_API_URL` y CORS si usás estos dominios.

---

## Paso 9: Comprobar que todo funciona

- **API:**  
  - `https://tu-api.vercel.app/api/health` → `{"ok":true}`.  
  - Login, registro, perfil, subida de imagen (Firebase Storage), tickets, órdenes, etc.
- **Web:** Login con Firebase, listado de tickets, flujo de compra.
- **Admin:** Login con usuario admin, gestión de usuarios/tickets/configuración.
- **App móvil:** Misma URL de API; login, perfil, subida de foto (debe verse vía Firebase Storage).

---

## Paso 10: Dejar de usar Railway

Cuando todo esté verificado en Vercel:

1. En Railway, podés pausar o eliminar los servicios (API, Admin, y Web si los tenías).
2. Revisá que no queden referencias a URLs de Railway en:
   - Variables de entorno de Vercel.
   - `apps/mobile/src/lib/api.ts` (que ya debe tener la URL de Vercel).
   - Cualquier script o doc que apunte a Railway.

---

## Resolución de problemas

### La API responde 500 o no arranca

- Revisá los **logs** del proyecto en Vercel (Deployments → último deploy → **Functions** → logs).
- Confirmá que todas las variables de entorno estén definidas (sobre todo `FIREBASE_SERVICE_ACCOUNT_JSON`, `DATABASE_URL`, `APP_URL`).
- No uses `STORAGE_FALLBACK=local` en Vercel.

### Las imágenes no se ven (perfil, tickets)

- En Vercel la API **no** sirve archivos desde disco; debe usar **Firebase Storage**.
- Asegurate de tener `FIREBASE_STORAGE_BUCKET` correcto y que Firebase Storage esté habilitado y facturable si aplica.
- Las URLs de imágenes deben ser de Firebase (ej. `https://storage.googleapis.com/...`) o las que devuelva tu API desde Firebase.

### Error “pnpm: not found” o dependencias no resueltas

- **Install Command** del proyecto debe ser desde la raíz del monorepo:  
  `cd ../.. && pnpm install`  
  con **Root Directory** correcto (`apps/api`, `apps/web` o `apps/admin`).

### CORS o “blocked by CORS”

- Revisá que `APP_URL`, `WEB_URL`, `CORS_ORIGIN_WEB` y `CORS_ORIGIN_ADMIN` en la API coincidan con las URLs reales de tus proyectos en Vercel (o con tus dominios personalizados).

### Timeout en la API

- Por defecto las funciones en Vercel tienen un tiempo límite (por ejemplo 60 s en plan Pro). En `apps/api/vercel.json` ya está configurado `maxDuration: 60` para la función. Si necesitás más, revisá los límites de tu plan.

---

## Resumen de URLs a configurar

| Dónde | Qué |
|-------|-----|
| **Vercel – tt-api** | `APP_URL` = URL pública de la API (ej. `https://tt-api-xxx.vercel.app`). |
| **Vercel – tt-api** | `WEB_URL` = URL del front web. |
| **Vercel – tt-web** | `VITE_API_URL` = URL de la API. |
| **Vercel – tt-admin** | `VITE_API_URL` = URL de la API. |
| **apps/mobile** | `API_BASE_OVERRIDE` en `apps/mobile/src/lib/api.ts` = URL de la API. |
| **Webhooks externos** | Actualizar URLs a la API en Vercel. |

Con esto tenés la migración completa de Railway a Vercel con las mismas funcionalidades y pasos detallados para ejecutarla vos mismo.
