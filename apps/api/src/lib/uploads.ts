/**
 * Configuración de directorio de uploads.
 * En Railway: usar un Volume montado en /app/uploads y definir UPLOADS_PATH=/app/uploads
 * para que los archivos persistan entre despliegues.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const uploadsDir =
  process.env.UPLOADS_PATH ||
  process.env.RAILWAY_VOLUME_MOUNT_PATH ||
  path.join(__dirname, '..', 'uploads');

export function ensureUploadsDir(): void {
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
}
