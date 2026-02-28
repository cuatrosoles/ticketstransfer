/**
 * Rutas públicas de Mercado Pago (Checkout API).
 * La Public Key se usa en el cliente para tokenizar tarjetas.
 */

import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMercadoPagoPublicKey } from '../lib/mercadopago.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

/** Obtener Public Key para tokenización en cliente (WebView, etc.) */
router.get('/public-key', async (_req, res) => {
  try {
    const publicKey = await getMercadoPagoPublicKey();
    res.json({ publicKey });
  } catch (e) {
    res.status(503).json({ error: 'Mercado Pago no configurado' });
  }
});

/** Página HTML para tokenizar tarjeta (WebView en app móvil) */
router.get('/card-form', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'card-form.html'));
});

export const mercadopagoRouter = router;
