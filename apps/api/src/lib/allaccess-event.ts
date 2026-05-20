/**
 * All Access (Crowder / Boletius): URLs de evento e imágenes oficiales.
 * Los posters suelen estar en cdn.getcrowder.com (og:image en /event/{slug}).
 */

import {
  buildEventSlugCandidates,
  normalizeAscii,
  scoreImageUrlForEvent,
  titleMatchesEvent,
  type EventImageSearchInput,
} from './ticketera-image-providers.js';
import { passesLocationGate, scoreEventPageContext } from './event-location-match.js';

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'es-AR,es;q=0.9',
};

export const ALLACCESS_IMAGE_RE =
  /https:\/\/[^"'\s]*(?:getcrowder\.com|boletius\.com|allaccess|cloudfront|amazonaws)[^"'\s]*\/[^"'\s]+\.(?:png|jpe?g|webp)(?:\?[^"'\s]*)?/gi;

export async function fetchAllAccessHtml(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function buildAllAccessEventUrlCandidates(input: EventImageSearchInput): string[] {
  const urls = new Set<string>();
  const primary = normalizeAscii(input.eventName).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (primary.length >= 3) {
    urls.add(`https://www.allaccess.com.ar/event/${encodeURIComponent(primary)}`);
  }
  for (const slug of buildEventSlugCandidates(input.eventName, input.eventDate)) {
    if (slug.length >= 3 && slug.length <= 80) {
      urls.add(`https://www.allaccess.com.ar/event/${encodeURIComponent(slug)}`);
    }
  }
  return [...urls].slice(0, 14);
}

export function extractAllAccessEventLinks(html: string): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/href="(https?:\/\/[^"]*allaccess[^"]+)"/gi)) {
    const href = m[1].split('#')[0];
    if (/\/(?:event|evento|venue)\//i.test(href)) links.add(href);
  }
  for (const m of html.matchAll(/href="(\/(?:event|evento)\/[^"?#]+)"/gi)) {
    links.add(`https://www.allaccess.com.ar${m[1].split('#')[0]}`);
  }
  return [...links].slice(0, 14);
}

function extractOgImage(html: string): string | null {
  const m =
    html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return m?.[1]?.trim() || null;
}

/** Posters en `<img src="...getcrowder...">` en orden del HTML. */
function extractCrowderContentImagesOrdered(html: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(
    /<img[^>]+src=['"](https:\/\/cdn\.getcrowder\.com\/images\/[^'"]+)['"]/gi
  )) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      urls.push(m[1]);
    }
  }
  return urls;
}

/** Flyer cuadrado del evento: suele ser el último pdr640x640 tras el banner pdr1920x720. */
function pickPrimaryCrowderPoster(ordered: string[]): string | null {
  const clean = ordered.filter((u) => !isAllAccessNoiseImage(u));
  const square = clean.filter((u) => /pdr640x640/i.test(u));
  if (square.length) return square[square.length - 1];
  const wide = clean.filter((u) => /pdr1920x720/i.test(u));
  if (wide.length) return wide[0];
  return clean[clean.length - 1] ?? null;
}

export function isAllAccessNoiseImage(url: string): boolean {
  const u = url.toLowerCase();
  if (u.includes('favicon')) return true;
  if (u.includes('allaccess-black') || u.includes('allaccess-clear') || u.includes('allaccess_logo')) {
    return true;
  }
  if (u.includes('null-ns') || u.includes('null-gradient')) return true;
  if (u.includes('logo_web') || u.includes('logoflow')) return true;
  if (u.includes('-arhiv-b.png')) return true;
  if (u.includes('/shop/allaccess/')) return true;
  return false;
}

export function scoreAllAccessImageUrl(url: string, eventName: string): number {
  if (isAllAccessNoiseImage(url)) return -100;
  let score = scoreImageUrlForEvent(url, eventName);
  const u = url.toLowerCase();
  if (u.includes('getcrowder.com/images/')) score += 22;
  if (u.includes('pdr640x640')) score += 18;
  if (u.includes('pdr1280x960')) score += 14;
  if (u.includes('pdr1920x720')) score += 10;
  return score;
}

export function pickBestAllAccessImageFromHtml(
  html: string,
  input: EventImageSearchInput
): string | null {
  const contentOrdered = extractCrowderContentImagesOrdered(html);
  const primary = pickPrimaryCrowderPoster(contentOrdered);
  if (primary) return primary;

  const ranked: { url: string; score: number }[] = [];
  const contentSet = new Set(contentOrdered);

  for (const m of html.matchAll(ALLACCESS_IMAGE_RE)) {
    const url = m[0];
    if (contentSet.has(url)) continue;
    const score = scoreAllAccessImageUrl(url, input.eventName);
    if (score > 0) ranked.push({ url, score });
  }

  const og = extractOgImage(html);
  if (og && !isAllAccessNoiseImage(og) && !contentSet.has(og)) {
    ranked.push({ url: og, score: scoreAllAccessImageUrl(og, input.eventName) + 12 });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.url ?? null;
}

/** Página de evento All Access (no listado de venue genérico). */
export function allAccessEventPageMatches(html: string, pageUrl: string, input: EventImageSearchInput): boolean {
  const isVenue = /\/venue\//i.test(pageUrl);
  const isEvent = /\/event(?:\/|$)/i.test(pageUrl) || /\/evento\//i.test(pageUrl);

  if (isVenue) {
    return (
      titleMatchesEvent(input.eventName, html.slice(0, 14_000)) &&
      passesLocationGate(scoreEventPageContext(html, input), input)
    );
  }

  if (isEvent) {
    const score = scoreEventPageContext(html, input);
    if (titleMatchesEvent(input.eventName, html.slice(0, 10_000))) return true;
    return score >= 18 && normalizeAscii(html).includes(normalizeAscii(input.eventName).slice(0, 12));
  }

  return passesLocationGate(scoreEventPageContext(html, input), input);
}
