/**
 * Utilidades de geolocalización – Tickets Transfer
 * Cálculo de distancias (Haversine), validación y formato para UI.
 */
import { z } from 'zod';
/** Fallback si la API no devuelve configuración de plataforma. */
export declare const DEFAULT_NEARBY_RADIUS_KM = 100;
/** Tope para consultas `?radiusKm=` y para el valor configurable en admin. */
export declare const MAX_NEARBY_RADIUS_KM = 500;
export declare const latitudeSchema: z.ZodNumber;
export declare const longitudeSchema: z.ZodNumber;
export declare const geoCoordinatesSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
}, {
    latitude: number;
    longitude: number;
}>;
export type GeoCoordinates = z.infer<typeof geoCoordinatesSchema>;
export declare const locationSourceSchema: z.ZodEnum<["gps", "manual", "geocode"]>;
export type LocationSource = z.infer<typeof locationSourceSchema>;
/** Actualización de ubicación del usuario (perfil o registro). */
export declare const userLocationUpdateSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    locationSource: z.ZodOptional<z.ZodEnum<["gps", "manual", "geocode"]>>;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
}, {
    latitude: number;
    longitude: number;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
}>;
/** Coordenadas opcionales en registro o publicación (no rompe clientes sin GPS). */
export declare const optionalGeoCoordinatesSchema: z.ZodEffects<z.ZodObject<{
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    locationSource: z.ZodOptional<z.ZodEnum<["gps", "manual", "geocode"]>>;
}, "strip", z.ZodTypeAny, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
}, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
}>, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
}, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    locationSource?: "gps" | "manual" | "geocode" | undefined;
}>;
/** Query para eventos cercanos. */
export declare const nearbyEventsQuerySchema: z.ZodObject<{
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    radiusKm: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    radiusKm: number;
    latitude?: number | undefined;
    longitude?: number | undefined;
}, {
    latitude?: number | undefined;
    longitude?: number | undefined;
    radiusKm?: number | undefined;
}>;
export type ItemWithEventCoords = {
    id?: string;
    eventLatitude?: number | null;
    eventLongitude?: number | null;
};
export type ItemWithDistance = ItemWithEventCoords & {
    distanceKm: number | null;
};
/**
 * Distancia en km entre dos puntos (fórmula de Haversine).
 */
export declare function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number;
export declare function hasValidCoordinates(lat: unknown, lng: unknown): boolean;
/** Distancia desde un origen; null si el destino no tiene coordenadas. */
export declare function distanceKmFrom(originLat: number, originLng: number, item: ItemWithEventCoords): number | null;
/**
 * Filtra items con coordenadas dentro del radio y ordena por distancia ascendente.
 */
export declare function filterAndSortByDistance<T extends ItemWithEventCoords>(items: T[], originLat: number, originLng: number, radiusKm: number): (T & {
    distanceKm: number;
})[];
/** Texto legible para distancia (ej. "12,5 km", "850 m"). */
export declare function formatDistanceKm(km: number | null | undefined): string;
/** Enlace a mapa (OpenStreetMap) para admin o detalle. */
export declare function mapsUrlForCoordinates(lat: number, lng: number): string;
/** Coordenadas para mostrar en tablas (6 decimales ≈ precisión ~10 cm). */
export declare function formatCoordinates(lat: number, lng: number): string;
