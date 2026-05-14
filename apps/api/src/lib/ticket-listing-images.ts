/**
 * Sube original sin modificar y versión pública redactada (en Vercel: solo QRs detectados con jsQR; original intacto).
 */

import type { Express } from 'express';
import { uploadFile } from './firebase-storage.js';
import { redactImage } from './image-redaction.js';
import { buildRedactionRegionsForBuffer } from './image-sensitive-detection.js';

export async function storeListingCaptureWithRedaction(
  listingId: string,
  kind: 'ticket' | 'ownership',
  file: Express.Multer.File
): Promise<{ originalUrl: string; redactedUrl: string }> {
  const ts = Date.now();
  const mime = file.mimetype || 'image/jpeg';
  const ext = /png/i.test(mime) ? 'png' : 'jpg';
  const base = kind === 'ticket' ? 'capture_ticket' : 'capture_ownership';
  const originalUrl = await uploadFile(
    `tickets/${listingId}/${base}_original_${ts}.${ext}`,
    file.buffer,
    mime
  );
  const regions = await buildRedactionRegionsForBuffer(file.buffer);
  const { buffer: redactedBuf, mimeType } = await redactImage(file.buffer, { regions });
  const redactedUrl = await uploadFile(
    `tickets/${listingId}/${base}_public_${ts}.jpg`,
    redactedBuf,
    mimeType
  );
  return { originalUrl, redactedUrl };
}
