/**
 * Firebase Admin SDK - Inicialización y exportación.
 * Requiere GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON en .env
 */

import admin from 'firebase-admin';

let app: admin.app.App;

function initFirebase() {
  if (admin.apps.length > 0) {
    app = admin.app() as admin.app.App;
    return app;
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const jsonCred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (jsonCred) {
    try {
      const cred = JSON.parse(jsonCred) as admin.ServiceAccount;
      const bucket = process.env.FIREBASE_STORAGE_BUCKET;
      app = admin.initializeApp({
        credential: admin.credential.cert(cred),
        ...(bucket && { storageBucket: bucket }),
      });
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT_JSON inválido:', e);
      throw new Error('Configuración de Firebase inválida');
    }
  } else if (credPath) {
    const bucket = process.env.FIREBASE_STORAGE_BUCKET;
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      ...(bucket && { storageBucket: bucket }),
    });
  } else {
    throw new Error(
      'Firebase no configurado. Definí GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON) o FIREBASE_SERVICE_ACCOUNT_JSON (contenido JSON).'
    );
  }

  return app;
}

export function getFirebaseAdmin() {
  if (!app) initFirebase();
  return admin;
}

export function getAuth() {
  return getFirebaseAdmin().auth();
}

export function getFirestore() {
  return getFirebaseAdmin().firestore();
}

export function getStorage() {
  return getFirebaseAdmin().storage();
}

export function getMessaging() {
  return getFirebaseAdmin().messaging();
}
