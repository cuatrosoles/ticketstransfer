# Fuentes Cooper (web + mobile)

Este proyecto esta configurado para usar:

- Dropdown: `Cooper Black`
- Encabezados `h1` a `h5`: `Cooper Black`
- Parrafos y texto general: `Cooper`

## 1) Archivos a copiar

### Web (`apps/web`)

Copiar en `apps/web/public/fonts/cooper/`:

- `Cooper-Regular.woff2`
- `Cooper-Regular.woff`
- `Cooper-Black.woff2`
- `Cooper-Black.woff`

### Admin (`apps/admin`)

Copiar en `apps/admin/public/fonts/cooper/`:

- `Cooper-Regular.woff2`
- `Cooper-Regular.woff`
- `Cooper-Black.woff2`
- `Cooper-Black.woff`

### Mobile React Native (`apps/mobile`)

Copiar en `apps/mobile/assets/fonts/`:

- `Cooper-Regular.ttf`
- `Cooper-Black.ttf`

## 2) Linkear fuentes en mobile

Desde la raiz `v2`:

```bash
npm run fonts:link --workspace=mobile
```

(o desde `apps/mobile`: `npm run fonts:link`)

## 3) Recompilar

Desde raiz `v2`:

```bash
npm run build:web
npm run build:admin
```

Para mobile:

```bash
cd apps/mobile
npm run android
# o npm run ios
```

### pnpm no esta en PATH

Desde `v2`, una sola vez (si tu Node incluye Corepack):

```bash
npm run setup:pnpm
```

O manualmente: `corepack enable` y `corepack prepare pnpm@9.15.5 --activate`.

Sin pnpm global, `install:clean` y similares ya usan `npx --yes pnpm@9.15.5` donde hace falta.

## Nota sobre licencias

Las fuentes Cooper suelen tener licencia comercial. Usa archivos licenciados para tu empresa/proyecto.
