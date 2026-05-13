/**
 * Redacción de imágenes para tickets: pixelado de zonas sensibles (QR, nombres, etc.).
 * Fase 1: regiones fijas por defecto. Fase 2: regiones opcionales enviadas por el cliente (normalizadas 0-1).
 */

import { Jimp } from 'jimp';

/** Región normalizada (0-1): x, y = esquina superior izquierda; width, height = tamaño relativo a la imagen */
export type PixelateRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Regiones heurísticas (fallback) cuando la detección automática no aporta suficiente cobertura.
 * Valores en 0-1 respecto del ancho/alto de la imagen.
 */
export const FALLBACK_PIXELATE_REGIONS: PixelateRegion[] = [
  { x: 0.7, y: 0, width: 0.3, height: 0.28 },
  { x: 0.08, y: 0.35, width: 0.84, height: 0.18 },
  { x: 0.08, y: 0.58, width: 0.84, height: 0.12 },
];

/** @deprecated Usar FALLBACK_PIXELATE_REGIONS */
const DEFAULT_REGIONS = FALLBACK_PIXELATE_REGIONS;

const PIXELATE_BLOCK_SIZE = 12;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Convierte región normalizada (0-1) a píxeles y aplica límites dentro de la imagen.
 */
function toPixelRegion(
  region: PixelateRegion,
  imgWidth: number,
  imgHeight: number
): { x: number; y: number; w: number; h: number } {
  const x = Math.floor(clamp01(region.x) * imgWidth);
  const y = Math.floor(clamp01(region.y) * imgHeight);
  const w = Math.max(8, Math.floor(clamp01(region.width) * imgWidth));
  const h = Math.max(8, Math.floor(clamp01(region.height) * imgHeight));
  const x2 = Math.min(imgWidth, x + w);
  const y2 = Math.min(imgHeight, y + h);
  return {
    x,
    y,
    w: x2 - x,
    h: y2 - y,
  };
}

/**
 * Redacta (pixelar) zonas sensibles de una imagen.
 * @param buffer - Buffer de la imagen (JPEG/PNG)
 * @param options - Regiones opcionales normalizadas (0-1). Si no se pasan, se usan DEFAULT_REGIONS.
 * @returns Buffer de la imagen redactada en JPEG (para consistencia y menor tamaño).
 */
export async function redactImage(
  buffer: Buffer,
  options?: { regions?: PixelateRegion[] }
): Promise<{ buffer: Buffer; mimeType: string }> {
  const image = await Jimp.read(buffer);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  const regions = (options?.regions && options.regions.length > 0)
    ? options.regions
    : DEFAULT_REGIONS;

  for (const region of regions) {
    const { x, y, w: rw, h: rh } = toPixelRegion(region, w, h);
    if (rw > 0 && rh > 0) {
      image.pixelate({ size: PIXELATE_BLOCK_SIZE, x, y, w: rw, h: rh });
    }
  }

  const outBuffer = await image.getBuffer('image/jpeg', { quality: 90 });
  return { buffer: Buffer.from(outBuffer), mimeType: 'image/jpeg' };
}

/**
 * Parsea el cuerpo de la petición: pixelateRegions puede venir como string JSON (multipart).
 */
export function parsePixelateRegionsFromBody(body: Record<string, unknown>): PixelateRegion[] | undefined {
  const raw = body.pixelateRegions ?? body.pixelate_regions;
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    return raw.filter(
      (r): r is PixelateRegion =>
        r != null &&
        typeof r === 'object' &&
        typeof (r as PixelateRegion).x === 'number' &&
        typeof (r as PixelateRegion).y === 'number' &&
        typeof (r as PixelateRegion).width === 'number' &&
        typeof (r as PixelateRegion).height === 'number'
    ) as PixelateRegion[];
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return undefined;
      return parsed.filter(
        (r): r is PixelateRegion =>
          r != null &&
          typeof r === 'object' &&
          typeof (r as PixelateRegion).x === 'number' &&
          typeof (r as PixelateRegion).y === 'number' &&
          typeof (r as PixelateRegion).width === 'number' &&
          typeof (r as PixelateRegion).height === 'number'
      ) as PixelateRegion[];
    } catch {
      return undefined;
    }
  }
  return undefined;
}
