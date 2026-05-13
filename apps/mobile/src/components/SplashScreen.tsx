/**
 * Pantalla de apertura: nombre de la app + animación GIF (8 s) y fade out antes del flujo normal.
 * GIF: src/assets/video_splash01.gif
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme';
import { useBranding } from '../context/BrandingContext';

/**
 * Fondo del lienzo del GIF (negro). Si usás #e6e6e6 u otro color, las zonas transparentes
 * o el área alrededor del personaje muestran ese color y se ven “costuras”. Coincidí con el GIF real.
 */
const SPLASH_GIF_BACKGROUND = '#000000';

const SPLASH_VISIBLE_MS = 8000;
const FADE_OUT_MS = 500;

type Props = {
  onFinished: () => void;
};

export function SplashScreen({ onFinished }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const brand = useBranding();
  const opacity = useRef(new Animated.Value(1)).current;
  const finishedRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      // useNativeDriver: true rasteriza la capa y el GIF deja de repintar frames (se queda estático).
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !finishedRef.current) {
          finishedRef.current = true;
          onFinished();
        }
      });
    }, SPLASH_VISIBLE_MS);
    return () => clearTimeout(id);
  }, [opacity, onFinished]);

  /** Zona inferior reservada al título + safe area + hueco respecto al GIF. */
  const titleBlockPaddingBottom = Math.max(insets.bottom, spacing.md) + spacing.lg;

  return (
    <Animated.View
      style={[styles.overlay, { opacity, backgroundColor: SPLASH_GIF_BACKGROUND }]}
      pointerEvents="auto"
    >
      <View style={styles.column}>
        <View
          style={[
            styles.gifRegion,
            {
              paddingTop: insets.top + spacing.md,
            },
          ]}
        >
          <Image
            source={require('../assets/video_splash01.gif')}
            style={[styles.gifImage, { width, backgroundColor: SPLASH_GIF_BACKGROUND }]}
            resizeMode="contain"
            accessibilityRole="image"
          />
        </View>
        <View
          style={[
            styles.titleBar,
            {
              paddingTop: spacing.xl,
              paddingBottom: titleBlockPaddingBottom,
            },
          ]}
        >
          <Text style={[styles.appName, { color: brand.primaryLight }]}>{brand.appName}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    zIndex: 9999,
    elevation: 9999,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  /** Ocupa todo lo que queda arriba del título: ancho pantalla para que el GIF llegue a los laterales con contain. */
  gifRegion: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  gifImage: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  titleBar: {
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
