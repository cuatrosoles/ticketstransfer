# Admin online en Railway – Guía paso a paso

Instrucciones para desplegar el panel de administración de Tickets Transfer en Railway y acceder desde cualquier lugar.

---

## Requisitos previos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub conectado a Railway
- API ya desplegada en Railway (ej: `https://ticketstransfer-production.up.railway.app`)

---

## Paso 1: Preparar el admin para producción

### 1.1 Dependencia `serve`

El `package.json` del admin ya incluye `serve` y el script `start` para servir el build. Si no los tenés, añadí:

```json
"scripts": { "start": "serve -s dist -l 3000" },
"dependencies": { "serve": "^14.2.4" }
```

El archivo `apps/admin/nixpacks.toml` está configurado para que Railway detecte el build en monorepos.

### 1.2 Configurar base path (opcional)

Si el admin se sirve en un subpath (ej: `https://tu-dominio.com/admin`), configurá `base` en `apps/admin/vite.config.ts`:

```ts
export default defineConfig({
  plugins: [react()],
  base: '/',  // o '/admin/' si usás subpath
  server: { port: 5174 },
});
```

Para un dominio propio, dejalo en `'/'`.

---

## Paso 2: Crear el servicio Admin en Railway

### 2.1 Nuevo servicio desde el proyecto

1. Entrá a [Railway Dashboard](https://railway.app/dashboard)
2. Abrí el proyecto de Tickets Transfer
3. Clic en **+ New** → **Empty Service**
4. Nombrá el servicio: `admin` (o `tt-admin`)

### 2.2 Conectar al repositorio

1. Clic en el servicio admin
2. **Settings** → **Source** → **Connect Repo**
3. Elegí el repo y la rama (ej: `main`)

### 2.3 Configurar build y start

El admin ya no usa dependencias `workspace:*`, así que Railway puede usar **npm** por defecto.

En **Settings** del servicio admin:

| Variable | Valor |
|----------|-------|
| **Root Directory** | `apps/admin` |
| **Build Command** | *(vacío – Railway detecta Vite y ejecuta `npm run build`)* |
| **Start Command** | `npx serve -s dist -l $PORT` |

Si Railway no detecta el build, usá explícitamente:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`

### 2.4 Variables de entorno

En **Variables** del servicio admin:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://ticketstransfer-production.up.railway.app` | URL pública de tu API |
| `NODE_ENV` | `production` | (opcional) |

Importante: `VITE_*` se inyecta en tiempo de build. Si cambiás la API, hay que volver a desplegar el admin.

---

## Paso 3: Configurar CORS en la API

La API debe aceptar peticiones desde el dominio del admin.

### 3.1 Variables de entorno de la API

En el servicio **API** de Railway, en **Variables**:

| Variable | Valor |
|----------|-------|
| `CORS_ORIGIN_ADMIN` | `https://admin-production-XXXX.up.railway.app` |

Reemplazá `XXXX` por el ID que Railway asigne al admin (ej: `admin-production-a1b2c3d4.up.railway.app`).

### 3.2 Verificar CORS en producción

En producción, la API usa `corsOrigin = true` cuando `NODE_ENV=production`, lo que permite cualquier origen. Si tenés `NODE_ENV=production`, no hace falta `CORS_ORIGIN_ADMIN`.

Si querés restringir orígenes, en `apps/api/src/index.ts` la lógica actual es:

```ts
const corsOrigin = isProduction
  ? true  // ← Permite todo en producción
  : [process.env.CORS_ORIGIN_WEB, process.env.CORS_ORIGIN_ADMIN].filter(Boolean);
```

Con `isProduction = true`, CORS ya permite el admin. No hace falta cambiar nada salvo que quieras limitar orígenes.

---

## Paso 4: Generar dominio público

1. En el servicio **admin**, **Settings** → **Networking** → **Generate Domain**
2. Railway generará algo como: `admin-production-a1b2c3d4.up.railway.app`
3. Copiá esa URL; es la del panel de administración

---

## Paso 5: Rebuild con la URL correcta

Como `VITE_API_URL` se usa en build time:

1. Configurá `VITE_API_URL` con la URL de la API
2. Guardá las variables
3. **Deploy** → **Redeploy** (o push a la rama conectada)

---

## Paso 6: Probar el admin

1. Abrí `https://admin-production-XXXX.up.railway.app`
2. Iniciá sesión con un usuario con `role: 'admin'`
3. Comprobá que el Dashboard, Usuarios, KYC, etc. carguen bien

---

## Resumen de URLs de ejemplo

| Servicio | URL ejemplo |
|----------|-------------|
| API | `https://ticketstransfer-production.up.railway.app` |
| Admin | `https://admin-production-a1b2c3d4.up.railway.app` |

---

## Dominio personalizado (opcional)

Para usar algo como `admin.ticketstransfer.com`:

1. En Railway: **admin** → **Settings** → **Networking** → **Custom Domain**
2. Añadí `admin.ticketstransfer.com`
3. Configurá en tu DNS un registro CNAME apuntando al dominio que indique Railway
4. Actualizá `VITE_API_URL` si hace falta y redeploy

---

## Solución de problemas

### Error: `Unsupported URL Type "workspace:": workspace:*`

Este error ocurría cuando el admin usaba `@tickets-transfer/shared` con `workspace:*`. **Ya está resuelto**: se eliminó esa dependencia porque el admin no la utilizaba.

Si el error persiste en un deploy anterior, hacé un nuevo deploy tras el último commit.

### El admin no carga / pantalla en blanco

- Revisá la consola del navegador (F12)
- Comprobá que `VITE_API_URL` esté bien en el build
- Verificá que los assets se sirvan correctamente (pestaña Network)

### Error de CORS al hacer login

- Confirmá que la API tenga `NODE_ENV=production` o que `CORS_ORIGIN_ADMIN` incluya la URL del admin
- Revisá que la URL del admin no tenga trailing slash inconsistente

### "Failed to fetch" / "Network request failed"

- Comprobá que `VITE_API_URL` sea la URL correcta de la API
- Verificá que la API esté en ejecución y accesible desde internet

### Build falla en Railway

- Revisá que `pnpm` esté disponible (Railway suele detectarlo)
- Si usás `Root Directory`, probá con la raíz vacía y ajustando los comandos
- Revisá los logs de build en Railway

---

## Checklist final

- [ ] Servicio admin creado en Railway
- [ ] `VITE_API_URL` configurada con la URL de la API
- [ ] Build y start commands configurados
- [ ] Dominio generado para el admin
- [ ] Login con usuario admin probado
- [ ] Dashboard y secciones principales verificadas
