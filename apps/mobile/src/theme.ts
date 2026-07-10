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

/** Contenedor raíz / scroll: transparente para que se vea el video de fondo global */
export const screenRoot = { flex: 1, backgroundColor: 'transparent' as const };
export const screenScroll = screenRoot;

/** Padding mínimo del header respecto al borde de pantalla (izquierda/derecha) */
export const headerEdgePadding = 6;

/**
 * Padding superior del header (debajo del status bar / safe area).
 * Valor anterior ~4px en pantallas internas; duplicado = 8.
 * Modificá solo este número para cambiar todas las cabeceras.
 */
export const headerTopPadding = 8;

/**
 * Padding inferior del header (encima del footer / safe area).
 * Valor anterior ~6px en pantallas internas; duplicado = 12.
 * Modificá solo este número para cambiar todas las cabeceras.
 */
export const headerBottomPadding = 14;

/** Contenedor estándar de ScrollView en pantallas stack (push). */
export const stackScreenContent = {
  paddingTop: 24,
  paddingHorizontal: spacing.lg,
  paddingBottom: 48,
} as const;

/** Contenedor estándar en tabs del MainTabNavigator (espacio para tab bar). */
export const tabScreenContent = {
  paddingTop: 24,
  paddingHorizontal: spacing.lg,
  paddingBottom: 100,
} as const;

/** Contenedor de mensajes (chat) con padding inferior reducido por la barra de entrada. */
export const chatMessagesContent = {
  ...stackScreenContent,
  paddingBottom: spacing.md,
} as const;

/** Margen negativo para compensar padding del scroll y dejar solo headerEdgePadding al borde */
export function headerBleedMargin(parentHorizontalPadding: number = spacing.lg): number {
  return parentHorizontalPadding > headerEdgePadding ? -(parentHorizontalPadding - headerEdgePadding) : 0;
}

/** Estilo glass unificado con borde neón para cards en toda la app */
export const glassCard = {
  backgroundColor: 'rgba(13, 36, 82, 0.72)' as const,
  borderRadius: 20 as const,
  borderWidth: 2 as const,
  borderColor: 'rgba(96, 165, 250, 0.55)' as const,
};
