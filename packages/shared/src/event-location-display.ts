/** Texto de ubicación para listados (recinto, ciudad). */
export function formatEventLocationDisplay(item: {
  eventPlace?: string | null;
  eventAddress?: string | null;
  eventCity?: string | null;
}): string {
  const venue = item.eventPlace?.trim();
  const city = item.eventCity?.trim();
  const address = item.eventAddress?.trim();
  if (venue && city) return `${venue}, ${city}`;
  if (venue) return venue;
  if (city && address) return `${address}, ${city}`;
  return city || address || '—';
}
