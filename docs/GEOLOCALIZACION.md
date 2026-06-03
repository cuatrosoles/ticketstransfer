# Geolocalización de usuarios y eventos – Tickets Transfer v2

Documentación del sistema de geolocalización implementado en el monorepo `v2/` (API, app móvil, web y panel admin).

## Objetivo

- Guardar la **ubicación del usuario** para personalizar el marketplace.
- Guardar la **ubicación del evento/recinto** en cada publicación de ticket.
- Ofrecer el filtro **“eventos cercanos”** según distancia (Haversine).
- Mantener compatibilidad con datos existentes (campos de texto `city`, `eventCity`, etc.).

## Modelo de datos (Firestore)

### Colección `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `latitude` | number \| null | Latitud WGS84 |
| `longitude` | number \| null | Longitud WGS84 |
| `locationSource` | `'gps' \| 'manual' \| 'geocode' \| null` | Origen de la coordenada |
| `locationUpdatedAt` | Timestamp \| null | Última actualización GPS |

Los campos de texto (`city`, `province`, `postalCode`, `address`) se mantienen sin cambios.

### Colección `ticketListings`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `eventLatitude` | number \| null | Latitud del recinto |
| `eventLongitude` | number \| null | Longitud del recinto |
| `eventLocationSource` | string \| null | `gps`, `manual` o `geocode` |
| `eventGeocodedAt` | Timestamp \| null | Si se obtuvo por Nominatim |

`eventAddress`, `eventCity` y `eventPlace` siguen siendo obligatorios en formularios nuevos.

## Paquete compartido (`@tickets-transfer/shared`)

- `packages/shared/src/geo.ts`: Haversine, filtros, formato de distancia, URLs de mapa.
- Schemas Zod en `schemas.ts`: registro, creación/edición de tickets, query de cercanía.

Tras modificar shared:

```bash
cd v2/packages/shared && pnpm build
```

## API REST

### Usuario

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Acepta `latitude`, `longitude`, `locationSource` opcionales |
| GET | `/api/auth/me` | Sí | Devuelve coordenadas si existen |
| GET | `/api/users/profile` | Sí | Idem |
| PUT | `/api/users/location` | Sí | Actualiza GPS (`userLocationUpdateSchema`) |
| PATCH | `/api/users/profile` | Sí | También acepta `latitude` / `longitude` |

### Tickets / marketplace

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/tickets` | Sí | Guarda coords o geocodifica dirección |
| PATCH | `/api/tickets/mine/:id` | Sí | Recalcula coords si cambia ubicación |
| GET | `/api/tickets/marketplace/nearby` | Sí | Listado filtrado por radio (`radiusKm`; default desde admin, 100 km) |
| GET | `/api/tickets/marketplace/recommended` | Sí | Incluye sección `nearby` si el usuario tiene GPS |

**Query `GET /api/tickets/marketplace/nearby`**

- `latitude`, `longitude` (opcionales): si no se envían, se usan las del perfil.
- `radiusKm` (opcional, 1–500; si no se envía, usa `marketplaceNearbyRadiusKm` de **Configuración → General** en admin, default **100**).

Respuesta:

```json
{
  "radiusKm": 50,
  "origin": { "latitude": -34.6, "longitude": -58.4 },
  "total": 3,
  "items": [{ "id": "...", "distanceKm": 12.4, "eventName": "..." }]
}
```

Código de error si falta ubicación: `LOCATION_REQUIRED`.

### Geocodificación en servidor

- `apps/api/src/lib/geocoding.ts`: Nominatim (OpenStreetMap), sin API key.
- `apps/api/src/lib/listing-geo.ts`: si no hay GPS en el formulario, geocodifica `eventPlace` + `eventAddress` + `eventCity`.

## App móvil (React Native 0.73)

### Dependencia

```bash
cd v2/apps/mobile
pnpm add @react-native-community/geolocation@^3.2.1
```

### Permisos

- **Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` en `AndroidManifest.xml`.
- **iOS**: `NSLocationWhenInUseUsageDescription` en `Info.plist`.

### Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/lib/geolocation.ts` | Lectura GPS + permisos Android |
| `src/components/LocationCaptureButton.tsx` | Botón reutilizable |
| `src/screens/RegisterScreen.tsx` | Ubicación opcional al registrarse |
| `src/screens/PublishTicketScreen.tsx` | GPS del recinto al publicar |
| `src/screens/HomeScreen.tsx` | Sección “Cerca de vos” |
| `src/screens/TiendaScreen.tsx` | Filtro “Cercanos (50 km)” |

### Flujo recomendado para el usuario

1. En registro o Tienda, pulsar **“Usar mi ubicación actual”**.
2. En publicar ticket, opcionalmente **“Ubicar recinto con GPS”** o dejar que la API geocodifique la dirección.
3. En Tienda, activar **“Cercanos”** para ver solo eventos con coordenadas dentro del radio.

## Configuración admin (radio cercanos)

En **Admin → Configuración → General**:

- Campo **“Radio eventos cercanos (km)”** → Firestore `platformSettings/main.marketplaceNearbyRadiusKm` (1–500, default **100**).
- Expuesto en `GET /api/settings/branding` como `marketplaceNearbyRadiusKm` para app/web.

## Panel administrativo

- **Usuario** (`UserDetail`): coordenadas, fuente y **mapa embebido** (OpenStreetMap).
- **Ticket** (`TicketDetail`): dirección, ciudad, coordenadas y **mapa embebido** del evento.
- Edición admin: `PATCH /api/admin/users/:id` y `PATCH /api/admin/tickets/:id` aceptan campos geo.

## Web (`apps/web`)

- **Registro** (`Register.tsx`): botón “Usar mi ubicación actual” (Geolocation API del navegador).
- **Publicar** (`Publicar.tsx`): GPS del recinto opcional.

## Compatibilidad

- Publicaciones y usuarios **sin coordenadas** siguen funcionando.
- El filtro cercano **solo incluye** listings con `eventLatitude` y `eventLongitude` válidos.
- `formatEventLocationDisplay` muestra distancia cuando `distanceKm` está presente (ej. `Recinto, CABA · 12,5 km`).

## Pruebas manuales sugeridas

1. Registrar usuario con GPS → verificar en Firestore `users/{uid}`.
2. Publicar ticket con dirección sin GPS → verificar geocodificación en `ticketListings`.
3. `GET /api/tickets/marketplace/nearby` con token → listado ordenado por distancia.
4. Admin: abrir detalle de usuario y ticket → ver coordenadas y enlace al mapa.

## Fecha de implementación

21/05/2026 – requerimiento de geolocalización de usuarios y eventos para filtro de eventos cercanos.
