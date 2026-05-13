/**
 * Detección automática de zonas sensibles en capturas de tickets:
 * 1) Códigos QR (jsQR, varias escalas e inversiones; varios QR por imagen).
 * 2) Texto con datos de contacto / identificación (Tesseract spa+eng + heurísticas AR).
 * Se fusionan las regiones y, al final, las heurísticas globales de `FALLBACK_PIXELATE_REGIONS`.
 */

import { Jimp } from 'jimp';
import type { QRCode } from 'jsqr';
import * as JsQrPkg from 'jsqr';
import { createWorker, OEM, PSM } from 'tesseract.js';
import type { PixelateRegion } from './image-redaction.js';
import { FALLBACK_PIXELATE_REGIONS } from './image-redaction.js';

const jsQR = (JsQrPkg as unknown as { default: (d: Uint8ClampedArray, w: number, h: number, o?: object) => QRCode | null })
  .default;
type Bbox = { x0: number; y0: number; x1: number; y1: number };

const QR_OUTER_PAD = 0.09;
const TEXT_WORD_PAD_FRAC = 0.02;
const TEXT_LINE_PAD_FRAC = 0.012;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function normToPixels(r: PixelateRegion, W: number, H: number): { x: number; y: number; w: number; h: number } {
  const x = Math.floor(clamp01(r.x) * W);
  const y = Math.floor(clamp01(r.y) * H);
  const w = Math.max(8, Math.floor(clamp01(r.width) * W));
  const h = Math.max(8, Math.floor(clamp01(r.height) * H));
  return {
    x,
    y,
    w: Math.min(W - x, w),
    h: Math.min(H - y, h),
  };
}

function fillWhiteRect(
  img: {
    bitmap: { width: number; height: number; data: Buffer };
    setPixelColor(hex: number, x: number, y: number): unknown;
  },
  box: { x: number; y: number; w: number; h: number }
): void {
  const xmax = Math.min(img.bitmap.width, box.x + box.w);
  const ymax = Math.min(img.bitmap.height, box.y + box.h);
  for (let y = Math.max(0, box.y); y < ymax; y++) {
    for (let x = Math.max(0, box.x); x < xmax; x++) {
      img.setPixelColor(0xffffffff, x, y);
    }
  }
}

function qrLocationToRegion(loc: QRCode['location'], w: number, h: number): PixelateRegion {
  const pts = [loc.topLeftCorner, loc.topRightCorner, loc.bottomRightCorner, loc.bottomLeftCorner];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const bw = (maxX - minX) / w + QR_OUTER_PAD;
  const bh = (maxY - minY) / h + QR_OUTER_PAD * 0.85;
  const px = Math.max(0, minX / w - QR_OUTER_PAD * 0.35);
  const py = Math.max(0, minY / h - QR_OUTER_PAD * 0.35);
  return {
    x: px,
    y: py,
    width: Math.min(1 - px, bw),
    height: Math.min(1 - py, bh),
  };
}

async function tryDecodeOneQr(buf: Buffer): Promise<{ region: PixelateRegion; blanked: Buffer } | null> {
  const raw = await Jimp.read(buf);
  const maxDims = [2600, 2000, 1600, 1200, 900];
  const seen = new Set<string>();
  for (const maxDim of maxDims) {
    const im = raw.clone();
    const scaled =
      Math.max(im.bitmap.width, im.bitmap.height) > maxDim ? im.scaleToFit({ w: maxDim, h: maxDim }) : im;
    const key = `${scaled.bitmap.width}x${scaled.bitmap.height}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const w = scaled.bitmap.width;
    const h = scaled.bitmap.height;
    const code = jsQR(new Uint8ClampedArray(scaled.bitmap.data), w, h, { inversionAttempts: 'attemptBoth' });
    if (code?.location) {
      const region = qrLocationToRegion(code.location, w, h);
      const full = await Jimp.read(buf);
      const box = normToPixels(region, full.bitmap.width, full.bitmap.height);
      fillWhiteRect(full, box);
      const blanked = Buffer.from(
        await (full as unknown as { getBuffer(m: 'image/jpeg', o?: { quality?: number }): Promise<Buffer> }).getBuffer(
          'image/jpeg',
          { quality: 92 }
        )
      );
      return { region, blanked };
    }
  }
  return null;
}

/** Detecta uno o más códigos QR (iterando en blanco tras cada detección). */
export async function detectQrRegions(buffer: Buffer): Promise<PixelateRegion[]> {
  const regions: PixelateRegion[] = [];
  let work = Buffer.from(buffer);
  for (let i = 0; i < 8; i++) {
    const next = await tryDecodeOneQr(work);
    if (!next) break;
    regions.push(next.region);
    work = Buffer.from(next.blanked as Buffer);
  }
  return regions;
}

const RE_EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
/** CUIT/CUIL con separadores opcionales (se valida dígito verificador aparte). */
const RE_CUIT_CUIL = /\b(\d{2})[\s.-]?(\d{8})[\s.-]?(\d{1})\b/;
/** Teléfonos AR: fijo CABA/GBA o celular con 9 + código de área + 8 dígitos (evita cadenas genéricas de “orden”). */
const RE_PHONE_AR = new RegExp(
  [
    String.raw`\+54\s*9\s*(?:11|2\d{2}|3\d{2}|38[05])\s*[\s.-]?\d{4}\s*[\s.-]?\d{4}`,
    String.raw`54\s*9\s*(?:11|2\d{2}|3\d{2}|38[05])\s*[\s.-]?\d{4}\s*[\s.-]?\d{4}`,
    String.raw`\b0?11\s*[\s.-]?\d{4}\s*[\s.-]?\d{4}\b`,
    String.raw`\b0?15\s*[\s.-]?\d{4}\s*[\s.-]?\d{4}\b`,
    String.raw`\b9\s*(?:11|15|2\d{2}|3\d{2}|38[05])\s*[\s.-]?\d{4}\s*[\s.-]?\d{4}\b`,
  ].join('|'),
  'i'
);
/** DNI típico con separadores (OCR); evita bloques de 7–8 dígitos solos (referencias de compra). */
const RE_DNI_FORMATTED = /\b\d{1,2}[.\s]\d{3}[.\s]\d{3}\b/;
const RE_DNI_LABELED = /\b(?:dni|documento|doc\.?)\s*[:\s.-]?\s*\d{6,8}\b/i;

function allSameChar(s: string): boolean {
  if (s.length === 0) return false;
  const c = s[0];
  return [...s].every((ch) => ch === c);
}

/** Dígito verificador CUIT/CUIL (11 dígitos, sin guiones). */
function isValidCuitCuil11(clean: string): boolean {
  if (!/^\d{11}$/.test(clean) || allSameChar(clean)) return false;
  const mult = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]!, 10) * mult[i]!;
  const mod = sum % 11;
  const verifier = mod === 0 ? 0 : mod === 1 ? 9 : 11 - mod;
  return verifier === parseInt(clean[10]!, 10);
}

function extractCuit11(t: string): string | null {
  const m = t.match(RE_CUIT_CUIL);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}`;
}

/** Línea de comprobante / orden / folio de ticketera: no pixelar entera por palabras sueltas tipo “orden”. */
function lineLooksLikeTicketCommerceRef(t: string): boolean {
  if (!/\d/.test(t)) return false;
  const low = t.toLowerCase();
  return (
    /\b(?:orden\s*(?:de\s*)?(?:compra|venta|n|#)?|pedido\s*n|n[°º]?\s*(?:orden|pedido|op\.?)|comprobante|folio\s|id\s*(?:de\s*)?(?:compra|pedido|trans)|ref\.?\s*(?:compra|pago|oper)|transacci[oó]n|operaci[oó]n|nro\.?\s*(?:orden|oper|ticket))\b/i.test(
      low
    ) && /\d{4,}/.test(t)
  );
}

function wordLooksSensitive(text: string): boolean {
  const t = text.trim();
  if (t.length < 4) return false;
  if (lineLooksLikeTicketCommerceRef(t)) return false;

  if (RE_EMAIL.test(t)) return true;

  const cuit11 = extractCuit11(t);
  if (cuit11 && isValidCuitCuil11(cuit11)) return true;

  const cbuCompact = t.replace(/\s/g, '');
  const cbuMatch = cbuCompact.match(/\d{22}/);
  if (cbuMatch && !allSameChar(cbuMatch[0])) return true;

  if (RE_PHONE_AR.test(t)) return true;

  if (RE_DNI_LABELED.test(t) || RE_DNI_FORMATTED.test(t)) return true;

  return false;
}

function lineLooksSensitive(text: string): boolean {
  const t = text.trim();
  if (t.length < 6) return false;
  if (lineLooksLikeTicketCommerceRef(t)) return false;

  const low = t.toLowerCase();
  if (RE_EMAIL.test(t)) return true;
  const cuit11 = extractCuit11(t);
  if (cuit11 && isValidCuitCuil11(cuit11)) return true;

  if (
    /\bcalle\b|av\.?\s|avenida|\bavda\b|domicilio|direcci[oó]n|\blocalidad\b|\bprov\.?\b|\bprovincia\b|\bcp\b|c\.p\.|cod\.?\s*postal|tel[ée]fono|\btel\.|\bcel\.|celular|whatsapp|\bwsp\b|\bcuit\b|\bcuil\b|\bdni\b|documento|\bcbu\b|\bcvu\b|\bmail\b|\bcorreo\b/.test(
      low
    )
  ) {
    return true;
  }
  return false;
}

function bboxToRegion(bbox: Bbox, iw: number, ih: number, padFrac: number): PixelateRegion {
  const bw = bbox.x1 - bbox.x0;
  const bh = bbox.y1 - bbox.y0;
  const px = Math.max(0, bbox.x0 / iw - padFrac);
  const py = Math.max(0, bbox.y0 / ih - padFrac);
  const pw = Math.min(1 - px, bw / iw + 2 * padFrac);
  const ph = Math.min(1 - py, bh / ih + 2 * padFrac);
  return { x: px, y: py, width: Math.max(0.02, pw), height: Math.max(0.02, ph) };
}

function rectsOverlap(a: PixelateRegion, b: PixelateRegion): boolean {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  return a.x < bx2 && b.x < ax2 && a.y < by2 && b.y < ay2;
}

function mergeTwo(a: PixelateRegion, b: PixelateRegion): PixelateRegion {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const x2 = Math.max(a.x + a.width, b.x + b.width);
  const y2 = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: x2 - x, height: y2 - y };
}

export function mergePixelateRegions(regions: PixelateRegion[]): PixelateRegion[] {
  let list = regions
    .map((r) => ({
      x: clamp01(r.x),
      y: clamp01(r.y),
      width: clamp01(r.width),
      height: clamp01(r.height),
    }))
    .filter((r) => r.width >= 0.008 && r.height >= 0.008);

  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (rectsOverlap(list[i], list[j])) {
          const m = mergeTwo(list[i], list[j]);
          list = [m, ...list.filter((_, k) => k !== i && k !== j)];
          changed = true;
          break outer;
        }
      }
    }
  }
  return list;
}

type TessWorker = Awaited<ReturnType<typeof createWorker>>;

let ocrWorkerPromise: Promise<TessWorker> | null = null;
let ocrTail: Promise<unknown> = Promise.resolve();

function enqueueOcr<T>(fn: () => Promise<T>): Promise<T> {
  const run = ocrTail.then(fn);
  ocrTail = run.catch(() => {});
  return run;
}

async function getOcrWorker(): Promise<TessWorker> {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = createWorker('spa+eng', OEM.LSTM_ONLY, {
      logger: () => {},
    });
  }
  return ocrWorkerPromise;
}

function collectWordsAndLines(page: {
  blocks?: { paragraphs?: { lines?: { text: string; bbox: Bbox; words?: { text: string; bbox: Bbox }[] }[] }[] }[] | null;
}): { words: { text: string; bbox: Bbox }[]; lines: { text: string; bbox: Bbox }[] } {
  const words: { text: string; bbox: Bbox }[] = [];
  const lines: { text: string; bbox: Bbox }[] = [];
  for (const block of page.blocks ?? []) {
    for (const para of block.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        lines.push({ text: line.text, bbox: line.bbox });
        for (const w of line.words ?? []) {
          words.push({ text: w.text, bbox: w.bbox });
        }
      }
    }
  }
  return { words, lines };
}

export async function detectSensitiveTextRegions(buffer: Buffer): Promise<PixelateRegion[]> {
  return enqueueOcr(async () => {
    const regions: PixelateRegion[] = [];
    const img = await Jimp.read(buffer);
    const maxOcr = 2400;
    const scaled =
      Math.max(img.bitmap.width, img.bitmap.height) > maxOcr
        ? img.clone().scaleToFit({ w: maxOcr, h: maxOcr })
        : img.clone();
    const iw = scaled.bitmap.width;
    const ih = scaled.bitmap.height;
    const jpeg = await (scaled as unknown as { getBuffer(m: 'image/jpeg', o?: { quality?: number }): Promise<Buffer> }).getBuffer(
      'image/jpeg',
      { quality: 88 }
    );

    const worker = await getOcrWorker();
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });

    const { data } = await worker.recognize(jpeg, {}, { blocks: true });
    const { words, lines } = collectWordsAndLines(data);

    for (const w of words) {
      if (wordLooksSensitive(w.text)) {
        regions.push(bboxToRegion(w.bbox, iw, ih, TEXT_WORD_PAD_FRAC));
      }
    }
    for (const ln of lines) {
      if (lineLooksSensitive(ln.text)) {
        regions.push(bboxToRegion(ln.bbox, iw, ih, TEXT_LINE_PAD_FRAC));
      }
    }
    return regions;
  });
}

/** Regiones finales: QR + OCR + fallback heurístico, fusionadas. */
export async function buildRedactionRegionsForBuffer(buffer: Buffer): Promise<PixelateRegion[]> {
  const [qr, text] = await Promise.all([
    detectQrRegions(buffer).catch((e) => {
      console.warn('[image-redaction] detección QR:', e);
      return [] as PixelateRegion[];
    }),
    detectSensitiveTextRegions(buffer).catch((e) => {
      console.warn('[image-redaction] OCR / texto sensible:', e);
      return [] as PixelateRegion[];
    }),
  ]);
  return mergePixelateRegions([...qr, ...text, ...FALLBACK_PIXELATE_REGIONS]);
}
