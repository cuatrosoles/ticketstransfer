/**
 * Middleware de autenticación JWT.
 * Ubicación: apps/api/src/middleware/auth.ts
 */
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
const JWT_SECRET = process.env.JWT_SECRET || '';
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ error: 'No autorizado' });
        return;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            res.status(401).json({ error: 'Usuario no encontrado' });
            return;
        }
        req.user = { id: user.id, email: user.email, role: user.role };
        next();
    }
    catch {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Acceso denegado' });
        return;
    }
    next();
}
