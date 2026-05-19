/**
 * Ticketek Argentina: HTML útil solo con UA de crawler.
 * URL: https://www.ticketek.com.ar/{show-slug}/{venue-slug}
 * Ej.: /experiencia-queen/auditorio-de-belgrano
 */

import type { EventImageSearchInput } from './ticketera-image-providers.js';
import { normalizeAscii, titleMatchesEvent } from './ticketera-image-providers.js';
import { scoreEventPageContext } from './event-location-match.js';

export const TICKETEK_BOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const TICKETEK_HOST = 'https://www.ticketek.com.ar';

const SHOW_PREFIX_RE =
  /^(experiencia|tributo|tributo a|homenaje|homenaje a|show|show de|festival|recital)\s+(.+)$/i;

/** Prefijos de venue donde Ticketek suele insertar "de" en el slug. */
const VENUE_DE_PREFIXES = new Set([
  'auditorio',
  'teatro',
  'estadio',
  'hipodromo',
  'centro',
  'sala',
  'club',
  'cine',
  'polideportivo',
]);

export function textToSlug(text: string): string {
  return normalizeAscii(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Slugs de show para URLs Ticketek (sin sufijos de año ni palabras sueltas). */
export function eventToTicketekSlugs(eventName: string): string[] {
  const slugs = new Set<string>();
  const full = textToSlug(eventName);
  if (full.includes('-')) slugs.add(full);

  const prefixMatch = eventName.match(SHOW_PREFIX_RE);
  if (prefixMatch?.[2]) {
    const prefix = normalizeAscii(prefixMatch[1]).replace(/[^a-z0-9]+/g, '-');
    const core = normalizeAscii(prefixMatch[2]).replace(/[^a-z0-9]+/g, '-');
    if (prefix && core) slugs.add(`${prefix}-${core}`);
  }

  return [...slugs];
}

/**
 * Slugs de venue: "Auditorio Belgrano" → auditorio-belgrano y auditorio-de-belgrano.
 * "Auditorio de Belgrano" → auditorio-de-belgrano.
 */
export function venueToTicketekSlugs(place: string): string[] {
  const slugs = new Set<string>();
  const trimmed = place.trim();
  if (!trimmed) return [];

  const full = textToSlug(trimmed);
  if (full) slugs.add(full);

  const words = normalizeAscii(trimmed)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  if (words.length >= 2) {
    const hasDe = words.includes('de');
    const withoutDe = words.filter((w) => w !== 'de');
    if (withoutDe.length >= 2) {
      slugs.add(withoutDe.join('-'));
      const first = withoutDe[0];
      const rest = withoutDe.slice(1);
      if (VENUE_DE_PREFIXES.has(first) && !hasDe && rest.length) {
        slugs.add(`${first}-de-${rest.join('-')}`);
      }
    }
  }

  return [...slugs];
}

function rankTicketekPair(eventSlug: string, venueSlug: string, input: EventImageSearchInput): number {
  let rank = 0;
  if (eventSlug.includes('-')) rank += 40;
  if (venueSlug.includes('-de-')) rank += 35;
  if (venueSlug.split('-').length >= 3) rank += 15;
  if (eventSlug === textToSlug(input.eventName)) rank += 20;
  const primaryVenue = venueToTicketekSlugs(input.eventPlace || '')[0];
  if (primaryVenue && venueSlug === primaryVenue) rank += 10;
  return rank;
}

/** Hasta 5 URLs, la más probable primero (experiencia-queen/auditorio-de-belgrano). */
export function buildTicketekEventUrlCandidates(input: EventImageSearchInput): string[] {
  const eventSlugs = eventToTicketekSlugs(input.eventName);
  const venueSlugs = venueToTicketekSlugs(input.eventPlace || '');
  if (!eventSlugs.length || !venueSlugs.length) return [];

  const pairs: { url: string; rank: number }[] = [];
  for (const es of eventSlugs) {
    for (const vs of venueSlugs) {
      pairs.push({
        url: `${TICKETEK_HOST}/${es}/${vs}`,
        rank: rankTicketekPair(es, vs, input),
      });
    }
  }

  pairs.sort((a, b) => b.rank - a.rank);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of pairs) {
    if (seen.has(p.url)) continue;
    seen.add(p.url);
    out.push(p.url);
    if (out.length >= 5) break;
  }
  return out;
}

export type TicketekFetchResult = { html: string; status: number } | null;

export async function fetchTicketekSsrHtml(pageUrl: string): Promise<TicketekFetchResult> {
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': TICKETEK_BOT_UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-AR,es;q=0.9',
        Referer: `${TICKETEK_HOST}/`,
      },
      signal: AbortSignal.timeout(9_000),
      redirect: 'follow',
    });
    const status = res.status;
    if (!res.ok) {
      return { html: '', status };
    }
    const html = await res.text();
    if (html.length < 2000 || !/show-header|og:image|tkt-show-header/i.test(html)) {
      return { html: '', status };
    }
    return { html, status };
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

function pathIncludesSlug(pathname: string, slug: string): boolean {
  const p = pathname.toLowerCase();
  const s = slug.toLowerCase();
  return p.includes(`/${s}/`) || p.endsWith(`/${s}`) || p === `/${s}`;
}

export function ticketekPageMatchesEvent(html: string, pageUrl: string, input: EventImageSearchInput): boolean {
  let pathname: string;
  try {
    pathname = new URL(pageUrl).pathname;
  } catch {
    return false;
  }

  const eventSlugs = eventToTicketekSlugs(input.eventName);
  if (!eventSlugs.some((es) => pathIncludesSlug(pathname, es))) return false;

  const place = (input.eventPlace || '').trim();
  if (place) {
    const venueSlugs = venueToTicketekSlugs(place);
    if (!venueSlugs.some((vs) => pathIncludesSlug(pathname, vs))) return false;
  }

  if (!extractShowHeaderImagesFromHtml(html).length) return false;

  const titleM = html.match(/<title[^>]*>([^<]+)</i);
  if (titleM && !titleMatchesEvent(input.eventName, titleM[1])) return false;

  return scoreEventPageContext(html, input) >= 8;
}

export function scoreTicketekPage(html: string, pageUrl: string, input: EventImageSearchInput): number {
  let score = scoreEventPageContext(html, input);
  let pathname: string;
  try {
    pathname = new URL(pageUrl).pathname;
  } catch {
    return score;
  }
  for (const es of eventToTicketekSlugs(input.eventName)) {
    if (pathIncludesSlug(pathname, es)) score += 25;
  }
  for (const vs of venueToTicketekSlugs(input.eventPlace || '')) {
    if (pathIncludesSlug(pathname, vs)) score += vs.includes('-de-') ? 35 : 15;
  }
  return score;
}
