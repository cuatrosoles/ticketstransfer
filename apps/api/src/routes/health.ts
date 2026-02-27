/**
 * Health check para la API - Firestore.
 */

import { Router } from 'express';
import { getFirebaseAdmin } from '../lib/firebase-admin.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    getFirebaseAdmin(); // Inicializa Firebase si no está
    res.json({ status: 'ok', db: 'firestore' });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});
