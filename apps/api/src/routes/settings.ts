/**
 * Configuración pública de la plataforma.
 * Endpoints que pueden consumir usuarios autenticados (ej. comisión para cálculos).
 * Branding: público (sin secretos) para splash, login y tema en cliente.
 */

import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import {
  getCommissionPercentage,
  getMarketplaceHomePublicListingsLimit,
  getPlatformSettings,
} from '../lib/settings.js';

export const settingsRouter = Router();

/**
 * Marca y tema para apps (sin credenciales). Cache corto en CDN/cliente recomendado.
 */
settingsRouter.get('/branding', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=120');
  const s = await getPlatformSettings();
  const users = s.users && typeof s.users === 'object' ? (s.users as Record<string, unknown>) : {};
  const pickStr = (k: string) => (typeof users[k] === 'string' ? (users[k] as string) : undefined);
  res.json({
    commissionPercentage: s.commissionPercentage,
    marketplaceHomePublicListingsLimit: s.marketplaceHomePublicListingsLimit,
    visual: s.visual && typeof s.visual === 'object' ? s.visual : {},
    users: {
      supportEmail: pickStr('supportEmail'),
      helpCenterUrl: pickStr('helpCenterUrl'),
      registrationDisclaimer: pickStr('registrationDisclaimer'),
    },
    notifications: s.notifications && typeof s.notifications === 'object' ? s.notifications : {},
  });
});

/** Obtener porcentaje de comisión (para cálculos en cliente: app móvil, web) */
settingsRouter.get('/commission', requireAuth, async (_req: AuthRequest, res) => {
  const commissionPercentage = await getCommissionPercentage();
  res.json({ commissionPercentage });
});

/** Límite de tickets públicos en el inicio (marketplace app) */
settingsRouter.get('/marketplace-home', requireAuth, async (_req: AuthRequest, res) => {
  const homePublicListingsLimit = await getMarketplaceHomePublicListingsLimit();
  res.json({ homePublicListingsLimit });
});
