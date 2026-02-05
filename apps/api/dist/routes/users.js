/**
 * Rutas de usuarios: perfil, onboarding, KYC.
 * Ubicación: apps/api/src/routes/users.ts
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { onboardingSchema } from '@tickets-transfer/shared';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
const upload = multer({
    dest: path.join(__dirname, '..', '..', 'uploads'),
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.use(requireAuth);
router.get('/profile', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
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
            kyc: { select: { status: true, rejectionReason: true } },
        },
    });
    if (!user)
        return res.status(404).json({ error: 'No encontrado' });
    res.json(user);
});
router.patch('/profile', async (req, res) => {
    const { firstName, lastName, phone, city, province, postalCode } = req.body;
    const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
            ...(phone !== undefined && { phone }),
            ...(city !== undefined && { city }),
            ...(province !== undefined && { province }),
            ...(postalCode !== undefined && { postalCode }),
        },
        select: { id: true, email: true, firstName: true, lastName: true },
    });
    res.json(user);
});
router.post('/onboarding', async (req, res) => {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
        return;
    }
    const { accion, ticketeras, appsBoletos } = parsed.data;
    await prisma.userOnboarding.upsert({
        where: { userId: req.user.id },
        create: {
            userId: req.user.id,
            accion: accion,
            ticketeras: ticketeras,
            appsBoletos: appsBoletos,
        },
        update: {
            accion: accion,
            ticketeras: ticketeras,
            appsBoletos: appsBoletos,
        },
    });
    res.json({ ok: true });
});
router.get('/onboarding', async (req, res) => {
    const onboarding = await prisma.userOnboarding.findUnique({
        where: { userId: req.user.id },
    });
    res.json(onboarding || null);
});
router.post('/kyc/upload', upload.fields([
    { name: 'dniFront', maxCount: 1 },
    { name: 'dniBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
]), async (req, res) => {
    const files = req.files;
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    const dniFrontUrl = files.dniFront?.[0] ? `${baseUrl}/uploads/${files.dniFront[0].filename}` : undefined;
    const dniBackUrl = files.dniBack?.[0] ? `${baseUrl}/uploads/${files.dniBack[0].filename}` : undefined;
    const selfieUrl = files.selfie?.[0] ? `${baseUrl}/uploads/${files.selfie[0].filename}` : undefined;
    await prisma.kycVerification.update({
        where: { userId: req.user.id },
        data: {
            ...(dniFrontUrl && { dniFrontUrl }),
            ...(dniBackUrl && { dniBackUrl }),
            ...(selfieUrl && { selfieUrl }),
            status: 'EN_REVISION',
        },
    });
    res.json({ ok: true, status: 'EN_REVISION' });
});
router.get('/kyc', async (req, res) => {
    const kyc = await prisma.kycVerification.findUnique({
        where: { userId: req.user.id },
        select: { status: true, rejectionReason: true },
    });
    res.json(kyc || { status: 'PENDIENTE' });
});
export const usersRouter = router;
