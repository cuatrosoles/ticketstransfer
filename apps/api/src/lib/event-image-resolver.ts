/**
 * Resuelve y almacena la imagen de portada de un evento al publicar tickets.
 * Estrategia: búsqueda oficial (Gemini + Google Search) → Wikimedia → generación IA → fallback por categoría.
 */

import { Jimp } from 'jimp';
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

const TIMEOUT_MS = Number(process.env.EVENT_IMAGE_TIMEOUT_MS) || 10_000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || '';
const ENABLE_AI_GENERATION = process.env.EVENT_IMAGE_AI_GENERATION !== '0';

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
  'spotifycdn',
  'cloudfront.net',
  'googleusercontent.com',
  'fbcdn.net',
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timeout`)), ms);
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
    return (
      /\.(jpe?g|png|webp)(\?|$)/i.test(u.pathname + u.search) ||
      TRUSTED_HOST_HINTS.some((h) => host.includes(h))
    );
  } catch {
    return false;
  }
}

async function downloadImageBuffer(url: string, timeoutMs = 6000): Promise<Buffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'TicketsTransfer/2.0 EventImageResolver',
        Accept: 'image/jpeg,image/png,image/webp,*/*',
      },
    });
    if (!res.ok) return null;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4_000 || buf.length > 5 * 1024 * 1024) return null;
    return buf;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function normalizeImageBuffer(buffer: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buffer);
  const w = image.width;
  const h = image.height;
  if (w < 120 || h < 80) throw new Error('Imagen demasiado pequeña');
  if (w > 1200) image.resize({ w: 1200 });
  return image.getBuffer('image/jpeg', { quality: 82 });
}

async function uploadEventImage(listingId: string, buffer: Buffer): Promise<string> {
  const normalized = await normalizeImageBuffer(buffer);
  const path = `tickets/${listingId}/event_cover_${Date.now()}.jpg`;
  return uploadFile(path, normalized, 'image/jpeg');
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
  if (!GEMINI_API_KEY) return null;

  const category = normalizeEventImageCategory(input.category);
  const prompt = [
    'Sos un asistente que encuentra imágenes promocionales OFICIALES de eventos en Argentina.',
    'Devolvé SOLO JSON válido (sin markdown) con esta forma:',
    '{"imageUrl":"https://...jpg|png|webp directa O null","source":"nombre breve de la fuente"}',
    '',
    `Evento: ${input.eventName}`,
    `Lugar: ${input.eventPlace || 'No especificado'}`,
    `Fecha: ${input.eventDate}`,
    `Categoría: ${category}`,
    '',
    'Reglas:',
    '- URL HTTPS directa a imagen (no HTML, no PDF).',
    '- Preferí sitios oficiales: ticketeras (Ticketek, All Access), venue, artista, productora.',
    '- Evitá redes sociales, Pinterest, blogs no oficiales.',
    '- Sin desnudos, violencia explícita ni contenido adulto.',
    '- Si no hay imagen oficial fiable, imageUrl debe ser null.',
  ].join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.15, maxOutputTokens: 400 },
      }),
    }
  );

  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  const parsed = parseJsonFromText(text);
  const url = typeof parsed?.imageUrl === 'string' ? parsed.imageUrl.trim() : '';
  if (!url || url === 'null') return null;
  return isAllowedImageUrl(url) ? url : null;
}

async function searchWikimediaImage(eventName: string): Promise<string | null> {
  const q = encodeURIComponent(`${eventName} concert OR show OR event poster`);
  const apiUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${q}&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=900`;

  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'TicketsTransfer/2.0 EventImageResolver' },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    query?: {
      pages?: Record<string, { title?: string; imageinfo?: Array<{ thumburl?: string; url?: string }> }>;
    };
  };
  const pages = data.query?.pages;
  if (!pages) return null;

  for (const page of Object.values(pages)) {
    const title = (page.title || '').toLowerCase();
    if (/logo|icon|svg|flag|map|signature|diagram/.test(title)) continue;
    const info = page.imageinfo?.[0];
    const url = info?.thumburl || info?.url;
    if (url && isAllowedImageUrl(url)) return url;
  }
  return null;
}

function buildAiPrompt(input: EventImageInput): string {
  const category = normalizeEventImageCategory(input.category);
  const labels: Record<string, string> = {
    MUSICA: 'concierto musical',
    DEPORTES: 'evento deportivo en estadio',
    TEATRO: 'obra de teatro en escenario',
    FESTIVALES: 'festival al aire libre',
    OTRO: 'evento en vivo',
  };
  return [
    `Poster artístico profesional para ${labels[category] || 'evento'}:`,
    `"${input.eventName}"`,
    input.eventPlace ? `en ${input.eventPlace}` : '',
    input.eventDate ? `fecha ${input.eventDate}` : '',
    'estilo moderno vibrante, sin texto, sin logos, sin marcas, sin personas reconocibles, apto todo público, alta calidad',
  ]
    .filter(Boolean)
    .join(', ');
}

async function generateAiImageUrl(input: EventImageInput): Promise<string | null> {
  if (!ENABLE_AI_GENERATION) return null;
  const prompt = buildAiPrompt(input);
  const seed = Math.abs([...prompt].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 999_983);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=506&nologo=true&seed=${seed}`;
  const buf = await downloadImageBuffer(url, 8000);
  return buf ? url : null;
}

async function resolveRemoteImageUrl(input: EventImageInput): Promise<{ url: string; source: EventImageSource }> {
  const official = await searchOfficialImageWithGemini(input).catch(() => null);
  if (official) {
    const buf = await downloadImageBuffer(official);
    if (buf) return { url: official, source: 'official' };
  }

  const wiki = await searchWikimediaImage(input.eventName).catch(() => null);
  if (wiki) {
    const buf = await downloadImageBuffer(wiki);
    if (buf) return { url: wiki, source: 'wikimedia' };
  }

  if (ENABLE_AI_GENERATION) {
    const aiUrl = await generateAiImageUrl(input).catch(() => null);
    if (aiUrl) {
      const buf = await downloadImageBuffer(aiUrl, 9000);
      if (buf) return { url: aiUrl, source: 'generated' };
    }
  }

  return {
    url: getEventImageCategoryFallback(input.category),
    source: 'fallback',
  };
}

/** Resuelve imagen y la sube a Storage. Nunca falla: siempre devuelve URL. */
export async function resolveAndStoreEventImage(
  listingId: string,
  input: EventImageInput
): Promise<EventImageResult> {
  try {
    const resolved = await withTimeout(resolveRemoteImageUrl(input), TIMEOUT_MS, 'event-image');
    const buffer =
      (await downloadImageBuffer(resolved.url, 7000)) ||
      (await downloadImageBuffer(getEventImageCategoryFallback(input.category), 5000));

    if (!buffer) {
      return { url: getEventImageCategoryFallback(input.category), source: 'fallback' };
    }

    const storedUrl = await uploadEventImage(listingId, buffer);
    return { url: storedUrl, source: resolved.source };
  } catch (err) {
    console.warn('[event-image] fallback por error:', err instanceof Error ? err.message : err);
    try {
      const fallbackBuf = await downloadImageBuffer(getEventImageCategoryFallback(input.category), 5000);
      if (fallbackBuf) {
        const storedUrl = await uploadEventImage(listingId, fallbackBuf);
        return { url: storedUrl, source: 'fallback' };
      }
    } catch {
      /* usar URL externa */
    }
    return {
      url: getEventImageCategoryFallback(input.category),
      source: 'fallback',
    };
  }
}

/** Vista previa sin persistir (para formularios). */
export async function previewEventImage(input: EventImageInput): Promise<EventImageResult> {
  try {
    return await withTimeout(resolveRemoteImageUrl(input), TIMEOUT_MS, 'event-image-preview');
  } catch {
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
