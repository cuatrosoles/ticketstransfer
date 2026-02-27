/**
 * Configuración de Firebase para el panel admin.
 * Requiere VITE_FIREBASE_* en las variables de entorno al hacer build.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase no configurado. Definí VITE_FIREBASE_API_KEY y VITE_FIREBASE_PROJECT_ID en Railway.');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
