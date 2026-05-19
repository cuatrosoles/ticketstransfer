/**
 * Proveedores de imágenes oficiales por ticketera (Argentina).
 * Prioriza páginas del evento que coincidan en nombre, ciudad, dirección y fecha.
 */

import {
  buildEventSearchQuery,
  passesLocationGate,
  scoreEventPageContext,
} from './event-location-match.js';
import {
  buildTicketekEventUrlCandidates,
  extractCmsSlugFromImageUrl,
  extractShowHeaderImagesFromHtml,
  fetchTicketekSsrHtml,
  isUnsafeBareCmsSlug,
  normalizeTicketekCmsUrl,
  scoreTicketekPage,
  ticketekPageMatchesEvent,
} from './ticketek-ssr.js';

export type EventImageSearchInput = {
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  eventAddress?: string | null;
  eventCity?: string | null;
  category?: string | null;
  ticketera?: string | null;
};

export type CmsProbeResult = { ok: true; buffer: Buffer } | { ok: false; reason: string };

export type DownloadImageFn = (url: string, timeoutMs?: number) => Promise<CmsProbeResult>;

export type TicketeraImageProvider = {
  id: string;
  ticketeraIds: string[];
  findImageUrl: (
    input: EventImageSearchInput,
    deps: { download: DownloadImageFn; log: (msg: string, data?: Record<string, unknown>) => void }
  ) => Promise<string | null>;
};

const SHOW_PREFIX_RE =
  /^(experiencia|tributo|tributo a|homenaje|homenaje a|show|show de|festival|recital)\s+(.+)$/i;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'es-AR,es;q=0.9',
};

export function normalizeAscii(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function buildEventSlugCandidates(eventName: string, eventDate: string): string[] {
  const slugs = new Set<string>();
  const norm = normalizeAscii(eventName);
  const words = norm.split(/[^a-z0-9]+/).filter((w) => w.length >= 2);

  if (words.length) {
    slugs.add(words.join('-'));
    slugs.add(words.join(''));
  }

  const prefixMatch = eventName.match(SHOW_PREFIX_RE);
  if (prefixMatch?.[2]) {
    const core = normalizeAscii(prefixMatch[2]).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (core) {
      slugs.add(core);
      slugs.add(core.replace(/-/g, ''));
      const prefixSlug = normalizeAscii(prefixMatch[1]).replace(/[^a-z0-9]+/g, '-');
      if (prefixSlug) slugs.add(`${prefixSlug}-${core}`);
    }
  }

  for (const w of words) {
    if (w.length >= 3) slugs.add(w);
  }

  const numericSuffixes = dateAndHashSuffixes(eventName, eventDate);
  const bases = [...slugs].filter((s) => s.length >= 3 && s.length <= 28);
  for (const base of bases) {
    for (const num of numericSuffixes) {
      slugs.add(`${base}${num}`);
    }
  }

  return [...slugs].slice(0, 36);
}

function dateAndHashSuffixes(eventName: string, eventDate: string): string[] {
  const nums = new Set<string>();
  const iso = eventDate.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) {
    nums.add(iso[1]);
    nums.add(iso[2] + iso[3]);
    nums.add(iso[3] + iso[2]);
    nums.add(iso[2]);
    nums.add(iso[3]);
  }
  const year = eventDate.match(/(20\d{2})/);
  if (year) nums.add(year[1]);
  for (const p of eventDate.match(/\d+/g) || []) {
    if (p.length >= 2 && p.length <= 4) nums.add(p);
  }
  const h = [...normalizeAscii(eventName)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  nums.add(String((h % 900) + 100));
  nums.add(String(h % 1000).padStart(3, '0'));
  return [...nums].slice(0, 10);
}

export function scoreImageUrlForEvent(url: string, eventName: string): number {
  const file = url.split('/').pop()?.replace(/\.[a-z]+$/i, '') || '';
  const fileNorm = normalizeAscii(file);
  const words = normalizeAscii(eventName)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);
  let score = 0;
  for (const w of words) {
    if (fileNorm.includes(w)) score += w.length;
  }
  return score;
}

type PageImageCandidate = { url: string; pageScore: number; imageScore: number };

async function fetchHtml(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Extrae URLs de imágenes de ticketera solo de páginas que coinciden en lugar/fecha. */
async function scrapeMatchedEventPages(
  pageUrls: string[],
  imageUrlPattern: RegExp,
  input: EventImageSearchInput,
  log: (msg: string, data?: Record<string, unknown>) => void,
  providerId: string
): Promise<PageImageCandidate[]> {
  const candidates: PageImageCandidate[] = [];
  const seenPages = new Set<string>();

  for (let pageUrl of pageUrls) {
    if (seenPages.has(pageUrl)) continue;
    seenPages.add(pageUrl);
    if (seenPages.size > 8) break;

    const html = await fetchHtml(pageUrl);
    if (!html) continue;

    const pageScore = scoreEventPageContext(html, input);
    if (!passesLocationGate(pageScore, input)) {
      log(`${providerId} página descartada (lugar/fecha)`, {
        pageUrl: pageUrl.slice(0, 90),
        pageScore,
        city: input.eventCity,
      });
      continue;
    }

    log(`${providerId} página válida`, { pageUrl: pageUrl.slice(0, 90), pageScore });

    const found = new Set<string>();
    for (const m of html.matchAll(imageUrlPattern)) {
      found.add(m[0]);
    }

    for (const url of found) {
      const imageScore = scoreImageUrlForEvent(url, input.eventName);
      if (imageScore <= 0 && !url.includes('show-header')) continue;
      candidates.push({
        url,
        pageScore,
        imageScore: imageScore + (url.includes('show-header') ? 6 : 0),
      });
    }
  }

  candidates.sort(
    (a, b) => b.pageScore + b.imageScore - (a.pageScore + a.imageScore)
  );

  if (candidates.length) {
    log(`${providerId} imágenes en páginas válidas`, {
      count: candidates.length,
      top: candidates[0]?.url.slice(0, 90),
      pageScore: candidates[0]?.pageScore,
    });
  }

  return candidates;
}

function extractTicketekEventLinks(html: string, baseHost = 'https://www.ticketek.com.ar'): string[] {
  const links = new Set<string>();
  const patterns = [
    /href="(https?:\/\/[^"]*ticketek[^"]*(?:\/evento|\/event|\/shows?|\/entradas)[^"]*)"/gi,
    /href="(\/(?:evento|event|shows?|entradas)[^"]+)"/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      let href = m[1];
      if (href.startsWith('/')) href = `${baseHost}${href}`;
      if (href.includes('ticketek')) links.add(href.split('#')[0]);
    }
  }
  return [...links].slice(0, 10);
}

function extractCmsSlugsFromHtml(html: string, cmsPathSegment: string): string[] {
  const slugs = new Set<string>();
  const re = new RegExp(
    `${cmsPathSegment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([a-zA-Z0-9_-]+)\\.(?:png|jpe?g|webp)`,
    'gi'
  );
  for (const m of html.matchAll(re)) {
    if (m[1]) slugs.add(m[1]);
  }
  return [...slugs];
}

async function probeCmsSlugs(
  cmsBase: string,
  slugs: string[],
  download: DownloadImageFn,
  log: (msg: string, data?: Record<string, unknown>) => void,
  providerId: string,
  eventNameForFilter = ''
): Promise<string | null> {
  const exts = ['png', 'jpg', 'webp'];
  const filtered = slugs.filter((s) => !isUnsafeBareCmsSlug(s, eventNameForFilter));
  for (const slug of filtered.slice(0, 24)) {
    for (const ext of exts) {
      const url = `${cmsBase}/${slug}.${ext}`;
      const dl = await download(url, 3500);
      if (dl.ok) {
        log(`${providerId} CMS slug OK`, { slug, bytes: dl.buffer.length });
        return url;
      }
    }
  }
  return null;
}

const TICKETEK_CMS =
  'https://prod-cms-static.ticketek.com.ar/sites/default/files/images/show-header';
const TICKETEK_CMS_RE =
  /https:\/\/prod-cms-static\.ticketek\.com\.ar\/sites\/default\/files\/images\/show-header\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)/gi;

export const TICKETEK_PROVIDER: TicketeraImageProvider = {
  id: 'ticketek',
  ticketeraIds: ['TICKETEK', 'TICKET_PLUS', 'TICKETERA'],
  async findImageUrl(input, { download, log }) {
    const canonicalUrls = buildTicketekEventUrlCandidates(input);
    log('ticketek URLs canónicas (show/venue)', {
      count: canonicalUrls.length,
      sample: canonicalUrls.slice(0, 4),
      eventPlace: input.eventPlace,
    });

    const verifiedSlugs = new Set<string>();
    const imageCandidates: { url: string; score: number }[] = [];

    for (const pageUrl of canonicalUrls) {
      const html = await fetchTicketekSsrHtml(pageUrl);
      if (!html) {
        log('ticketek SSR sin HTML', { pageUrl });
        continue;
      }
      const pageScore = scoreTicketekPage(html, pageUrl, input);
      if (!ticketekPageMatchesEvent(html, pageUrl, input)) {
        log('ticketek página descartada', { pageUrl, pageScore });
        continue;
      }
      log('ticketek página válida (SSR)', { pageUrl, pageScore });
      for (const imgUrl of extractShowHeaderImagesFromHtml(html)) {
        const slug = extractCmsSlugFromImageUrl(imgUrl);
        if (slug) verifiedSlugs.add(slug);
        imageCandidates.push({ url: imgUrl, score: pageScore + 60 });
      }
    }

    imageCandidates.sort((a, b) => b.score - a.score);
    for (const { url } of imageCandidates) {
      const normalized = normalizeTicketekCmsUrl(url);
      const dl = await download(normalized, 8000);
      if (dl.ok) {
        log('ticketek imagen desde SSR', { url: normalized.slice(0, 110), slug: extractCmsSlugFromImageUrl(normalized) });
        return normalized;
      }
    }

    const slugList: string[] = [...verifiedSlugs];
    for (const s of buildEventSlugCandidates(input.eventName, input.eventDate)) {
      if (!isUnsafeBareCmsSlug(s, input.eventName) && (s.includes('-') || s.length >= 10)) {
        slugList.push(s);
      }
    }

    const fromCms = await probeCmsSlugs(
      TICKETEK_CMS,
      [...new Set(slugList)],
      download,
      log,
      'ticketek',
      input.eventName
    );
    if (fromCms) return fromCms;

    log('ticketek sin imagen para show/venue', {
      eventPlace: input.eventPlace,
      eventCity: input.eventCity,
      verifiedSlugs: [...verifiedSlugs],
    });
    return null;
  },
};

const ALLACCESS_IMAGE_RE =
  /https:\/\/[^"'\s]*(?:allaccess|cloudfront|amazonaws)[^"'\s]*\/[^"'\s]+\.(?:png|jpe?g|webp)(?:\?[^"'\s]*)?/gi;

function extractAllAccessEventLinks(html: string): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/href="(https?:\/\/[^"]*allaccess[^"]+)"/gi)) {
    links.add(m[1].split('#')[0]);
  }
  for (const m of html.matchAll(/href="(\/evento\/[^"]+)"/gi)) {
    links.add(`https://www.allaccess.com.ar${m[1].split('#')[0]}`);
  }
  return [...links].slice(0, 10);
}

export const ALLACCESS_PROVIDER: TicketeraImageProvider = {
  id: 'allaccess',
  ticketeraIds: ['ALLACCESS'],
  async findImageUrl(input, { log }) {
    const query = buildEventSearchQuery(input);
    const slug = normalizeAscii(input.eventName).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const searchUrls = [
      `https://www.allaccess.com.ar/search?query=${encodeURIComponent(query)}`,
      `https://www.allaccess.com.ar/evento/${encodeURIComponent(slug)}`,
    ];

    const detailPages: string[] = [];
    for (const url of searchUrls) {
      const html = await fetchHtml(url);
      if (html) detailPages.push(...extractAllAccessEventLinks(html), url);
    }

    const candidates = await scrapeMatchedEventPages(
      [...new Set(detailPages)],
      ALLACCESS_IMAGE_RE,
      input,
      log,
      'allaccess'
    );
    return candidates[0]?.url ?? null;
  },
};

export const TICKETERA_PROVIDERS: TicketeraImageProvider[] = [TICKETEK_PROVIDER, ALLACCESS_PROVIDER];

const TITLE_STOPWORDS = new Set([
  'experiencia',
  'tributo',
  'homenaje',
  'show',
  'en',
  'vivo',
  'festival',
  'recital',
  'el',
  'la',
  'de',
  'del',
  'los',
  'las',
  'live',
  'tour',
  'the',
  'and',
  'y',
  'argentina',
]);

export function titleMatchesEvent(eventName: string, title: string): boolean {
  const titleNorm = normalizeAscii(title);
  const prefixMatch = eventName.match(SHOW_PREFIX_RE);
  if (prefixMatch?.[2]) {
    const artist = normalizeAscii(prefixMatch[2]).replace(/[^a-z0-9]+/g, '');
    const titleCompact = titleNorm.replace(/[^a-z0-9]+/g, '');
    if (titleCompact === artist || titleCompact === `${artist}s`) return false;
    if (
      titleNorm.includes('experiencia') ||
      titleNorm.includes('tributo') ||
      titleNorm.includes('homenaje')
    ) {
      return true;
    }
    return titleNorm.includes(artist) && titleNorm.length > artist.length + 6;
  }

  const eventWords = normalizeAscii(eventName)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !TITLE_STOPWORDS.has(w));

  if (eventWords.length === 0) return true;
  if (eventWords.length === 1) return titleNorm.includes(eventWords[0]);

  const matched = eventWords.filter((w) => titleNorm.includes(w));
  const required = Math.max(2, Math.ceil(eventWords.length * 0.7));
  return matched.length >= required;
}

export function providersForTicketera(ticketeraId?: string | null): TicketeraImageProvider[] {
  const tick = (ticketeraId || '').toUpperCase();
  if (!tick || tick === 'OTRA') {
    return TICKETERA_PROVIDERS;
  }
  const matched = TICKETERA_PROVIDERS.filter((p) => p.ticketeraIds.includes(tick));
  return matched.length ? matched : TICKETERA_PROVIDERS;
}
