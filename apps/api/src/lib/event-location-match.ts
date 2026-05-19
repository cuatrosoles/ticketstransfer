/**
 * Coincidencia de lugar/fecha para imágenes de evento (evitar posters de otra ciudad o fecha).
 */

import { normalizeAscii, titleMatchesEvent, type EventImageSearchInput } from './ticketera-image-providers.js';

const LOCATION_STOPWORDS = new Set([
  'calle',
  'avenida',
  'av',
  'av.',
  'pasaje',
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'y',
  'nro',
  'numero',
  'n',
  'piso',
  'dto',
  'departamento',
  'provincia',
  'argentina',
  'buenos',
  'aires',
  'cp',
]);

export function buildEventSearchQuery(input: EventImageSearchInput): string {
  return [input.eventName, input.eventPlace, input.eventCity, input.eventAddress]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' ');
}

export function getLocationTokens(input: EventImageSearchInput): string[] {
  const raw = [input.eventCity, input.eventPlace, input.eventAddress].filter(Boolean) as string[];
  const tokens = new Set<string>();
  for (const part of raw) {
    const norm = normalizeAscii(part);
    for (const w of norm.split(/[^a-z0-9]+/)) {
      if (w.length >= 3 && !LOCATION_STOPWORDS.has(w)) tokens.add(w);
    }
    if (norm.length >= 4) {
      const compact = norm.replace(/[^a-z0-9]+/g, '');
      if (compact.length >= 5) tokens.add(compact);
    }
  }
  return [...tokens].sort((a, b) => b.length - a.length);
}

export function extractDayMonth(eventDate: string): { day?: string; month?: string; year?: string } {
  const iso = eventDate.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) {
    return { year: iso[1], month: String(Number(iso[2])), day: String(Number(iso[3])) };
  }
  const dmy = eventDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})/);
  if (dmy) {
    return { day: String(Number(dmy[1])), month: String(Number(dmy[2])), year: dmy[3] };
  }
  return {};
}

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Puntaje de coincidencia lugar + fecha + nombre en HTML o texto. */
export function scoreEventPageContext(text: string, input: EventImageSearchInput): number {
  const norm = normalizeAscii(text);
  let score = 0;

  const locTokens = getLocationTokens(input);
  let locHits = 0;
  for (const t of locTokens) {
    if (norm.includes(t)) {
      locHits += 1;
      score += Math.min(12, t.length);
    }
  }

  const city = normalizeAscii(input.eventCity || '');
  if (city.length >= 3 && norm.includes(city.replace(/[^a-z0-9]+/g, ''))) {
    score += 18;
  }

  const { day, month, year } = extractDayMonth(input.eventDate);
  if (day && month) {
    const patterns = [
      `${day}/${month}`,
      `${day}-${month}`,
      `${day} de ${MONTH_NAMES[Number(month) - 1] || ''}`,
    ].filter(Boolean);
    for (const p of patterns) {
      if (norm.includes(normalizeAscii(p))) score += 14;
    }
    if (year && norm.includes(year)) score += 4;
  }

  if (titleMatchesEvent(input.eventName, text.slice(0, 8000))) score += 10;

  if (locHits >= 2) score += 8;
  else if (locHits === 1 && (input.eventCity || '').length >= 4) score += 4;

  return score;
}

/** Umbral mínimo cuando hay ciudad (evita posters de otra sede). */
export function passesLocationGate(score: number, input: EventImageSearchInput): boolean {
  const hasCity = Boolean((input.eventCity || '').trim());
  const hasVenue = Boolean((input.eventPlace || '').trim() || (input.eventAddress || '').trim());
  if (!hasCity && !hasVenue) return score >= 6;
  if (hasCity) return score >= 16;
  return score >= 12;
}

export function hasStrictLocationInput(input: EventImageSearchInput): boolean {
  return Boolean((input.eventCity || '').trim() && (input.eventAddress || '').trim());
}
