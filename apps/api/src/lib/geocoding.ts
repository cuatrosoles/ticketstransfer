/**
 * Geocodificación con Nominatim (OpenStreetMap).
 * Uso en servidor al crear/editar eventos sin coordenadas GPS.
 * Política: https://operations.osmfoundation.org/policies/nominatim/
 */

import type { LocationSource } from '@tickets-transfer/shared';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'TicketsTransfer/2.0 (geocoding; contacto@soporte-ticketstransfer)';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
  source: LocationSource;
};

function buildQuery(parts: (string | null | undefined)[]): string {
  return parts
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
    .join(', ');
}

/**
 * Geocodifica una dirección textual (Argentina por defecto si hay ciudad AR).
 */
export async function geocodeAddress(params: {
  address?: string | null;
  city?: string | null;
  place?: string | null;
  country?: string | null;
}): Promise<GeocodeResult | null> {
  const q = buildQuery([
    params.place,
    params.address,
    params.city,
    params.country || 'Argentina',
  ]);
  if (q.length < 5) return null;

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '0');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn('[geocoding] Nominatim status', res.status);
      return null;
    }
    const data = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
    const first = data?.[0];
    if (!first?.lat || !first?.lon) return null;
    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return {
      latitude,
      longitude,
      displayName: first.display_name || q,
      source: 'geocode',
    };
  } catch (e) {
    console.warn('[geocoding] Error:', e instanceof Error ? e.message : e);
    return null;
  }
}
