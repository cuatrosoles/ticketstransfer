/**
 * Rutas públicas de Mercado Pago (Checkout API).
 * La Public Key se usa en el cliente para tokenizar tarjetas.
 */

import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMercadoPagoPublicKey } from '../lib/mercadopago.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { getPlatformSettings } from '../lib/settings.js';

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

/** Email del payer para el Brick (producción: email real; sandbox: test o real según flags) */
router.get('/payer-email', requireAuth, async (req: AuthRequest, res) => {
  const settings = await getPlatformSettings();
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  const email = userDoc.data()?.email;
  const useRealEmail =
    !settings.mercadopago.sandboxMode || settings.mercadopago.sandboxUseRealEmail;

  if (useRealEmail) {
    if (email && typeof email === 'string') {
      return res.json({ payerEmail: email });
    }
    return res.status(400).json({ error: 'Usuario sin email' });
  }

  res.json({ payerEmail: 'test_payer_1@testuser.com' });
});

/** Página HTML para tokenizar tarjeta (WebView en app móvil) */
router.get('/card-form', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'card-form.html'));
});

export const mercadopagoRouter = router;
