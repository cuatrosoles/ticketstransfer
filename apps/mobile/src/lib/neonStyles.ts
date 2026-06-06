/**
 * Estilos neón reutilizables (Cap06–Cap10).
 */

import { Platform, type ViewStyle } from 'react-native';

export const neonBlue = '#38bdf8';
export const neonBlueSoft = 'rgba(56, 189, 248, 0.55)';
export const neonBorderColor = 'rgba(96, 165, 250, 0.55)';

export function neonGlow(color = neonBlue, intensity: 'soft' | 'strong' = 'soft'): ViewStyle {
  const opacity = intensity === 'strong' ? 0.75 : 0.38;
  const radius = intensity === 'strong' ? 16 : 10;
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation: intensity === 'strong' ? 12 : 6 },
    default: {},
  }) as ViewStyle;
}

export const neonCardBase: ViewStyle = {
  backgroundColor: 'rgba(13, 36, 82, 0.72)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: neonBorderColor,
  ...neonGlow(neonBlue, 'soft'),
};

export const neonCardStrong: ViewStyle = {
  ...neonCardBase,
  borderColor: 'rgba(147, 197, 253, 0.65)',
  ...neonGlow('#60a5fa', 'strong'),
};

export const neonGlassPanel: ViewStyle = {
  backgroundColor: 'rgba(13, 36, 82, 0.82)',
  borderRadius: 22,
  borderWidth: 1,
  borderColor: 'rgba(147, 197, 253, 0.4)',
  ...neonGlow('#3b82f6', 'soft'),
};
