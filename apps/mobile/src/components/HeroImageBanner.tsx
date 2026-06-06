/**
 * Banner hero con imagen + transición suave al fondo oscuro.
 */

import * as React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  source: ImageSourcePropType;
  /** Altura del banner como fracción del ancho (ej. 0.55) */
  aspectRatio?: number;
  children?: React.ReactNode;
};

export function HeroImageBanner({ source, aspectRatio = 0.55, children }: Props) {
  const { width } = useWindowDimensions();
  const bannerHeight = Math.round(width * aspectRatio);

  return (
    <View style={[styles.wrap, { height: bannerHeight }]}>
      <Image source={source} style={[styles.image, { width, height: bannerHeight }]} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(2, 6, 23, 0.35)', 'rgba(2, 6, 23, 0.85)', '#020617']}
        locations={[0, 0.45, 0.78, 1]}
        style={styles.fade}
        pointerEvents="none"
      />
      {children ? <View style={styles.overlay}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 4,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
});
