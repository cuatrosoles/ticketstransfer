/**
 * Firebase Storage - Subida de archivos (avatars, tickets, KYC, evidencia).
 */

import { getStorage } from './firebase-admin.js';
import type { Bucket } from '@google-cloud/storage';

const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || '';

export function getStorageBucket(): Bucket {
  const storage = getStorage();
  const bucketName = BUCKET_NAME || (storage.app.options as { storageBucket?: string }).storageBucket;
  if (!bucketName) {
    throw new Error('FIREBASE_STORAGE_BUCKET no configurado. Definilo en .env');
  }
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
