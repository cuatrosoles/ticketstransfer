/**
 * Resuelve y almacena la imagen de portada de un evento al publicar tickets.
 * Estrategia: Gemini → Wikipedia → Wikimedia Commons → Pollinations → fallback por categoría.
 */

import sharp from 'sharp';
import {
  getEventImageCategoryFallback,
  normalizeEventImageCategory,
  type EventImageSource,
} from '@tickets-transfer/shared';
import { uploadFile } from './firebase-storage.js';

export type EventImageInput = {
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  category?: string | null;
};

export type EventImageResult = {
  url: string;
  source: EventImageSource;
};

type ResolvedRemote = {
  url: string;
  source: EventImageSource;
  /** Buffer ya descargado (evita segunda petición y pérdida por timeout). */
  buffer?: Buffer;
};

const TIMEOUT_MS =
  Number(process.env.EVENT_IMAGE_TIMEOUT_MS) ||
  (process.env.VERCEL === '1' ? 28_000 : 15_000);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || '';
const ENABLE_AI_GENERATION = process.env.EVENT_IMAGE_AI_GENERATION !== '0';
const MIN_IMAGE_BYTES = Number(process.env.EVENT_IMAGE_MIN_BYTES) || 800;
const LOG_VERBOSE = process.env.EVENT_IMAGE_DEBUG === '1' || process.env.EVENT_IMAGE_DEBUG === 'true';

const BLOCKED_HOSTS = [
  'pinterest.',
  'pinimg.',
  'facebook.',
  'instagram.',
  'tiktok.',
  'twitter.',
  'x.com',
  'reddit.',
];

const TRUSTED_HOST_HINTS = [
  'ticketek',
  'allaccess',
  'ticketmaster',
  'movistararena',
  'luna',
  'teatro',
  'estadio',
  'wikipedia.org',
  'wikimedia.org',
  'upload.wikimedia.org',
  'spotifycdn',
  'cloudfront.net',
  'googleusercontent.com',
  'fbcdn.net',
  'pollinations.ai',
  'unsplash.com',
  'mzstatic.com',
  'apple.com',
];

function log(level: 'info' | 'warn' | 'debug', msg: string, data?: Record<string, unknown>) {
  const payload = data ? ` ${JSON.stringify(data)}` : '';
  const line = `[event-image] ${msg}${payload}`;
  if (level === 'warn') console.warn(line);
  else if (level === 'debug' && !LOG_VERBOSE) return;
  else console.log(line);
}

function logInput(input: EventImageInput, ctx: string) {
  log('info', `${ctx} inicio`, {
    eventName: input.eventName,
    eventDate: input.eventDate,
    eventPlace: input.eventPlace ?? null,
    category: normalizeEventImageCategory(input.category),
    gemini: Boolean(GEMINI_API_KEY),
    aiGeneration: ENABLE_AI_GENERATION,
    timeoutMs: TIMEOUT_MS,
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

function isAllowedImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((b) => host.includes(b))) return false;
    if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(u.pathname + u.search)) return true;
    if (TRUSTED_HOST_HINTS.some((h) => host.includes(h))) return true;
  } catch {
    return false;
  }
  return false;
}

function extractHttpsImageUrls(text: string): string[] {
  const re = /https:\/\/[^\s"'<>)\]]+/gi;
  const raw = text.match(re) || [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (let u of raw) {
    u = u.replace(/[.,;:!?)}\]]+$/, '');
    if (!seen.has(u) && isAllowedImageUrl(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}

type DownloadResult = { ok: true; buffer: Buffer; contentType: string; mime: string } | { ok: false; reason: string };

async function downloadImageBuffer(url: string, timeoutMs = 8000): Promise<DownloadResult> {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '?';
    }
  })();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'TicketsTransfer/2.0 EventImageResolver',
        Accept: 'image/jpeg,image/png;q=0.9,image/webp;q=0.8,image/*;q=0.5',
        Referer: 'https://ticketstransfer.com/',
      },
    });
    if (!res.ok) {
      return { ok: false, reason: `HTTP ${res.status} desde ${host}` };
    }
    const ct = (res.headers.get('content-type') || '').toLowerCase().split(';')[0].trim();
    if (!ct.startsWith('image/') && ct !== 'application/octet-stream') {
      return { ok: false, reason: `content-type no imagen: ${ct || 'vacío'}` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < MIN_IMAGE_BYTES) {
      return { ok: false, reason: `muy pequeña (${buf.length} bytes, mín ${MIN_IMAGE_BYTES})` };
    }
    if (buf.length > 5 * 1024 * 1024) {
      return { ok: false, reason: `muy grande (${buf.length} bytes)` };
    }
    const mime = detectImageMime(buf);
    if (!mime) {
      const head = buf.subarray(0, 16).toString('hex');
      return { ok: false, reason: `magic bytes no reconocidos (${head})` };
    }
    return { ok: true, buffer: buf, contentType: ct.startsWith('image/') ? ct : mime, mime };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: `fetch error: ${msg}` };
  } finally {
    clearTimeout(timer);
  }
}

function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buffer.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  return null;
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}

type PreparedImage = {
  buffer: Buffer;
  contentType: string;
  ext: string;
};

async function prepareImageBuffer(buffer: Buffer): Promise<PreparedImage> {
  try {
    const meta = await sharp(buffer, { failOn: 'none' }).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w < 80 || h < 60) throw new Error(`Imagen demasiado pequeña (${w}x${h})`);
    let pipeline = sharp(buffer, { failOn: 'none' });
    if (w > 1200) pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
    const out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    return { buffer: out, contentType: 'image/jpeg', ext: 'jpg' };
  } catch (err) {
    const mime = detectImageMime(buffer);
    if (mime) {
      log('warn', 'sharp falló, subiendo original', {
        error: err instanceof Error ? err.message : String(err),
        mime,
      });
      return { buffer, contentType: mime, ext: mimeToExt(mime) };
    }
    throw err;
  }
}

async function uploadEventImage(listingId: string, buffer: Buffer): Promise<string> {
  const prepared = await prepareImageBuffer(buffer);
  const path = `tickets/${listingId}/event_cover_${Date.now()}.${prepared.ext}`;
  log('info', 'subiendo a storage', { listingId, ext: prepared.ext, bytes: prepared.buffer.length });
  return uploadFile(path, prepared.buffer, prepared.contentType);
}

function parseJsonFromText(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function searchOfficialImageWithGemini(input: EventImageInput): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    log('info', 'gemini omitido (sin GEMINI_API_KEY)');
    return null;
  }

  const category = normalizeEventImageCategory(input.category);
  const prompt = [
    'Encontrá la URL DIRECTA (HTTPS) de una imagen promocional oficial del evento en Argentina.',
    'Respondé ÚNICAMENTE con JSON válido, sin markdown:',
    '{"imageUrl":"https://ejemplo.com/poster.jpg o null","source":"ticketera o sitio"}',
    '',
    `Evento: ${input.eventName}`,
    `Lugar: ${input.eventPlace || 'No especificado'}`,
    `Fecha: ${input.eventDate}`,
    `Categoría: ${category}`,
    '',
    'La URL debe ser un archivo de imagen (.jpg, .png, .webp), no una página HTML.',
    'Preferí Ticketek, All Access, Movistar Arena, teatro oficial, artista oficial.',
    'Si no hay URL directa fiable, usá "imageUrl": null.',
  ].join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
      }),
    }
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    log('warn', 'gemini HTTP error', { status: res.status, body: errBody.slice(0, 300) });
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  log('debug', 'gemini texto', { preview: text.slice(0, 400) });

  const parsed = parseJsonFromText(text);
  const fromJson = typeof parsed?.imageUrl === 'string' ? parsed.imageUrl.trim() : '';
  if (fromJson && fromJson !== 'null' && isAllowedImageUrl(fromJson)) {
    log('info', 'gemini URL desde JSON', { url: fromJson.slice(0, 120) });
    return fromJson;
  }

  const fromText = extractHttpsImageUrls(text);
  if (fromText.length > 0) {
    log('info', 'gemini URL desde texto', { url: fromText[0].slice(0, 120), total: fromText.length });
    return fromText[0];
  }

  log('warn', 'gemini sin URL utilizable', {
    hasJson: Boolean(parsed),
    imageUrl: fromJson || null,
  });
  return null;
}

/** Wikipedia (es/en) – suele tener miniatura del artista/evento. */
async function searchWikipediaPageImage(eventName: string): Promise<string | null> {
  for (const lang of ['es', 'en']) {
    const apiUrl =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&generator=search&gsrsearch=${encodeURIComponent(eventName)}&gsrlimit=4` +
      `&prop=pageimages&piprop=thumbnail&pithumbsize=900`;

    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'TicketsTransfer/2.0 EventImageResolver' },
    });
    if (!res.ok) continue;

    const data = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          { title?: string; thumbnail?: { source?: string }; pageimage?: string }
        >;
      };
    };
    const pages = data.query?.pages;
    if (!pages) continue;

    for (const page of Object.values(pages)) {
      const title = (page.title || '').toLowerCase();
      if (/disambiguation|lista de|list of|category:/i.test(title)) continue;
      const src = page.thumbnail?.source;
      if (src && isAllowedImageUrl(src)) {
        log('info', 'wikipedia thumbnail', { lang, title: page.title, url: src.slice(0, 100) });
        return src;
      }
    }
  }
  log('debug', 'wikipedia sin resultados', { eventName });
  return null;
}

/** iTunes Search – artwork de álbum/artista (música). */
async function searchItunesArtwork(eventName: string): Promise<string | null> {
  const term = encodeURIComponent(eventName.replace(/experiencia\s+/i, '').trim() || eventName);
  const res = await fetch(
    `https://itunes.apple.com/search?term=${term}&entity=album&limit=3&country=ar`,
    { headers: { 'User-Agent': 'TicketsTransfer/2.0 EventImageResolver' } }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    results?: Array<{ artworkUrl100?: string; collectionName?: string; artistName?: string }>;
  };
  for (const item of data.results || []) {
    const base = item.artworkUrl100;
    if (!base) continue;
    const url = base.replace(/100x100bb\.(jpg|png)/, '600x600bb.$1');
    if (isAllowedImageUrl(url)) {
      log('info', 'itunes artwork', {
        artist: item.artistName,
        album: item.collectionName,
        url: url.slice(0, 100),
      });
      return url;
    }
  }
  return null;
}

async function searchWikimediaImage(eventName: string): Promise<string | null> {
  const q = encodeURIComponent(`${eventName} concert poster`);
  const apiUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${q}&gsrlimit=8&prop=imageinfo` +
    `&iiprop=url|thumburl&iiurlwidth=900`;

  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'TicketsTransfer/2.0 EventImageResolver' },
  });
  if (!res.ok) {
    log('warn', 'wikimedia API error', { status: res.status });
    return null;
  }

  const data = (await res.json()) as {
    query?: {
      pages?: Record<string, { title?: string; imageinfo?: Array<{ thumburl?: string; url?: string }> }>;
    };
  };
  const pages = data.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const title = (page.title || '').toLowerCase();
    if (/logo|icon|svg|flag|map|signature|diagram|symbol/i.test(title)) continue;
    const info = page.imageinfo?.[0];
    const candidates = [info?.thumburl, info?.url].filter(Boolean) as string[];
    for (const url of candidates) {
      if (/\.svg(\?|$)/i.test(url)) continue;
      if (isAllowedImageUrl(url)) {
        log('info', 'wikimedia imagen', { title: page.title, url: url.slice(0, 100) });
        return url;
      }
    }
  }
  log('debug', 'wikimedia sin candidatos', { eventName });
  return null;
}

function buildAiPrompt(input: EventImageInput): string {
  const category = normalizeEventImageCategory(input.category);
  const labels: Record<string, string> = {
    MUSICA: 'concierto musical rock',
    DEPORTES: 'evento deportivo en estadio',
    TEATRO: 'teatro escenario',
    FESTIVALES: 'festival al aire libre',
    OTRO: 'evento en vivo',
  };
  return [
    `Concert poster ${labels[category] || 'live event'}`,
    input.eventName,
    input.eventPlace || '',
    'dramatic lighting, crowd, stage, no text, no logos',
  ]
    .filter(Boolean)
    .join(', ');
}

async function trySource(
  source: EventImageSource,
  url: string | null,
  timeoutMs = 8000
): Promise<ResolvedRemote | null> {
  if (!url) return null;
  const dl = await downloadImageBuffer(url, timeoutMs);
  if (dl.ok) {
    log('info', `${source} OK`, { url: url.slice(0, 100), bytes: dl.buffer.length, mime: dl.mime });
    return { url, source, buffer: dl.buffer };
  }
  log('warn', `${source} descarga falló`, { url: url.slice(0, 100), reason: dl.reason });
  return null;
}

async function tryPollinations(input: EventImageInput): Promise<ResolvedRemote | null> {
  if (!ENABLE_AI_GENERATION) {
    log('info', 'pollinations omitido (EVENT_IMAGE_AI_GENERATION=0)');
    return null;
  }
  const prompt = buildAiPrompt(input);
  const seed = Math.abs([...prompt].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 999_983);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=506&nologo=true&seed=${seed}&model=flux`;
  return trySource('generated', url, 14_000);
}

async function resolveRemoteImageUrl(input: EventImageInput): Promise<ResolvedRemote> {
  const category = normalizeEventImageCategory(input.category);

  const steps: Array<() => Promise<ResolvedRemote | null>> = [
    async () => trySource('official', await searchOfficialImageWithGemini(input)),
    async () => trySource('wikimedia', await searchWikipediaPageImage(input.eventName)),
    async () =>
      category === 'MUSICA'
        ? trySource('official', await searchItunesArtwork(input.eventName))
        : null,
    async () => trySource('wikimedia', await searchWikimediaImage(input.eventName)),
    async () => tryPollinations(input),
  ];

  for (const step of steps) {
    const hit = await step().catch((e) => {
      log('warn', 'paso lanzó excepción', { error: e instanceof Error ? e.message : String(e) });
      return null;
    });
    if (hit) return hit;
  }

  const fallbackUrl = getEventImageCategoryFallback(input.category);
  log('warn', 'todos los pasos fallaron → fallback categoría', { fallbackUrl: fallbackUrl.slice(0, 80) });
  const fb = await trySource('fallback', fallbackUrl, 10_000);
  if (fb) return fb;

  return { url: fallbackUrl, source: 'fallback' };
}

/** Resuelve imagen y la sube a Storage. Nunca falla: siempre devuelve URL. */
export async function resolveAndStoreEventImage(
  listingId: string,
  input: EventImageInput
): Promise<EventImageResult> {
  logInput(input, `store:${listingId}`);
  try {
    const resolved = await withTimeout(resolveRemoteImageUrl(input), TIMEOUT_MS, 'event-image');
    let buffer = resolved.buffer;
    if (!buffer) {
      const dl = await downloadImageBuffer(resolved.url, 10_000);
      if (dl.ok) buffer = dl.buffer;
      else {
        log('warn', 're-descarga falló', { source: resolved.source, reason: dl.reason });
      }
    }

    if (!buffer) {
      const fallbackUrl = getEventImageCategoryFallback(input.category);
      log('warn', 'sin buffer, devolviendo URL fallback externa', { fallbackUrl });
      return { url: fallbackUrl, source: 'fallback' };
    }

    const storedUrl = await uploadEventImage(listingId, buffer);
    log('info', 'store completado', { listingId, source: resolved.source, storedUrl: storedUrl.slice(0, 80) });
    return { url: storedUrl, source: resolved.source };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('warn', 'store excepción → fallback', { listingId, error: msg });
    try {
      const fallbackUrl = getEventImageCategoryFallback(input.category);
      const dl = await downloadImageBuffer(fallbackUrl, 10_000);
      if (dl.ok) {
        const storedUrl = await uploadEventImage(listingId, dl.buffer);
        return { url: storedUrl, source: 'fallback' };
      }
    } catch (e2) {
      log('warn', 'fallback store falló', { error: e2 instanceof Error ? e2.message : String(e2) });
    }
    return {
      url: getEventImageCategoryFallback(input.category),
      source: 'fallback',
    };
  }
}

/** Vista previa sin persistir (para formularios). */
export async function previewEventImage(input: EventImageInput): Promise<EventImageResult> {
  logInput(input, 'preview');
  try {
    const resolved = await withTimeout(resolveRemoteImageUrl(input), TIMEOUT_MS, 'event-image-preview');
    log('info', 'preview resultado', { source: resolved.source, url: resolved.url.slice(0, 100) });
    return { url: resolved.url, source: resolved.source };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('warn', 'preview timeout/error → fallback', { error: msg });
    return {
      url: getEventImageCategoryFallback(input.category),
      source: 'fallback',
    };
  }
}

export function shouldRefreshEventImage(
  prev: EventImageInput,
  next: Partial<EventImageInput>
): boolean {
  const fields: (keyof EventImageInput)[] = ['eventName', 'eventDate', 'eventPlace', 'category'];
  return fields.some((f) => next[f] !== undefined && String(next[f] ?? '') !== String(prev[f] ?? ''));
}

export function eventImageInputFromListing(data: Record<string, unknown>): EventImageInput {
  const eventDateRaw = data.eventDate;
  let eventDate = '';
  if (eventDateRaw instanceof Date) {
    eventDate = eventDateRaw.toISOString().slice(0, 10);
  } else if (typeof eventDateRaw === 'string') {
    eventDate = eventDateRaw.slice(0, 10);
  } else if (eventDateRaw && typeof eventDateRaw === 'object' && '_seconds' in (eventDateRaw as object)) {
    eventDate = new Date((eventDateRaw as { _seconds: number })._seconds * 1000).toISOString().slice(0, 10);
  }

  return {
    eventName: String(data.eventName || ''),
    eventDate,
    eventPlace: (data.eventPlace as string | null) ?? null,
    category: (data.category as string | null) ?? null,
  };
}
