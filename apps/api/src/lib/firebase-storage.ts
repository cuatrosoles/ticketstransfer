/**
 * Firebase Storage - Subida de archivos (avatars, tickets, KYC, evidencia).
 */

import { getStorage } from './firebase-admin.js';
import type { Bucket } from '@google-cloud/storage';

const PLACEHOLDER_BUCKET = 'tu-proyecto.appspot.com';

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

export function getStorageBucket(): Bucket {
  const storage = getStorage();
  const bucketName = resolveBucketName();
  return storage.bucket(bucketName);
}

export async function uploadFile(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const bucket = getStorageBucket();
  const file = bucket.file(path);
  await file.save(buffer, { metadata: { contentType } });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
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
