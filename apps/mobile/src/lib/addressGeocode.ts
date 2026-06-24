/**
 * Geocodificación inversa vía API + mapeo a provincias/ciudades AR.
 */

import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { api } from './api';
import type { ReverseGeocodeResult } from './geolocation';

export type AddressFromGps = {
  latitude: number;
  longitude: number;
  province: string;
  city: string;
  postalCode: string;
  direccion: string;
  numero: string;
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function mapProvinceIdFromGeocode(stateName: string | null | undefined): string {
  if (!stateName) return '';
  const norm = normalizeText(stateName);
  if (norm.includes('ciudad autonoma') || norm === 'caba' || norm.includes('capital federal')) {
    return 'CABA';
  }
  const byId = PROVINCIAS_ARGENTINA.find((p) => normalizeText(p.id) === norm);
  if (byId) return byId.id;
  const byName = PROVINCIAS_ARGENTINA.find(
    (p) => normalizeText(p.nombre) === norm || norm.includes(normalizeText(p.nombre))
  );
  if (byName) return byName.id;
  const partial = PROVINCIAS_ARGENTINA.find((p) => norm.includes(normalizeText(p.id)));
  return partial?.id ?? '';
}

export function matchCityForProvince(provinceId: string, cityName: string | null | undefined): string {
  if (!cityName) return '';
  const list = CIUDADES_POR_PROVINCIA[provinceId] ?? [];
  const norm = normalizeText(cityName);
  const exact = list.find((c) => normalizeText(c) === norm);
  if (exact) return exact;
  const partial = list.find(
    (c) => normalizeText(c).includes(norm) || norm.includes(normalizeText(c))
  );
  return partial ?? cityName.trim();
}

export async function reverseGeocodeFromApi(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  const q = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
  });
  return api<ReverseGeocodeResult>(`/api/geocode/reverse?${q.toString()}`, { token: null });
}

/** Etiqueta legible para provincia guardada (id o nombre). */
export function provinceDisplayLabel(idOrName: string | null | undefined): string {
  if (!idOrName) return '—';
  const found = PROVINCIAS_ARGENTINA.find(
    (p) => p.id === idOrName || p.nombre === idOrName
  );
  return found?.nombre ?? idOrName;
}

export function addressFieldsFromReverseGeocode(data: ReverseGeocodeResult): AddressFromGps {
  const province = mapProvinceIdFromGeocode(data.province);
  const city = matchCityForProvince(province, data.city);
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    province,
    city,
    postalCode: data.postalCode?.trim() ?? '',
    direccion: data.street?.trim() ?? '',
    numero: data.houseNumber?.trim() ?? '',
  };
}
