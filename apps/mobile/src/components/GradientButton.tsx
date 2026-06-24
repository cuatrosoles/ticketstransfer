/**
 * Botón primario: gradiente como web (linear-gradient(135deg, #2563eb → #3b82f6 → #60a5fa))
 */

import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useBranding } from '../context/BrandingContext';
import { neonGlow } from '../lib/neonStyles';

type ButtonSize = 'default' | 'compact';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
};

const SIZE = {
  default: {
    wrap: { height: 52, borderRadius: 12, paddingHorizontal: 24 },
    text: { fontSize: 16, fontWeight: '600' as const },
  },
  compact: {
    wrap: { height: 46, borderRadius: 14, paddingHorizontal: 22 },
    text: { fontSize: 14, fontWeight: '700' as const, letterSpacing: 0.2 },
  },
};

export function GradientButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'default',
  style,
  textStyle,
}: Props) {
  const { primaryGradient, primaryLight } = useBranding();
  const sizing = SIZE[size];

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[styles.secondary, sizing.wrap, { borderColor: primaryLight }, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={[styles.secondaryText, sizing.text, { color: '#ffffff' }, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.primaryWrap, sizing.wrap, { shadowColor: primaryGradient[1] }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={primaryGradient}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={[styles.primaryText, sizing.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryWrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
    ...neonGlow('#3b82f6', 'strong'),
  },
  gradient: { ...StyleSheet.absoluteFillObject },
  primaryText: { color: '#ffffff', textAlign: 'center' },
  secondary: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
    ...neonGlow('#60a5fa', 'soft'),
  },
  secondaryText: { textAlign: 'center' },
});
