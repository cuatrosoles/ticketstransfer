# Poner la API online y compartir el APK (sin usar terminal)

Este documento explica cómo subir la API a un hosting y generar el APK para que tu cliente (en otra ciudad) pueda instalarlo, registrarse e iniciar sesión. **No hace falta usar terminal ni comandos** en el servidor: todo se configura desde la web.

**Migración a Vercel:** Si querés migrar todo el proyecto (API, Web, Admin) de Railway a Vercel, seguí la guía completa en [docs/MIGRACION_RAILWAY_A_VERCEL.md](docs/MIGRACION_RAILWAY_A_VERCEL.md).

---

## Importante: Hostinger compartido básico

**El plan compartido básico de Hostinger no ejecuta Node.js.** Solo pueden correr Node.js los planes **Business**, **Cloud** o **VPS**. Si tenés solo hosting compartido económico, tenés que usar un servicio gratuito para la API (recomendado abajo).

---

## Opción recomendada: Railway (gratis, sin terminal)

[Railway](https://railway.app) permite desplegar la API conectando GitHub. Ellos ejecutan el build y el inicio; vos solo configurás variables desde el panel.

### 1. Base de datos PostgreSQL (gratis)

1. Entrá a [Neon](https://neon.tech) (o [Supabase](https://supabase.com)) y creá una cuenta.
2. Creá un proyecto y una base de datos.
3. Copiá la **connection string** (URL) de PostgreSQL. Se ve así:
   ```txt
   postgresql://usuario:contraseña@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   Guardala para el paso 4.

### 2. Subir el código a GitHub

Si todavía no tenés el proyecto en GitHub:

1. Creá un repositorio en [github.com](https://github.com).
2. Subí el código (por ejemplo con la app de GitHub Desktop o arrastrando archivos desde la web).

### 3. Desplegar la API en Railway

1. Entrá a [railway.app](https://railway.app) e iniciá sesión (con GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Elegí el repositorio de ticketTransfer (o el que tenga `v2` con la API).
4. Railway crea un “service”. Entrá a ese service y configurá:

   - **Root Directory:** si tu repo es solo la carpeta `v2`, dejá vacío. Si el repo tiene una carpeta `v2` adentro, poné `v2`.

   - **Variables** (pestaña Variables):
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = la URL de Neon que copiaste (con `?sslmode=require` al final si es Neon).
     - `JWT_SECRET` = un texto largo y aleatorio (podés generar uno en [generate-secret.vercel.app](https://generate-secret.vercel.app)).
     - `JWT_REFRESH_SECRET` = otro texto largo y aleatorio.

   - **Root Directory:** si el repo es solo la carpeta `v2` (con `apps/` y `packages/` adentro), dejá vacío o `.`. Si el repo tiene `v2` dentro, poné `v2`.

   - **Build Command** (en Settings → Build). Desde la raíz del repo (o desde la carpeta `v2` si configuraste Root Directory = v2):
     ```bash
     pnpm install && pnpm --filter api run db:generate && pnpm --filter api build
     ```
     (La API se construye con esbuild y ya incluye el paquete `shared` en el bundle, así que no hace falta compilar `shared` por separado.)

   - **Start Command:**
     ```bash
     pnpm --filter api run start:prod
     ```
     Ese script aplica el esquema a la base (`prisma db push`) y arranca la API.

   - **Watch Paths** (opcional): si querés que solo redepliegue cuando cambie la API, poné `apps/api/**` o `v2/apps/api/**` según tu repo.

5. Guardá y esperá al deploy. Railway te va a dar una URL pública, por ejemplo:
   ```txt
   https://tu-proyecto.up.railway.app
   ```
   Esa es la URL de tu API. Probala en el navegador:
   ```txt
   https://tu-proyecto.up.railway.app/api/health
   ```
   Debería responder algo tipo `{"ok":true}`.

### 4. Poner esa URL en la app móvil y generar el APK

1. En tu PC, abrí el proyecto y editá el archivo:
   ```txt
   v2/apps/mobile/src/lib/api.ts
   ```
2. Cambiá la línea donde dice `API_BASE_OVERRIDE` y poné la URL de Railway **sin barra al final**:
   ```ts
   const API_BASE_OVERRIDE: string | null = 'https://tu-proyecto.up.railway.app';
   ```
3. Generá el APK de producción:
   ```bash
   cd v2/apps/mobile
   pnpm apk:release
   ```
4. El APK queda en:
   ```txt
   v2/apps/mobile/android/app/build/outputs/apk/release/app-release.apk
   ```
   Enviá ese archivo a tu cliente; puede instalarlo y registrarse / iniciar sesión contra la API en Railway.

---

## Alternativa: Render

[Render](https://render.com) también permite desplegar desde GitHub sin terminal.

1. Creá una **Web Service** y conectá el repo de GitHub.
2. Configurá:
   - **Root Directory:** la carpeta donde está `apps/api` (ej. `v2` si el repo es solo v2).
   - **Build Command:** igual que en Railway (instalar, `prisma generate`, `npm run build` en `apps/api`).
   - **Start Command:** `cd apps/api && npx prisma db push --skip-generate && node dist/index.js` (o `npm run start:prod`).
3. Añadí las variables de entorno: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.
4. Render te asigna una URL tipo `https://tu-api.onrender.com`. Usá esa URL en `API_BASE_OVERRIDE` en la app y generá el APK como en el paso 4 anterior.

---

## Si tenés Hostinger con Node.js (plan Business o superior)

Solo aplica si tu plan es **Business**, **Cloud** o **VPS** con Node.js.

1. En el **hPanel** de Hostinger, buscá la sección **Node.js** o **Aplicaciones Node.js**.
2. Creá una nueva aplicación Node.js y elegí **Deploy from GitHub** (o subí un ZIP del proyecto).
3. Configurá:
   - **Root / directorio de la app:** la ruta donde está la API (ej. `apps/api` o la carpeta que contenga `package.json` de la API).
   - **Comando de instalación:** `npm install` (o `pnpm install` si usás pnpm).
   - **Comando de build:** `npx prisma generate && npm run build`.
   - **Comando de inicio:** `npx prisma db push --skip-generate && node dist/index.js` (o `npm run start:prod`).
4. Añadí las variables de entorno en el panel (no en terminal): `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. La `DATABASE_URL` debe ser una base PostgreSQL accesible desde internet (ej. Neon o la base que ofrezca Hostinger si la tiene).
5. Hostinger te dará una URL pública. Esa misma URL la ponés en `API_BASE_OVERRIDE` en la app y generás el APK como antes.

---

## Resumen rápido

| Paso | Acción |
|------|--------|
| 1 | Base de datos Postgres en Neon (o Supabase). Copiá `DATABASE_URL`. |
| 2 | Código en GitHub. |
| 3 | Railway (o Render): New Project → Deploy from GitHub → configurar Root, Build, Start y variables (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`). |
| 4 | Copiá la URL pública de la API (ej. `https://tu-api.up.railway.app`). |
| 5 | En `v2/apps/mobile/src/lib/api.ts` poné `API_BASE_OVERRIDE = 'https://tu-api.up.railway.app'`. |
| 6 | Ejecutá `pnpm apk:release` en `v2/apps/mobile` y compartí el APK que queda en `android/app/build/outputs/apk/release/`. |

Con eso tu cliente puede instalar el APK en otra ciudad y registrarse / loguearse contra tu API online, sin usar terminal en el hosting.
