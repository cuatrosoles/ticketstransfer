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

export type ReverseGeocodeAddress = {
  latitude: number;
  longitude: number;
  displayName: string;
  province: string | null;
  city: string | null;
  postalCode: string | null;
  street: string | null;
  houseNumber: string | null;
};

type NominatimAddress = {
  state?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  municipality?: string;
  postcode?: string;
  road?: string;
  house_number?: string;
};

/** Geocodificación inversa (coordenadas → dirección aproximada). */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeAddress | null> {
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lon', String(longitude));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn('[geocoding] reverse status', res.status);
      return null;
    }
    const data = (await res.json()) as {
      display_name?: string;
      address?: NominatimAddress;
    };
    const addr = data.address ?? {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.municipality ||
      null;

    return {
      latitude,
      longitude,
      displayName: data.display_name || `${latitude}, ${longitude}`,
      province: addr.state ?? null,
      city,
      postalCode: addr.postcode ?? null,
      street: addr.road ?? null,
      houseNumber: addr.house_number ?? null,
    };
  } catch (e) {
    console.warn('[geocoding] reverse error:', e instanceof Error ? e.message : e);
    return null;
  }
}
