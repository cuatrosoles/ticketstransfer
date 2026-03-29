/**
 * Rutas de usuarios: perfil, onboarding, KYC, tarjetas adheridas.
 * Firestore + Firebase Storage + Mercado Pago Customers API.
 */

import { Router } from 'express';
import multer from 'multer';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { getAuth } from '../lib/firebase-admin.js';
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
import { getPlatformSettings, invalidateSettingsCache } from '../lib/settings.js';

const MSG_CREDENTIALES_TEST =
  'Usá credenciales de PRUEBA (Test) en Mercado Pago. Las credenciales de producción no funcionan con tarjetas de test. Verificá: 1) platformSettings/main en Firestore tiene accessToken y publicKey de prueba. 2) En Railway, eliminá MERCADOPAGO_ACCESS_TOKEN y MERCADOPAGO_PUBLIC_KEY si existen (la API usa Firestore cuando están en Admin).';

function isLiveCredentialsError(e: unknown): boolean {
  const cause = (e as { cause?: unknown })?.cause;
  const list = Array.isArray(cause) ? cause : (cause as { body?: { cause?: unknown } })?.body?.cause;
  if (!Array.isArray(list)) return false;
  return list.some(
    (c: { code?: string; description?: string }) =>
      c?.code === '300' || c?.description?.toLowerCase().includes('live credentials')
  );
}

/** Extrae mensaje de error de respuestas Mercado Pago (SDK suele anidar en cause/body) */
function extractMpError(e: unknown): string | null {
  const err = e as {
    cause?: unknown;
    message?: string;
  };
  const cause = err?.cause;
  const causeList = Array.isArray(cause) ? cause : (cause as { body?: { cause?: unknown } })?.body?.cause;
  if (Array.isArray(causeList)) {
    const code300 = causeList.find(
      (c: { code?: string; description?: string }) =>
        c?.code === '300' || c?.description?.toLowerCase().includes('live credentials')
    );
    if (code300) return MSG_CREDENTIALES_TEST;
  }
  const body = (cause as { body?: { message?: string; cause?: unknown[] } })?.body;
  const fromBody = body?.message;
  const fromCause = (cause as { message?: string })?.message;
  const fromMsg = err?.message;
  return (fromBody || fromCause || fromMsg) ?? null;
}

const router = Router();

/** Fecha de nacimiento desde Firestore / JSON para el cliente (YYYY-MM-DD o null) */
function profileDateOfBirthToApi(val: unknown): string | null {
  if (val == null) return null;
  if (val instanceof Date && !Number.isNaN(val.getTime())) return val.toISOString().slice(0, 10);
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const ts = val as { toDate?: () => Date; seconds?: number; _seconds?: number };
  if (typeof ts.toDate === 'function') {
    const d = ts.toDate();
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const sec = ts.seconds ?? ts._seconds;
  if (typeof sec === 'number') {
    const d = new Date(sec * 1000);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  return null;
}

function profileAddressToApi(data: Record<string, unknown>): string | null {
  const direct =
    typeof data.address === 'string'
      ? data.address.trim()
      : typeof data.domicilio === 'string'
        ? data.domicilio.trim()
        : '';
  if (direct) return direct;
  const parts = [data.street, data.streetNumber, data.calle, data.altura]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireAuth);

router.get('/profile', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const [userDoc, kycDoc, firebaseUser] = await Promise.all([
    db().collection(COLLECTIONS.USERS).doc(userId).get(),
    db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).get(),
    getAuth().getUser(userId).catch(() => null),
  ]);
  if (!userDoc.exists) return res.status(404).json({ error: 'No encontrado' });
  let data = userDoc.data()!;

  if (!data.numeroId) {
    const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
    await db().collection(COLLECTIONS.USERS).doc(userId).update({ numeroId, updatedAt: new Date() });
    data = { ...data, numeroId };
  }

  const kyc = kycDoc.exists ? kycDoc.data() : null;
  const phone = data.phone?.replace(/\+549\s*\+549/, '+549') ?? data.phone;
  const emailVerified = data.emailVerified ?? firebaseUser?.emailVerified ?? false;
  const raw = data as Record<string, unknown>;

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
    emailVerified,
    dateOfBirth: profileDateOfBirthToApi(data.dateOfBirth),
    city: data.city ?? null,
    province: data.province ?? null,
    postalCode: data.postalCode ?? null,
    address: profileAddressToApi(raw),
    reputationScore: data.reputationScore ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    cbuCvu: data.cbuCvu ?? null,
    bankName: data.bankName ?? null,
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

  const { sendVerificationSms } = await import('../lib/sms.js');
  const result = await sendVerificationSms(phone, code);

  if (!result.ok) {
    console.error('[SMS] Error al enviar código:', result.error);
    res.status(500).json({ error: 'Error al enviar el SMS. Intentá de nuevo.' });
    return;
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
  const { username, firstName, lastName, phone, city, province, postalCode, address, domicilio, fcmToken, cbuCvu, bankName } = body;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (city !== undefined) updateData.city = city;
  if (province !== undefined) updateData.province = province;
  if (postalCode !== undefined) updateData.postalCode = postalCode;
  if (address !== undefined || domicilio !== undefined) {
    const raw =
      typeof address === 'string'
        ? address
        : typeof domicilio === 'string'
          ? domicilio
          : '';
    updateData.address = raw.trim() || null;
  }
  if (fcmToken !== undefined) updateData.fcmToken = fcmToken;
  if (cbuCvu !== undefined) {
    const val = typeof cbuCvu === 'string' ? cbuCvu.replace(/\D/g, '').trim() || null : null;
    updateData.cbuCvu = val && val.length === 22 ? val : null;
  }
  if (bankName !== undefined) updateData.bankName = typeof bankName === 'string' ? bankName.trim() || null : null;

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
    const updates: Record<string, string | Date> = { status: 'EN_REVISION', updatedAt: new Date() };

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
  const doList = async () => {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
    const userData = userDoc.data();
    const email = userData?.email;
    if (!email || typeof email !== 'string') {
      throw new Error('Usuario sin email');
    }
    const settings = await getPlatformSettings();
    let customerId = userData?.mpCustomerId as string | undefined;
    if (!customerId) {
      customerId = await getOrCreateCustomer(req.user!.id, email, settings.mercadopago.sandboxMode);
      await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
        mpCustomerId: customerId,
        updatedAt: new Date(),
      });
    }
    return listCustomerCards(customerId);
  };
  try {
    const cards = await doList();
    res.json({ cards });
  } catch (e) {
    if (e instanceof Error && e.message === 'Usuario sin email') {
      return res.status(400).json({ error: e.message });
    }
    if (isLiveCredentialsError(e)) {
      invalidateSettingsCache();
      try {
        const cards = await doList();
        return res.json({ cards });
      } catch (retryErr) {
        const msg = retryErr instanceof Error && retryErr.message === 'Usuario sin email'
          ? retryErr.message
          : (extractMpError(retryErr) || MSG_CREDENTIALES_TEST);
        if (retryErr instanceof Error && retryErr.message === 'Usuario sin email') {
          return res.status(400).json({ error: msg });
        }
        console.error('[GET /cards] retry failed:', retryErr);
        return res.status(500).json({ error: msg });
      }
    }
    const msg = extractMpError(e) || (e instanceof Error ? e.message : 'Error al listar tarjetas');
    console.error('[GET /cards]', e);
    res.status(500).json({ error: msg });
  }
});

router.post('/cards', async (req: AuthRequest, res) => {
  const token = typeof req.body?.token === 'string' ? req.body.token.trim() : null;
  if (!token) {
    return res.status(400).json({ error: 'Token de tarjeta requerido' });
  }
  const doAdd = async () => {
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
    const userData = userDoc.data();
    const email = userData?.email;
    if (!email || typeof email !== 'string') {
      throw new Error('Usuario sin email');
    }
    const settings = await getPlatformSettings();
    const customerId = await getOrCreateCustomer(req.user!.id, email, settings.mercadopago.sandboxMode);
    await db().collection(COLLECTIONS.USERS).doc(req.user!.id).update({
      mpCustomerId: customerId,
      updatedAt: new Date(),
    });
    return addCardToCustomer(customerId, token);
  };
  try {
    const card = await doAdd();
    res.status(201).json({ card });
  } catch (e) {
    if (e instanceof Error && e.message === 'Usuario sin email') {
      return res.status(400).json({ error: e.message });
    }
    if (isLiveCredentialsError(e)) {
      invalidateSettingsCache();
      try {
        const card = await doAdd();
        return res.status(201).json({ card });
      } catch (retryErr) {
        if (retryErr instanceof Error && retryErr.message === 'Usuario sin email') {
          return res.status(400).json({ error: retryErr.message });
        }
        const msg = extractMpError(retryErr) || MSG_CREDENTIALES_TEST;
        console.error('[POST /cards] retry failed:', retryErr);
        return res.status(500).json({ error: msg });
      }
    }
    const msg = extractMpError(e) || (e instanceof Error ? e.message : 'Error al agregar tarjeta');
    console.error('[POST /cards]', e);
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
