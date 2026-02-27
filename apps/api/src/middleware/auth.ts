/**
 * Middleware de autenticación - Firebase ID Token.
 * Verifica el token de Firebase Auth enviado en Authorization: Bearer <token>
 */

import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '../lib/firebase-admin.js';
import { db, COLLECTIONS } from '../lib/firestore.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db().collection(COLLECTIONS.USERS).doc(decoded.uid).get();
    if (!userDoc.exists) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }
    const data = userDoc.data()!;
    req.user = {
      id: decoded.uid,
      email: decoded.email || data.email || '',
      role: data.role || 'user',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado' });
    return;
  }
  next();
}
