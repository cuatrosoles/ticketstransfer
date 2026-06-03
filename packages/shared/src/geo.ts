/**
 * Utilidades de geolocalización – Tickets Transfer
 * Cálculo de distancias (Haversine), validación y formato para UI.
 */

import { z } from 'zod';

/** Fallback si la API no devuelve configuración de plataforma. */
export const DEFAULT_NEARBY_RADIUS_KM = 100;
/** Tope para consultas `?radiusKm=` y para el valor configurable en admin. */
export const MAX_NEARBY_RADIUS_KM = 500;

export const latitudeSchema = z.number().min(-90, 'Latitud inválida').max(90, 'Latitud inválida');
export const longitudeSchema = z.number().min(-180, 'Longitud inválida').max(180, 'Longitud inválida');

export const geoCoordinatesSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export type GeoCoordinates = z.infer<typeof geoCoordinatesSchema>;

export const locationSourceSchema = z.enum(['gps', 'manual', 'geocode']);
export type LocationSource = z.infer<typeof locationSourceSchema>;

/** Actualización de ubicación del usuario (perfil o registro). */
export const userLocationUpdateSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  locationSource: locationSourceSchema.optional(),
});

/** Coordenadas opcionales en registro o publicación (no rompe clientes sin GPS). */
export const optionalGeoCoordinatesSchema = z
  .object({
    latitude: latitudeSchema.optional(),
    longitude: longitudeSchema.optional(),
    locationSource: locationSourceSchema.optional(),
  })
  .refine(
    (d) => {
      const hasLat = d.latitude != null;
      const hasLng = d.longitude != null;
      return hasLat === hasLng;
    },
    { message: 'Indicá latitud y longitud juntas, o ninguna' }
  );

/** Query para eventos cercanos. */
export const nearbyEventsQuerySchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  radiusKm: z.coerce
    .number()
    .min(1, 'Radio mínimo 1 km')
    .max(MAX_NEARBY_RADIUS_KM, `Radio máximo ${MAX_NEARBY_RADIUS_KM} km`)
    .default(DEFAULT_NEARBY_RADIUS_KM),
});

export type ItemWithEventCoords = {
  id?: string;
  eventLatitude?: number | null;
  eventLongitude?: number | null;
};

export type ItemWithDistance = ItemWithEventCoords & { distanceKm: number | null };

/** Convierte grados a radianes. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Distancia en km entre dos puntos (fórmula de Haversine).
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function hasValidCoordinates(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function asValidCoordinates(
  lat: unknown,
  lng: unknown
): { latitude: number; longitude: number } | null {
  if (!hasValidCoordinates(lat, lng)) return null;
  return { latitude: lat as number, longitude: lng as number };
}

/** Distancia desde un origen; null si el destino no tiene coordenadas. */
export function distanceKmFrom(
  originLat: number,
  originLng: number,
  item: ItemWithEventCoords
): number | null {
  const coords = asValidCoordinates(item.eventLatitude, item.eventLongitude);
  if (!coords) return null;
  return haversineDistanceKm(
    originLat,
    originLng,
    coords.latitude,
    coords.longitude
  );
}

/**
 * Filtra items con coordenadas dentro del radio y ordena por distancia ascendente.
 */
export function filterAndSortByDistance<T extends ItemWithEventCoords>(
  items: T[],
  originLat: number,
  originLng: number,
  radiusKm: number
): (T & { distanceKm: number })[] {
  const withDistance: (T & { distanceKm: number })[] = [];
  for (const item of items) {
    const d = distanceKmFrom(originLat, originLng, item);
    if (d != null && d <= radiusKm) {
      withDistance.push({ ...item, distanceKm: Math.round(d * 10) / 10 });
    }
  }
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  return withDistance;
}

/** Texto legible para distancia (ej. "12,5 km", "850 m"). */
export function formatDistanceKm(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}

/** Enlace a mapa (OpenStreetMap) para admin o detalle. */
export function mapsUrlForCoordinates(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
}

/** Coordenadas para mostrar en tablas (6 decimales ≈ precisión ~10 cm). */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
