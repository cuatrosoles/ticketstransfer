/**
 * Rutas de usuarios: perfil, onboarding, KYC.
 * Ubicación: apps/api/src/routes/users.ts
 */

import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { uploadsDir } from '../lib/uploads.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { onboardingSchema } from '@tickets-transfer/shared';
import { createDiditSession } from '../lib/didit.js';

const router = Router();
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(requireAuth);

router.get('/profile', async (req: AuthRequest, res) => {
  let user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      username: true,
      numeroId: true,
      firstName: true,
      lastName: true,
      country: true,
      tipoDocumento: true,
      phone: true,
      dateOfBirth: true,
      city: true,
      province: true,
      postalCode: true,
      reputationScore: true,
      profileImageUrl: true,
      kyc: { select: { status: true, rejectionReason: true } },
    },
  });
  if (!user) return res.status(404).json({ error: 'No encontrado' });
  if (!user.numeroId) {
    const numeroId = `TT${Math.random().toString(36).slice(2, 10).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
    user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { numeroId },
      select: {
        id: true,
        email: true,
        username: true,
        numeroId: true,
        firstName: true,
        lastName: true,
        country: true,
        tipoDocumento: true,
        phone: true,
        dateOfBirth: true,
        city: true,
        province: true,
        postalCode: true,
        reputationScore: true,
        profileImageUrl: true,
        kyc: { select: { status: true, rejectionReason: true } },
      },
    });
  }
  const phone = user.phone?.replace(/\+549\s*\+549/, '+549') ?? user.phone;
  res.json({ ...user, phone });
});

router.post('/profile/avatar', upload.single('avatar'), async (req: AuthRequest, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No se envió ninguna imagen' });
    return;
  }
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  const profileImageUrl = `${baseUrl}/uploads/${file.filename}`;
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { profileImageUrl },
  });
  res.json({ profileImageUrl });
});

router.patch('/profile', async (req: AuthRequest, res) => {
  const body = req.body || {};
  const { username, firstName, lastName, phone, city, province, postalCode } = body;
  const updateData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    username?: string | null;
  } = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (city !== undefined) updateData.city = city;
  if (province !== undefined) updateData.province = province;
  if (postalCode !== undefined) updateData.postalCode = postalCode;
  if (username !== undefined) {
    const usernameVal = typeof username === 'string' ? username.trim() : '';
    if (usernameVal) {
      const existing = await prisma.user.findFirst({
        where: { username: usernameVal, NOT: { id: req.user!.id } },
      });
      if (existing) {
        res.status(409).json({ error: 'Ya existe un usuario con ese nombre de usuario' });
        return;
      }
    }
    updateData.username = usernameVal || null;
  }
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: { id: true, email: true, username: true, firstName: true, lastName: true },
  });
  res.json(user);
});

router.post('/onboarding', async (req: AuthRequest, res) => {
  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const { accion, ticketeras, appsBoletos } = parsed.data;

  await prisma.userOnboarding.upsert({
    where: { userId: req.user!.id },
    create: {
      userId: req.user!.id,
      accion: accion as string[],
      ticketeras: ticketeras as string[],
      appsBoletos: appsBoletos as string[],
    },
    update: {
      accion: accion as string[],
      ticketeras: ticketeras as string[],
      appsBoletos: appsBoletos as string[],
    },
  });
  res.json({ ok: true });
});

router.get('/onboarding', async (req: AuthRequest, res) => {
  const onboarding = await prisma.userOnboarding.findUnique({
    where: { userId: req.user!.id },
  });
  res.json(onboarding || null);
});

router.post('/kyc/upload', upload.fields([
  { name: 'dniFront', maxCount: 1 },
  { name: 'dniBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]), async (req: AuthRequest, res) => {
  const files = req.files as { [key: string]: Express.Multer.File[] };
  const baseUrl = process.env.APP_URL || 'http://localhost:3001';
  const dniFrontUrl = files.dniFront?.[0] ? `${baseUrl}/uploads/${files.dniFront[0].filename}` : undefined;
  const dniBackUrl = files.dniBack?.[0] ? `${baseUrl}/uploads/${files.dniBack[0].filename}` : undefined;
  const selfieUrl = files.selfie?.[0] ? `${baseUrl}/uploads/${files.selfie[0].filename}` : undefined;

  await prisma.kycVerification.update({
    where: { userId: req.user!.id },
    data: {
      ...(dniFrontUrl && { dniFrontUrl }),
      ...(dniBackUrl && { dniBackUrl }),
      ...(selfieUrl && { selfieUrl }),
      status: 'EN_REVISION',
    },
  });
  res.json({ ok: true, status: 'EN_REVISION' });
});

router.get('/kyc', async (req: AuthRequest, res) => {
  const kyc = await prisma.kycVerification.findUnique({
    where: { userId: req.user!.id },
    select: { status: true, rejectionReason: true },
  });
  res.json(kyc || { status: 'PENDIENTE' });
});

/** Crear sesión Didit para KYC (WebView móvil o redirect web) */
router.post('/kyc/session', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const webUrl = process.env.WEB_URL || process.env.APP_URL || 'http://localhost:5173';
  const platform = (req.body?.platform as string) || 'web';

  // Callback: web = URL absoluta; móvil = deep link ticketTransfer://
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

    await prisma.kycVerification.update({
      where: { userId },
      data: { diditSessionId: session.session_id },
    });

    res.json({ url: session.url, sessionId: session.session_id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al crear sesión Didit';
    res.status(500).json({ error: msg });
  }
});

export const usersRouter = router;
