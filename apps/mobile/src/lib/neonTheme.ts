/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  TEMA NEÓN — edita SOLO este archivo para controlar glow y bordes
 *  en toda la app (iOS + Android).
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  colors.glow* / colors.border*  → colores del halo y del borde
 *  borderWidth                    → grosor del borde (thin / default / thick)
 *  glow.soft / glow.strong         → intensidad del resplandor por plataforma
 */

export type NeonIntensity = 'soft' | 'strong';
export type NeonBorderWidth = 'thin' | 'default' | 'thick';

export type NeonColorKey =
  | 'glow'
  | 'glowStrong'
  | 'glowDeep'
  | 'border'
  | 'borderStrong'
  | 'borderSubtle'
  | 'danger'
  | 'white';

export const NEON = {
  colors: {
    glow: 'rgba(56, 189, 248, 0.99)',
    glowStrong: 'rgba(96, 165, 250, 0.99)',
    glowDeep: 'rgba(5, 100, 252, 0.99)',
    border: 'rgba(0, 47, 255, 0.93)',
    borderStrong: 'rgba(0, 102, 255, 0.9)',
    borderSubtle: 'rgba(64, 127, 199, 0.5)',
    danger: '#f87171',
    white: '#ffffff',
  },

  borderWidth: {
    thin: 1,
    default: 2,
    thick: 3,
  },

  glow: {
    soft: {
      ios: { opacity: 0.38, radius: 10 },
      android: { elevation: 9 },
    },
    strong: {
      ios: { opacity: 0.75, radius: 16 },
      android: { elevation: 18 },
    },
  },

  /** Botón circular activo del MainTabNavigator (Inicio, Tienda, etc.) */
  tabBar: {
    activeIcon: {
      size: 48,
      background: '#2563eb',
      borderColor: 'rgba(10, 112, 236, 0.95)',
      borderWidth: 3,
      glowColor: '#60a5fa',
      glow: {
        ios: { opacity: 0.98, radius: 22 },
        android: { elevation: 46 },
      },
    },
  },
} as const;

export type NeonTheme = typeof NEON;
