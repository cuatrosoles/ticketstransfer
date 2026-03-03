/**
 * Rutas de autenticación - Firebase Auth.
 * Register: backend crea usuario en Firebase Auth + Firestore, devuelve customToken.
 * Login: se realiza en el cliente con Firebase Auth SDK (signInWithEmailAndPassword).
 */

import { createHash } from 'crypto';
import { Router } from 'express';
import { getAuth } from '../lib/firebase-admin.js';
import { db, COLLECTIONS } from '../lib/firestore.js';

function emailDocId(email: string): string {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex').slice(0, 32);
}
import { registerBodySchema } from '@tickets-transfer/shared';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const parsed = registerBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const {
    email,
    password,
    firstName,
    lastName,
    username,
    country,
    tipoDocumento,
    documentNumber,
    sexo,
    phone,
    phoneAreaCode,
    phonePrefix,
    dateOfBirth,
    city,
    province,
    postalCode,
  } = parsed.data;

  const auth = getAuth();
  const usersRef = db().collection(COLLECTIONS.USERS);

  // Verificar email único
  const existingByEmail = await usersRef.where('email', '==', email).limit(1).get();
  if (!existingByEmail.empty) {
    res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    return;
  }

  if (username) {
    const existingByUsername = await usersRef.where('username', '==', username).limit(1).get();
    if (!existingByUsername.empty) {
      res.status(409).json({ error: 'Ya existe un usuario con ese nombre de usuario' });
      return;
    }
  }

  const fullPhone = phone
    ? [phonePrefix || '+549', phoneAreaCode || '', phone].filter(Boolean).join(' ').trim()
    : null;
  const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

  let firebaseUser;
  try {
    firebaseUser = await auth.createUser({
      email,
      password,
      displayName: [firstName, lastName].filter(Boolean).join(' ').trim() || undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al crear usuario';
    if (msg.includes('email-already-exists')) {
      res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
      return;
    }
    res.status(500).json({ error: msg });
    return;
  }

  const uid = firebaseUser.uid;

  const body = parsed.data as Record<string, unknown>;
  const isAdmin = body.role === 'admin' || body.isAdmin === true;
  const docId = emailDocId(email);
  const verificationDoc = await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).get();
  const verificationData = verificationDoc.data();
  const verifiedAt = verificationData?.verifiedAt as { toDate?: () => Date } | Date | undefined;
  const verifiedDate = verifiedAt?.toDate?.() ?? (verifiedAt ? new Date(verifiedAt as string) : null);
  const emailVerified =
    !!verificationData?.verified &&
    verifiedDate &&
    Date.now() - verifiedDate.getTime() < 15 * 60 * 1000;
  if (emailVerified) {
    await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).delete();
  }

  const normalizedDateOfBirth = dateOfBirth
    ? (() => {
        const s = String(dateOfBirth).trim();
        const match = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (match) {
          const [, d, m, y] = match;
          return new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10));
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s.slice(0, 10));
        return null;
      })()
    : null;

  const userData = {
    email,
    username: username || null,
    numeroId,
    firstName: firstName || null,
    lastName: lastName || null,
    country: country || null,
    tipoDocumento: tipoDocumento || null,
    documentNumber: documentNumber || null,
    sexo: sexo || null,
    phone: fullPhone || phone || null,
    phoneVerified: false,
    dateOfBirth: normalizedDateOfBirth,
    city: city || null,
    province: province || null,
    postalCode: postalCode || null,
    role: isAdmin ? 'admin' : 'user',
    emailVerified: emailVerified || false,
    reputationScore: 0,
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db().collection(COLLECTIONS.USERS).doc(uid).set(userData);
  await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(uid).set({
    userId: uid,
    status: 'PENDIENTE',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const customToken = await auth.createCustomToken(uid);

  res.status(201).json({
    user: {
      id: uid,
      email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
    },
    customToken,
    accessToken: customToken, // Alias para compatibilidad - cliente debe usar signInWithCustomToken
  });
});

/** Enviar código de verificación de email (antes de crear cuenta) */
router.post('/email/send-code', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Email inválido' });
    return;
  }
  const usersRef = db().collection(COLLECTIONS.USERS);
  const existing = await usersRef.where('email', '==', email).limit(1).get();
  if (!existing.empty) {
    res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    return;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const docId = emailDocId(email);
  await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).set({
    email,
    code,
    expiresAt,
    createdAt: new Date(),
  });

  const { sendVerificationCodeEmail } = await import('../lib/email.js');
  const { ok, error: sendError } = await sendVerificationCodeEmail(email, code);
  if (!ok) {
    console.error('[Email] Error:', sendError);
    res.status(500).json({ error: 'Error al enviar el email. Intentá de nuevo.' });
    return;
  }
  res.json({ ok: true, message: 'Código enviado' });
});

/** Verificar código de email (antes de crear cuenta) */
router.post('/email/verify-code', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : null;
  if (!email || !code || code.length !== 6) {
    res.status(400).json({ error: 'Email y código de 6 dígitos requeridos' });
    return;
  }
  const docId = emailDocId(email);
  const doc = await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).get();
  const data = doc.data();
  if (!data || data.email !== email) {
    res.status(400).json({ error: 'Solicitá primero un código de verificación' });
    return;
  }
  const exp = data.expiresAt as { toDate?: () => Date } | Date;
  const expDate = exp?.toDate?.() ?? new Date(exp as string);
  if (new Date() > expDate) {
    res.status(400).json({ error: 'El código expiró. Solicitá uno nuevo.' });
    return;
  }
  if (data.code !== code) {
    res.status(400).json({ error: 'Código incorrecto' });
    return;
  }
  await db().collection(COLLECTIONS.EMAIL_VERIFICATION_CODES).doc(docId).update({
    verifiedAt: new Date(),
    verified: true,
  });
  res.json({ ok: true, emailVerified: true });
});

router.get('/username/check', async (req, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: 'Mínimo 2 caracteres' });
    return;
  }
  const existing = await db().collection(COLLECTIONS.USERS).where('username', '==', q).limit(1).get();
  if (existing.empty) {
    return res.json({ available: true });
  }
  const base = q.replace(/\d+$/, '') || q;
  const suggestions: string[] = [];
  for (let i = 1; i <= 999 && suggestions.length < 3; i++) {
    const candidate = `${base}${i}`;
    if (candidate !== q) {
      const taken = await db().collection(COLLECTIONS.USERS).where('username', '==', candidate).limit(1).get();
      if (taken.empty) suggestions.push(candidate);
    }
  }
  res.json({ available: false, suggestions });
});

/** Login: el cliente usa Firebase Auth signInWithEmailAndPassword. Este endpoint devuelve el usuario si ya tiene token. */
router.post('/login', async (_req, res) => {
  res.status(400).json({
    error: 'Usá Firebase Auth en el cliente: signInWithEmailAndPassword(email, password). Luego enviá el idToken en Authorization.',
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  if (!userDoc.exists) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  const data = userDoc.data()!;
  const kycDoc = await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(req.user!.id).get();
  const kyc = kycDoc.exists ? kycDoc.data() : null;

  res.json({
    id: req.user!.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    country: data.country,
    tipoDocumento: data.tipoDocumento,
    sexo: data.sexo,
    phone: data.phone,
    phoneVerified: data.phoneVerified ?? false,
    emailVerified: data.emailVerified ?? false,
    dateOfBirth: data.dateOfBirth,
    city: data.city,
    province: data.province,
    postalCode: data.postalCode,
    role: data.role,
    reputationScore: data.reputationScore ?? 0,
    createdAt: data.createdAt,
    kyc: kyc ? { status: kyc.status } : { status: 'PENDIENTE' },
  });
});

export const authRouter = router;
