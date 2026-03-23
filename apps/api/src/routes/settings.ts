/**
 * Configuración pública de la plataforma.
 * Endpoints que pueden consumir usuarios autenticados (ej. comisión para cálculos).
 */

import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { getCommissionPercentage } from '../lib/settings.js';

export const settingsRouter = Router();

/** Obtener porcentaje de comisión (para cálculos en cliente: app móvil, web) */
settingsRouter.get('/commission', requireAuth, async (_req: AuthRequest, res) => {
  const commissionPercentage = await getCommissionPercentage();
  res.json({ commissionPercentage });
});
