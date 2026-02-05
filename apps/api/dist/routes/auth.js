/**
 * Rutas de autenticación: registro, login, refresh, me.
 * Ubicación: apps/api/src/routes/auth.ts
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { registerBodySchema, loginSchema } from '@tickets-transfer/shared';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_EXP = '15m';
const REFRESH_EXP = '7d';
function signTokens(userId, email, role) {
    const access = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: ACCESS_EXP });
    const refresh = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXP });
    return { access, refresh };
}
router.post('/register', async (req, res) => {
    const parsed = registerBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
        return;
    }
    const { email, password, firstName, lastName, country, tipoDocumento, sexo, phone, phonePrefix, dateOfBirth, city, province, postalCode, } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
        return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const fullPhone = phone ? [phonePrefix || '+549', phone].filter(Boolean).join(' ').trim() : null;
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            country: country || null,
            tipoDocumento: tipoDocumento || null,
            sexo: sexo,
            phone: fullPhone || phone || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            city: city || null,
            province: province || null,
            postalCode: postalCode || null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
    await prisma.kycVerification.create({
        data: { userId: user.id },
    });
    const { access, refresh } = signTokens(user.id, user.email, user.role);
    res.status(201).json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        accessToken: access,
        refreshToken: refresh,
    });
});
router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Email y contraseña requeridos' });
        return;
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
    }
    const { access, refresh } = signTokens(user.id, user.email, user.role);
    res.json({
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        accessToken: access,
        refreshToken: refresh,
    });
});
router.post('/refresh', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token requerido' });
        return;
    }
    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            res.status(401).json({ error: 'Usuario no encontrado' });
            return;
        }
        const { access, refresh } = signTokens(user.id, user.email, user.role);
        res.json({ accessToken: access, refreshToken: refresh });
    }
    catch {
        res.status(401).json({ error: 'Refresh token inválido' });
    }
});
router.get('/me', requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            country: true,
            tipoDocumento: true,
            sexo: true,
            phone: true,
            dateOfBirth: true,
            city: true,
            province: true,
            postalCode: true,
            role: true,
            reputationScore: true,
            createdAt: true,
            kyc: { select: { status: true } },
        },
    });
    if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
    }
    res.json(user);
});
export const authRouter = router;
