import { formatDistanceKm } from './geo.js';

/** Texto de ubicación para listados (recinto, ciudad). */
export function formatEventLocationDisplay(item: {
  eventPlace?: string | null;
  eventAddress?: string | null;
  eventCity?: string | null;
  distanceKm?: number | null;
}): string {
  const venue = item.eventPlace?.trim();
  const city = item.eventCity?.trim();
  const address = item.eventAddress?.trim();
  let base = '—';
  if (venue && city) base = `${venue}, ${city}`;
  else if (venue) base = venue;
  else if (city && address) base = `${address}, ${city}`;
  else base = city || address || '—';

  const dist = formatDistanceKm(item.distanceKm ?? null);
  if (dist) return `${base} · ${dist}`;
  return base;
}
