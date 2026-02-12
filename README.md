# Tickets Transfer v2

Plataforma de reventa e intercambio segura de entradas digitales para eventos en Argentina (Tickets Transfer App solution).

## Estructura del proyecto

```
v2/
├── apps/
│   ├── api/          # Backend Node + Express + Prisma
│   ├── web/          # Frontend público React (Vite)
│   ├── admin/        # Panel administrativo React (Vite)
│   └── mobile/       # App móvil React Native (sin Expo)
├── packages/
│   └── shared/       # Tipos, constantes y schemas Zod
├── package.json
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js >= 20
- pnpm 9
- PostgreSQL

## Pasos iniciales (acciones ineludibles por tu parte)

1. **Instalar dependencias**
   ```bash
   cd v2
   pnpm install
   ```

2. **Base de datos**
   - Crear una base PostgreSQL.
   - Copiar `apps/api/.env.example` a `apps/api/.env`.
   - Configurar `DATABASE_URL` y `JWT_SECRET` (y opcionalmente `JWT_REFRESH_SECRET`, `CORS_ORIGIN_WEB`, `CORS_ORIGIN_ADMIN`, `APP_URL`).

3. **Generar Prisma y aplicar schema**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```
   O con migraciones: `pnpm db:migrate` (después de crear la primera migración con `npx prisma migrate dev`).

4. **Arrancar en desarrollo**
   - API: `pnpm dev:api` o `npm run dev:api:run` (puerto 3001).
   - Web: `pnpm dev:web` o `npm run dev:web:run` (puerto 5173).
   - Admin: `pnpm dev:admin` o `npm run dev:admin:run` (puerto 5174).
   - Opcional: `pnpm dev` para API + Web en paralelo.

5. **Variable de entorno en la web**
   - Crear `apps/web/.env` con `VITE_API_URL=http://localhost:3001` si la API corre en otro host.

## Build para producción

- **API**: `pnpm build:api` → `apps/api/dist/`. Ejecutar con `node dist/index.js` (o `pnpm start` dentro de `apps/api`).
- **Web**: `pnpm build:web` → `apps/web/dist/` (estático; servir con Nginx, Vercel, etc.).
- **Admin**: cuando exista, `pnpm build:admin` → `apps/admin/dist/`.

## Versión móvil (React Native, sin Expo)

La app en `apps/mobile` usa React Native CLI (sin Expo). Incluye Welcome, Login, Registro y Home, y la misma API.

- **Generar android/ e ios/:** ver `apps/mobile/README.md` (crear proyecto temporal con la CLI y copiar las carpetas nativas).
- **Ejecutar:** desde `apps/mobile`: `pnpm start` y en otra terminal `pnpm android` o `pnpm ios`.
- **APK:** ver `apps/mobile/README.md` (gradlew assembleRelease).

## Ubicación del código relevante

| Qué | Dónde |
|-----|--------|
| Schema de BD | `apps/api/prisma/schema.prisma` |
| Rutas auth (registro, login, me) | `apps/api/src/routes/auth.ts` |
| Rutas usuarios (perfil, onboarding, KYC) | `apps/api/src/routes/users.ts` |
| Rutas tickets y órdenes | `apps/api/src/routes/tickets.ts`, `orders.ts` |
| Constantes (ticketeras, apps, sexo) | `packages/shared/src/constants.ts` |
| Validación (registro, login, onboarding) | `packages/shared/src/schemas.ts` |
| Pantalla Bienvenida (ACERCA DE, VENTA/INTERCAMBIO) | `apps/web/src/pages/Welcome.tsx` |
| Login e Registro | `apps/web/src/pages/Login.tsx`, `Register.tsx` |
| Estilos globales | `apps/web/src/styles/global.css` |
| Panel admin (Dashboard, usuarios, KYC, disputas) | `apps/admin/src/` |
| Rutas admin API | `apps/api/src/routes/admin.ts` |
| App móvil (Welcome, Login, Register, Home) | `apps/mobile/src/` |

## Verificación KYC (Didit)

El proyecto incluye verificación de identidad con Didit en mobile y web. Ver `docs/KYC-DIDIT.md` para configuración.

## Más detalles

Ver `docs/PASOS-MANUALES.md` para tareas manuales (env, BD, integración de pagos, deploy) y generación de versiones web y APK.
