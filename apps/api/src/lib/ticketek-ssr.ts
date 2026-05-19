/**
 * Ticketek Argentina: la web es Angular; el HTML con imágenes/meta solo llega con UA de crawler.
 * URLs de evento: https://www.ticketek.com.ar/{show-slug}/{venue-slug}
 */

import type { EventImageSearchInput } from './ticketera-image-providers.js';
import { buildEventSlugCandidates, normalizeAscii, titleMatchesEvent } from './ticketera-image-providers.js';
import { scoreEventPageContext } from './event-location-match.js';

export const TICKETEK_BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const TICKETEK_HOST = 'https://www.ticketek.com.ar';

export function textToSlug(text: string): string {
  return normalizeAscii(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** URLs canónicas tipo /experiencia-queen/auditorio-de-belgrano */
export function buildTicketekEventUrlCandidates(input: EventImageSearchInput): string[] {
  const urls = new Set<string>();
  const eventSlugs = new Set<string>();

  const full = textToSlug(input.eventName);
  if (full.length >= 4) eventSlugs.add(full);

  for (const s of buildEventSlugCandidates(input.eventName, input.eventDate)) {
    if (s.includes('-') || s.length >= 8) eventSlugs.add(s);
  }

  const venueSlugs = new Set<string>();
  const place = (input.eventPlace || '').trim();
  if (place.length >= 3) {
    venueSlugs.add(textToSlug(place));
    const parts = normalizeAscii(place).split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
    if (parts.length >= 2) {
      venueSlugs.add(parts.slice(-2).join('-'));
    }
  }

  for (const es of eventSlugs) {
    for (const vs of venueSlugs) {
      urls.add(`${TICKETEK_HOST}/${es}/${vs}`);
    }
  }

  return [...urls].slice(0, 12);
}

export async function fetchTicketekSsrHtml(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': TICKETEK_BOT_UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-AR,es;q=0.9',
      },
      signal: AbortSignal.timeout(12_000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function normalizeTicketekCmsUrl(raw: string): string {
  let u = raw.trim().replace(/^\/\//, 'https://');
  u = u.replace(/https?:\/\/admin\.ticketek\.com\.ar/i, 'https://prod-cms-static.ticketek.com.ar');
  if (u.startsWith('/')) u = `https://prod-cms-static.ticketek.com.ar${u}`;
  return u;
}

/** og:image y data-image del show-header en HTML SSR. */
export function extractShowHeaderImagesFromHtml(html: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /property="og:image"\s+content="([^"]+)"/gi,
    /data-image="([^"]*show-header[^"]+)"/gi,
    /ng-src="([^"]*show-header[^"]+)"/gi,
    /src="([^"]*show-header[^"]+)"/gi,
    /(https?:\/\/[^"'\s]*show-header\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp))/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      const raw = m[1] || m[0];
      if (!raw || !raw.includes('show-header')) continue;
      found.add(normalizeTicketekCmsUrl(raw));
    }
  }
  return [...found];
}

export function extractCmsSlugFromImageUrl(url: string): string | null {
  const m = url.match(/show-header\/([a-zA-Z0-9_-]+)\./i);
  return m?.[1] ?? null;
}

/** Slug corto tipo "queen" sin sufijo: suele ser otro evento en búsqueda "queen". */
export function isUnsafeBareCmsSlug(slug: string, eventName: string): boolean {
  if (/[0-9]/.test(slug)) return false;
  if (slug.includes('-')) return false;
  const words = normalizeAscii(eventName)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);
  if (words.length < 2) return false;
  const last = words[words.length - 1];
  return slug === last || slug === words.join('');
}

export function scoreTicketekPage(html: string, pageUrl: string, input: EventImageSearchInput): number {
  let score = scoreEventPageContext(html, input);

  const path = pageUrl.replace(TICKETEK_HOST, '').toLowerCase();
  const eventSlug = textToSlug(input.eventName);
  if (eventSlug.length >= 4 && path.includes(eventSlug)) score += 25;

  const venueSlug = input.eventPlace ? textToSlug(input.eventPlace) : '';
  if (venueSlug.length >= 4 && path.includes(venueSlug)) score += 30;

  const titleM = html.match(/<title[^>]*>([^<]+)</i);
  if (titleM && titleMatchesEvent(input.eventName, titleM[1])) score += 15;

  const venueAttr = html.match(/data-venue="([^"]+)"/i);
  if (venueAttr && input.eventPlace) {
    const v = normalizeAscii(venueAttr[1]);
    const p = normalizeAscii(input.eventPlace);
    if (v.includes(p) || p.includes(v)) score += 20;
  }

  return score;
}

export function ticketekPageMatchesEvent(html: string, pageUrl: string, input: EventImageSearchInput): boolean {
  const score = scoreTicketekPage(html, pageUrl, input);
  const path = pageUrl.toLowerCase();
  const needsVenue = Boolean((input.eventPlace || '').trim());
  if (needsVenue) {
    const venueSlug = textToSlug(input.eventPlace!);
    if (venueSlug.length >= 4 && path.includes(venueSlug)) return score >= 20;
  }
  return score >= 18;
}
