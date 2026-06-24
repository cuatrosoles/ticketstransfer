/**
 * API neón — lee valores de neonTheme.ts (único archivo editable).
 */

import { Platform, type ViewStyle } from 'react-native';
import { NEON, type NeonBorderWidth, type NeonColorKey, type NeonIntensity } from './neonTheme';

export { NEON } from './neonTheme';
export type { NeonBorderWidth, NeonColorKey, NeonIntensity, NeonTheme } from './neonTheme';

export const neonBlue = NEON.colors.glow;
export const neonBorderColor = NEON.colors.border;
export const neonBlueSoft = NEON.colors.borderSubtle;

export function neonColor(key: NeonColorKey): string {
  return NEON.colors[key];
}

/** Resplandor neón. Firma original: (color, intensidad). */
export function neonGlow(
  color: string = NEON.colors.glow,
  intensity: NeonIntensity = 'strong'
): ViewStyle {
  const preset = NEON.glow[intensity];

  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: preset.ios.opacity,
      shadowRadius: preset.ios.radius,
    },
    android: { elevation: preset.android.elevation },
    default: {},
  }) as ViewStyle;
}

/** Borde visible opcional (grosor + color desde el tema). */
export function neonBorder(
  width: NeonBorderWidth = 'default',
  colorKey: NeonColorKey = 'border'
): Pick<ViewStyle, 'borderWidth' | 'borderColor'> {
  return {
    borderWidth: NEON.borderWidth[width],
    borderColor: neonColor(colorKey),
  };
}

/** Halo neón del ícono circular activo en la tab bar. */
export function neonTabActiveIconGlow(): ViewStyle {
  const { glowColor, glow } = NEON.tabBar.activeIcon;

  return Platform.select({
    ios: {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glow.ios.opacity,
      shadowRadius: glow.ios.radius,
    },
    android: { elevation: glow.android.elevation },
    default: {},
  }) as ViewStyle;
}

/** Círculo activo (fondo + borde) del MainTabNavigator. */
export function neonTabActiveIconCircle(): ViewStyle {
  const icon = NEON.tabBar.activeIcon;
  const radius = icon.size / 2;

  return {
    width: icon.size,
    height: icon.size,
    borderRadius: radius,
    backgroundColor: icon.background,
    borderWidth: icon.borderWidth,
    borderColor: icon.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export const neonCardBase: ViewStyle = {
  backgroundColor: 'rgba(13, 36, 82, 0.72)',
  borderRadius: 20,
  borderWidth: NEON.borderWidth.thin,
  borderColor: NEON.colors.border,
  ...neonGlow(NEON.colors.glow, 'soft'),
};

export const neonCardStrong: ViewStyle = {
  ...neonCardBase,
  borderColor: NEON.colors.borderStrong,
  ...neonGlow(NEON.colors.glowStrong, 'strong'),
};

export const neonGlassPanel: ViewStyle = {
  backgroundColor: 'rgba(13, 36, 82, 0.82)',
  borderRadius: 22,
  borderWidth: NEON.borderWidth.thin,
  borderColor: NEON.colors.borderSubtle,
  ...neonGlow(NEON.colors.glowDeep, 'soft'),
};
