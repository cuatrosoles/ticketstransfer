/**
 * Tema – Tickets Transfer (alineado con web)
 * Ubicación: apps/mobile/src/theme.ts
 */

export const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  surface: '#1e293b',
  border: '#334155',
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  white: '#ffffff',
  danger: '#ef4444',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = 12;

/** Estilo glass unificado (igual que auth) para cards en toda la app */
export const glassCard = {
  backgroundColor: 'rgba(30, 58, 138, 0.4)' as const,
  borderRadius: 20 as const,
  borderWidth: 1 as const,
  borderColor: 'rgba(96, 165, 250, 0.3)' as const,
};
