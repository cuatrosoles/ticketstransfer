/**
 * Firebase Storage - Subida de archivos (avatars, tickets, KYC, evidencia).
 * Fallback local cuando STORAGE_FALLBACK=local (útil si Firebase billing está deshabilitado).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { getStorage } from './firebase-admin.js';
import { uploadsDir, ensureUploadsDir } from './uploads.js';

/** Tipo del bucket inferido para evitar conflicto CJS/ESM de @google-cloud/storage en Vercel. */
type StorageBucket = ReturnType<ReturnType<typeof getStorage>['bucket']>;

const PLACEHOLDER_BUCKET = 'tu-proyecto.appspot.com';
// En Vercel no hay disco persistente; no usar fallback local.
const USE_LOCAL = !process.env.VERCEL && process.env.STORAGE_FALLBACK === 'local';

function resolveBucketName(): string {
  const env = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (env && env !== PLACEHOLDER_BUCKET) return env;

  const storage = getStorage();
  const opts = storage.app.options as { storageBucket?: string; projectId?: string };
  if (opts.storageBucket && opts.storageBucket !== PLACEHOLDER_BUCKET) return opts.storageBucket;

  const projectId = opts.projectId || process.env.GCLOUD_PROJECT;
  if (projectId) {
    return `${projectId}.firebasestorage.app`;
  }

  throw new Error(
    'FIREBASE_STORAGE_BUCKET no configurado. Definilo en .env con el bucket real (ej: tu-proyecto.firebasestorage.app)'
  );
}

export function getStorageBucket(): StorageBucket {
  const storage = getStorage();
  const bucketName = resolveBucketName();
  return storage.bucket(bucketName);
}

/** Guarda en disco local y devuelve URL pública (APP_URL/uploads/...) */
async function uploadFileLocal(filePath: string, buffer: Buffer): Promise<string> {
  ensureUploadsDir();
  const fullPath = path.join(uploadsDir, filePath);
  const dir = path.dirname(fullPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, buffer);
  const baseUrl = (process.env.APP_URL || 'http://localhost:3001').replace(/\/$/, '');
  return `${baseUrl}/uploads/${filePath}`;
}

export async function uploadFile(
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (USE_LOCAL) {
    return uploadFileLocal(filePath, buffer);
  }

  try {
    const bucket = getStorageBucket();
    const file = bucket.file(filePath);
    await file.save(buffer, { metadata: { contentType } });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const full = typeof err === 'object' && err !== null ? JSON.stringify(err) : msg;
    const isBillingOrBucket = /403|404|accountDisabled|bucket does not exist|billing.*disabled|delinquent/i.test(msg + full);
    if (isBillingOrBucket && USE_LOCAL) {
      console.warn('Firebase Storage falló (billing/bucket). Usando almacenamiento local:', msg);
      return uploadFileLocal(filePath, buffer);
    }
    if (isBillingOrBucket && process.env.VERCEL) {
      console.error('En Vercel se requiere Firebase Storage. No se puede usar fallback local.');
    }
    throw err;
  }
}

export async function uploadFromStream(
  path: string,
  stream: NodeJS.ReadableStream,
  contentType: string
): Promise<string> {
  const bucket = getStorageBucket();
  const file = bucket.file(path);
  const writeStream = file.createWriteStream({
    metadata: { contentType },
  });
  return new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${bucket.name}/${path}`);
    });
    writeStream.on('error', reject);
  });
}
