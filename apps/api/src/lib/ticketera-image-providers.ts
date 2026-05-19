/**
 * Proveedores de imágenes oficiales por ticketera (Argentina).
 * Cada proveedor usa el nombre del evento + fecha; sin URLs fijas por evento.
 */

export type EventImageSearchInput = {
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  category?: string | null;
  ticketera?: string | null;
};

export type CmsProbeResult = { ok: true; buffer: Buffer } | { ok: false; reason: string };

export type DownloadImageFn = (url: string, timeoutMs?: number) => Promise<CmsProbeResult>;

export type TicketeraImageProvider = {
  id: string;
  /** IDs de ticketera en el formulario (shared TICKETERAS_IDS). */
  ticketeraIds: string[];
  /** Busca URL de imagen oficial; null si no hay candidato. */
  findImageUrl: (
    input: EventImageSearchInput,
    deps: { download: DownloadImageFn; log: (msg: string, data?: Record<string, unknown>) => void }
  ) => Promise<string | null>;
};

/** Prefijos habituales en nombres de shows (tributo, homenaje, etc.). */
const SHOW_PREFIX_RE =
  /^(experiencia|tributo|tributo a|homenaje|homenaje a|show|show de|festival|recital)\s+(.+)$/i;

export function normalizeAscii(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Genera slugs probables para CDN tipo show-header/{slug}.png */
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

/** Sufijos numéricos solo desde fecha + hash del nombre (sin IDs mágicos fijos). */
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

async function probeCmsBase(
  cmsBase: string,
  eventName: string,
  eventDate: string,
  download: DownloadImageFn,
  log: (msg: string, data?: Record<string, unknown>) => void,
  providerId: string
): Promise<string | null> {
  const slugs = buildEventSlugCandidates(eventName, eventDate);
  const exts = ['png', 'jpg', 'webp'];
  for (const slug of slugs) {
    for (const ext of exts) {
      const url = `${cmsBase}/${slug}.${ext}`;
      const dl = await download(url, 3500);
      if (dl.ok) {
        log(`${providerId} CMS slug OK`, { slug, bytes: dl.buffer.length });
        return url;
      }
    }
  }
  log(`${providerId} CMS sin slug`, { tried: slugs.length });
  return null;
}

async function scrapePagesForImages(
  pageUrls: string[],
  imageUrlPattern: RegExp,
  eventName: string,
  log: (msg: string, data?: Record<string, unknown>) => void,
  providerId: string
): Promise<string[]> {
  const found = new Set<string>();
  for (const pageUrl of pageUrls) {
    try {
      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-AR,es;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      for (const m of html.matchAll(imageUrlPattern)) {
        found.add(m[0]);
      }
    } catch {
      /* siguiente */
    }
  }
  const ranked = [...found].sort(
    (a, b) => scoreImageUrlForEvent(b, eventName) - scoreImageUrlForEvent(a, eventName)
  );
  if (ranked.length) log(`${providerId} scrape`, { count: ranked.length, top: ranked[0]?.slice(0, 80) });
  return ranked;
}

const TICKETEK_CMS =
  'https://prod-cms-static.ticketek.com.ar/sites/default/files/images/show-header';
const TICKETEK_CMS_RE =
  /https:\/\/prod-cms-static\.ticketek\.com\.ar\/sites\/default\/files\/images\/show-header\/[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp)/gi;

export const TICKETEK_PROVIDER: TicketeraImageProvider = {
  id: 'ticketek',
  ticketeraIds: ['TICKETEK', 'TICKET_PLUS', 'TICKETERA'],
  async findImageUrl(input, { download, log }) {
    const name = input.eventName.trim();
    const ranked = await scrapePagesForImages(
      [
        `https://www.ticketek.com.ar/search?q=${encodeURIComponent(name)}`,
        `https://www.ticketek.com.ar/search?searchText=${encodeURIComponent(name)}`,
      ],
      TICKETEK_CMS_RE,
      name,
      log,
      'ticketek'
    );
    for (const url of ranked) {
      if (scoreImageUrlForEvent(url, name) > 0) return url;
    }
    return probeCmsBase(TICKETEK_CMS, name, input.eventDate, download, log, 'ticketek');
  },
};

/** All Access: sin CDN público documentado; scrape del sitio por URLs de imagen de eventos. */
const ALLACCESS_IMAGE_RE =
  /https:\/\/[^"'\s]*(?:allaccess|cloudfront|amazonaws)[^"'\s]*\/[^"'\s]+\.(?:png|jpe?g|webp)(?:\?[^"'\s]*)?/gi;

export const ALLACCESS_PROVIDER: TicketeraImageProvider = {
  id: 'allaccess',
  ticketeraIds: ['ALLACCESS'],
  async findImageUrl(input, { log }) {
    const name = input.eventName.trim();
    const slug = normalizeAscii(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const urls = [
      `https://www.allaccess.com.ar/search?query=${encodeURIComponent(name)}`,
      `https://www.allaccess.com.ar/evento/${encodeURIComponent(slug)}`,
      'https://www.allaccess.com.ar/',
    ];
    const ranked = await scrapePagesForImages(urls, ALLACCESS_IMAGE_RE, name, log, 'allaccess');
    return ranked[0] ?? null;
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

/** Evita aceptar un artículo genérico cuando el evento tiene prefijo + artista (ej. tributo X vs solo X). */
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
