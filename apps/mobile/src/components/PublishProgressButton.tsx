/**
 * Botón de publicar con relleno de progreso y etiqueta de etapa.
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { neonGlow } from '../lib/neonStyles';

type Props = {
  label: string;
  progressLabel?: string;
  progress: number;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function PublishProgressButton({
  label,
  progressLabel,
  progress,
  loading,
  disabled,
  onPress,
}: Props) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <TouchableOpacity
      style={[styles.wrap, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <View style={[styles.fill, { width: `${pct}%` }]} />
      <View style={styles.content}>
        <Text style={styles.mainText} numberOfLines={1}>
          {loading && progressLabel ? progressLabel : label}
        </Text>
        {loading ? (
          <Text style={styles.subText}>{pct}%</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: 'rgba(13, 36, 82, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.55)',
    minHeight: 52,
    justifyContent: 'center',
    ...neonGlow('#38bdf8', 'soft'),
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.95,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: { color: colors.white, fontWeight: '700', fontSize: 15, textAlign: 'center' },
  subText: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  disabled: { opacity: 0.75 },
});
