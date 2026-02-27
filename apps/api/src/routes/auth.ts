/**
 * Rutas de autenticación - Firebase Auth.
 * Register: backend crea usuario en Firebase Auth + Firestore, devuelve customToken.
 * Login: se realiza en el cliente con Firebase Auth SDK (signInWithEmailAndPassword).
 */

import { Router } from 'express';
import { getAuth } from '../lib/firebase-admin.js';
import { db, COLLECTIONS } from '../lib/firestore.js';
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
    role: 'user',
    emailVerified: false,
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
