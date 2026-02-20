# Admin online en Railway – Guía paso a paso

Instrucciones para desplegar el panel de administración de Tickets Transfer en Railway.

---

## Requisitos previos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub conectado a Railway
- API ya desplegada en Railway

---

## Paso 1: Crear el servicio Admin

1. Railway Dashboard → tu proyecto → **+ New** → **Empty Service**
2. Nombrá el servicio: `admin`
3. **Settings** → **Source** → **Connect Repo** (si no está conectado)

---

## Paso 2: Configuración CRÍTICA

### Root Directory = `apps/admin`

**Debe ser exactamente `apps/admin`.** Si está en `v2` o vacío, Railway usará pnpm y fallará con `pnpm: not found`.

### Build y Start

En **Settings** → **Build** y **Deploy**:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `apps/admin` |
| **Build Command** | *(dejalo VACÍO – usa `nixpacks.toml`)* |
| **Start Command** | *(dejalo VACÍO – usa `nixpacks.toml`)* |

Si Railway pide comandos explícitos:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s dist -l $PORT`

**Borrá cualquier Build Command que use `pnpm`** – Railway no lo instala.

### Variables de entorno

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://ticketstransfer-production.up.railway.app` |

---

## Paso 3: Dominio y prueba

1. **Settings** → **Networking** → **Generate Domain**
2. Hacé **Redeploy**
3. Abrí la URL del admin e iniciá sesión con un usuario `role: admin`

---

## Si sigue fallando

1. Verificá que **Root Directory** sea `apps/admin` (no `v2`)
2. Borrá el **Build Command** en Settings para que use `apps/admin/nixpacks.toml`
3. El archivo `apps/admin/nixpacks.toml` fuerza el uso de **npm** (no pnpm)
