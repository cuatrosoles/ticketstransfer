# Hostinger: landing y admin (build local, solo `dist`)

Despliegue estático **sin migrar API ni bases de datos**. La API sigue en su URL actual (ej. Vercel); Neon y Firebase no cambian.

## URLs de producción

| App | URL | Carpeta local tras `pnpm run static:prepare` |
|-----|-----|-----------------------------------------------|
| **Landing (web)** | https://ticketstransfer.net | `v2/static-deploy/ticketstransfer.net/` |
| **Panel admin** | https://admin.ticketstransfer.net | `v2/static-deploy/admin.ticketstransfer.net/` |

Opcional: redirigir `https://www.ticketstransfer.net` → `https://ticketstransfer.net` desde hPanel o `.htaccess` en el sitio `www`.

---

## 1. Variables de entorno (build)

Vite embebe las variables en el JS al compilar. Definilas **antes** del build.

### Landing — `apps/web/.env.production`

```bash
cp apps/web/.env.production.example apps/web/.env.production
# Completá VITE_FIREBASE_* (mismos valores que en Vercel o apps/web/.env)
```

### Admin — `apps/admin/.env.production`

```bash
cp apps/admin/.env.production.example apps/admin/.env.production
# Misma VITE_API_URL y Firebase que en web
```

`VITE_API_URL` debe ser la URL pública de la API (ej. `https://ticketstransfer-api.vercel.app`), **sin** barra final.

---

## 2. Build y empaquetado (local)

Desde la carpeta **`v2`**:

```bash
pnpm run static:prepare
```

Equivale a `build:web` + `build:admin` + copia a `static-deploy/` con `.htaccess` y archivos `LEEME*.txt`.

---

## 3. Hostinger (hPanel)

### Dominio raíz — ticketstransfer.net

1. **Dominios** → `ticketstransfer.net` apuntando al hosting (registros A/CNAME según indique Hostinger).
2. Sitio principal: document root típico `public_html` para el dominio raíz.
3. Por **FTP/SFTP**, subí el **contenido** de `static-deploy/ticketstransfer.net/` (no la carpeta vacía): `index.html`, `assets/`, `.htaccess`, etc.

### Subdominio — admin.ticketstransfer.net

1. **Dominios** → **Subdominios** → crear `admin` → asignar carpeta (ej. `public_html/admin` o la ruta que muestre hPanel).
2. Subí el **contenido** de `static-deploy/admin.ticketstransfer.net/` a ese document root.
3. Activá **SSL** (Let's Encrypt) para `admin.ticketstransfer.net`.

### Firebase Authentication

En [Firebase Console](https://console.firebase.google.com) → Authentication → **Authorized domains**, agregá:

- `ticketstransfer.net`
- `admin.ticketstransfer.net`
- (opcional) `www.ticketstransfer.net`

Sin esto, el login en el navegador fallará en producción.

---

## 4. Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm run build:static` | Solo compila web y admin |
| `pnpm run pack:static` | Solo copia `dist` → `static-deploy/` (nombres por dominio) |
| `pnpm run static:prepare` | Build + copia |

`static-deploy/` está en `.gitignore`.

---

## 5. Comprobaciones

- https://ticketstransfer.net carga la landing.
- https://admin.ticketstransfer.net carga el panel; iniciá sesión con usuario admin.
- Recargar una ruta interna (ej. `/tarjetas` en web) no devuelve 404 (`.htaccess` activo).
- En DevTools → Network, las llamadas van a `VITE_API_URL` configurada en el build.

---

## 6. Qué no incluye este flujo

- No despliega la API (`apps/api`).
- No migra PostgreSQL (Neon) ni Firestore.
- No sustituye Vercel hasta que cambies DNS y desactives los proyectos web/admin allí.

Cuando el tráfico use Hostinger, podés quitar dominios personalizados de los proyectos Vercel **solo de web y admin**, manteniendo el proyecto de la API.
