/**
 * Rutas de usuarios: perfil, onboarding, KYC, tarjetas adheridas.
 * Firestore + Firebase Storage + Mercado Pago Customers API.
 */

import { Router } from 'express';
import multer from 'multer';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { uploadFile } from '../lib/firebase-storage.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { onboardingSchema } from '@tickets-transfer/shared';
import { createDiditSession } from '../lib/didit.js';
import {
  getOrCreateCustomer,
  addCardToCustomer,
  listCustomerCards,
  removeCustomerCard,
} from '../lib/mercadopago.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireAuth);

router.get('/profile', async (req: AuthRequest, res) => {
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  if (!userDoc.exists) return res.status(404).json({ error: 'No encontrado' });
  let data = userDoc.data()!;

  if (!data.numeroId) {
    const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
    await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({ numeroId, updatedAt: new Date() });
    data = { ...data, numeroId };
  }

  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(req.user!.id).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;
  const phone = data.phone?.replace(/\+549\s*\+549/, '+549') ?? data.phone;

  res.json({
    id: req.user!.id,
    email: data.email,
    username: data.username ?? null,
    numeroId: data.numeroId ?? null,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    country: data.country ?? null,
    tipoDocumento: data.tipoDocumento ?? null,
    phone,
    phoneVerified: data.phoneVerified ?? false,
    dateOfBirth: data.dateOfBirth ?? null,
    city: data.city ?? null,
    province: data.province ?? null,
    postalCode: data.postalCode ?? null,
    address: data.address ?? null,
    reputationScore: data.reputationScore ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    kyc: kyc ? { status: kyc.status, rejectionReason: kyc.rejectionReason ?? null } : { status: 'PENDIENTE', rejectionReason: null },
  });
});

router.post('/phone/verify-request', async (req: AuthRequest, res) => {
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : null;
  if (!phone || phone.length < 8) {
    res.status(400).json({ error: 'Número de teléfono requerido' });
    return;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
    phone,
    phoneVerified: false,
    phoneVerificationCode: code,
    phoneVerificationExpires: expiresAt,
    updatedAt: new Date(),
  });
  if (process.env.SMS_PROVIDER === 'twilio' && process.env.TWILIO_ACCOUNT_SID) {
    console.log('[SMS] Código para', phone, ':', code);
  } else {
    console.log('[DEV] Código de verificación para', phone, ':', code);
  }
  res.json({ ok: true, message: 'Código enviado' });
});

router.post('/phone/verify-confirm', async (req: AuthRequest, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : null;
  if (!code || code.length !== 6) {
    res.status(400).json({ error: 'Código de 6 dígitos requerido' });
    return;
  }
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  const data = userDoc.data();
  if (!data?.phoneVerificationCode || !data?.phoneVerificationExpires) {
    res.status(400).json({ error: 'Solicitá primero un código de verificación' });
    return;
  }
  if (new Date() > data.phoneVerificationExpires.toDate()) {
    res.status(400).json({ error: 'El código expiró. Solicitá uno nuevo.' });
    return;
  }
  if (data.phoneVerificationCode !== code) {
    res.status(400).json({ error: 'Código incorrecto' });
    return;
  }
  await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
    phoneVerified: true,
    phoneVerificationCode: null,
    phoneVerificationExpires: null,
    updatedAt: new Date(),
  });
  res.json({ ok: true, phoneVerified: true });
});

router.post('/profile/avatar', upload.single('avatar'), async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No se envió ninguna imagen' });
    return;
  }
  const ext = file.originalname.split('.').pop() || 'jpg';
  const path = `avatars/${req.user!.id}/${Date.now()}.${ext}`;
  const profileImageUrl = await uploadFile(path, file.buffer, file.mimetype || 'image/jpeg');
  await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
    profileImageUrl,
    updatedAt: new Date(),
  });
  res.json({ profileImageUrl });
});

router.patch('/profile', async (req: AuthRequest, res) => {
  const body = req.body || {};
  const { username, firstName, lastName, phone, city, province, postalCode, address, fcmToken } = body;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (city !== undefined) updateData.city = city;
  if (province !== undefined) updateData.province = province;
  if (postalCode !== undefined) updateData.postalCode = postalCode;
  if (address !== undefined) updateData.address = typeof address === 'string' ? address.trim() || null : null;
  if (fcmToken !== undefined) updateData.fcmToken = fcmToken;

  if (username !== undefined) {
    const usernameVal = typeof username === 'string' ? username.trim() : '';
    if (usernameVal) {
      const existing = await db()
        .collection(COLLECTIONS.USERS)
        .where('username', '==', usernameVal)
        .get();
      const takenByOther = existing.docs.some((d) => d.id !== req.user!.id);
      if (takenByOther) {
        res.status(409).json({ error: 'Ya existe un usuario con ese nombre de usuario' });
        return;
      }
    }
    updateData.username = usernameVal || null;
  }

  await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update(updateData);
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  const data = userDoc.data()!;
  res.json({
    id: req.user!.id,
    email: data.email,
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address ?? null,
  });
});

router.post('/onboarding', async (req: AuthRequest, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const { accion, ticketeras, appsBoletos } = parsed.data;

  const ref = db().collection(COLLECTIONS.USER_ONBOARDING).doc(req.user!.id);
  const existing = await ref.get();
  await ref.set(
    {
      userId: req.user!.id,
      accion,
      ticketeras,
      appsBoletos,
      ...(existing.exists ? {} : { createdAt: new Date() }),
      updatedAt: new Date(),
    },
    { merge: true }
  );
  res.json({ ok: true });
});

router.get('/onboarding', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.USER_ONBOARDING).doc(req.user!.id).get();
  if (!doc.exists) return res.json(null);
  const data = doc.data()!;
  res.json({
    id: doc.id,
    userId: data.userId,
    accion: data.accion || [],
    ticketeras: data.ticketeras || [],
    appsBoletos: data.appsBoletos || [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
});

router.post(
  '/kyc/upload',
  upload.fields([
    { name: 'dniFront', maxCount: 1 },
    { name: 'dniBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  async (req: AuthRequest, res) => {
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const uid = req.user!.id;
    const updates: Record<string, string> = { status: 'EN_REVISION', updatedAt: new Date() };

    if (files.dniFront?.[0]) {
      const path = `kyc/${uid}/dni_front_${Date.now()}.jpg`;
      updates.dniFrontUrl = await uploadFile(path, files.dniFront[0].buffer, files.dniFront[0].mimetype || 'image/jpeg');
    }
    if (files.dniBack?.[0]) {
      const path = `kyc/${uid}/dni_back_${Date.now()}.jpg`;
      updates.dniBackUrl = await uploadFile(path, files.dniBack[0].buffer, files.dniBack[0].mimetype || 'image/jpeg');
    }
    if (files.selfie?.[0]) {
      const path = `kyc/${uid}/selfie_${Date.now()}.jpg`;
      updates.selfieUrl = await uploadFile(path, files.selfie[0].buffer, files.selfie[0].mimetype || 'image/jpeg');
    }

    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(uid).set(updates, { merge: true });
    res.json({ ok: true, status: 'EN_REVISION' });
  }
);

router.get('/kyc', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(req.user!.id).get();
  if (!doc.exists) return res.json({ status: 'PENDIENTE' });
  const data = doc.data()!;
  res.json({ status: data.status || 'PENDIENTE', rejectionReason: data.rejectionReason ?? null });
});

router.post('/kyc/session', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const webUrl = process.env.WEB_URL || process.env.APP_URL || 'http://localhost:5173';
  const platform = (req.body?.platform as string) || 'web';

  const callback =
    platform === 'mobile'
      ? 'ticketTransfer://kyc/callback'
      : `${webUrl.replace(/\/$/, '')}/kyc/callback`;

  try {
    const session = await createDiditSession({
      callback,
      vendor_data: userId,
      features: 'OCR + FACE',
    });

    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      { diditSessionId: session.session_id, updatedAt: new Date() },
      { merge: true }
    );

    res.json({ url: session.url, sessionId: session.session_id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al crear sesión Didit';
    res.status(500).json({ error: msg });
  }
});

/** Tarjetas adheridas (Checkout API - Mercado Pago Customers) */
router.get('/cards', async (req: AuthRequest, res) => {
  try {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
    const userData = userDoc.data();
    const email = userData?.email;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Usuario sin email' });
    }
    const customerId = await getOrCreateCustomer(req.user!.id, email);
    if (!userData?.mpCustomerId) {
      await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
        mpCustomerId: customerId,
        updatedAt: new Date(),
      });
    }
    const cards = await listCustomerCards(customerId);
    res.json({ cards });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al listar tarjetas';
    res.status(500).json({ error: msg });
  }
});

router.post('/cards', async (req: AuthRequest, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : null;
  if (!token) {
    return res.status(400).json({ error: 'Token de tarjeta requerido' });
  }
  try {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
    const userData = userDoc.data();
    const email = userData?.email;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Usuario sin email' });
    }
    const customerId = await getOrCreateCustomer(req.user!.id, email);
    if (!userData?.mpCustomerId) {
      await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
        mpCustomerId: customerId,
        updatedAt: new Date(),
      });
    }
    const card = await addCardToCustomer(customerId, token);
    res.status(201).json({ card });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al agregar tarjeta';
    res.status(500).json({ error: msg });
  }
});

router.delete('/cards/:cardId', async (req: AuthRequest, res) => {
  const cardId = req.params.cardId;
  if (!cardId) return res.status(400).json({ error: 'ID de tarjeta requerido' });
  try {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
    const mpCustomerId = userDoc.data()?.mpCustomerId;
    if (!mpCustomerId) {
      return res.status(404).json({ error: 'No tenés tarjetas guardadas' });
    }
    await removeCustomerCard(mpCustomerId, cardId);
    res.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar tarjeta';
    res.status(500).json({ error: msg });
  }
});

export const usersRouter = router;
