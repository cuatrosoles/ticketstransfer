/**
 * Barra de carga superior (estilo plataforma) tras publicar y volver al inicio.
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  onFinish?: () => void;
  durationMs?: number;
};

export function TopLoadingBar({ visible, onFinish, durationMs = 2200 }: Props) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    opacity.setValue(1);
    Animated.sequence([
      Animated.timing(progress, { toValue: 0.72, duration: durationMs * 0.55, useNativeDriver: false }),
      Animated.timing(progress, { toValue: 1, duration: durationMs * 0.35, useNativeDriver: false }),
    ]).start(({ finished }) => {
      if (!finished) return;
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => {
        onFinish?.();
      });
    });
  }, [visible, durationMs, progress, opacity, onFinish]);

  if (!visible) return null;

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.container, { top: insets.top, opacity }]} pointerEvents="none">
      <View style={styles.track}>
        <Animated.View style={[styles.bar, { width }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
  },
  bar: {
    height: 3,
    backgroundColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
