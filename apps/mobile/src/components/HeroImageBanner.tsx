/**
 * Banner hero: imagen con fundido en bordes sobre el video global (App.tsx).
 */

import * as React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, useWindowDimensions } from 'react-native';
import { ImageEdgeFade } from './ImageEdgeFade';
import type { ImageEdgeFadeSide } from '../lib/imageEdgeFade';

type Props = {
  source: ImageSourcePropType;
  /** Altura del banner como fracción del ancho (ej. 0.55) */
  aspectRatio?: number;
  edgeFadeTop?: ImageEdgeFadeSide | false;
  edgeFadeBottom?: ImageEdgeFadeSide | false;
  children?: React.ReactNode;
};

export function HeroImageBanner({
  source,
  aspectRatio = 0.55,
  edgeFadeTop,
  edgeFadeBottom,
  children,
}: Props) {
  const { width } = useWindowDimensions();
  const bannerHeight = Math.round(width * aspectRatio);

  return (
    <View style={[styles.wrap, { height: bannerHeight }]}>
      <ImageEdgeFade
        top={edgeFadeTop}
        bottom={edgeFadeBottom}
        style={{ width, height: bannerHeight }}
      >
        <Image source={source} style={{ width, height: bannerHeight }} resizeMode="cover" />
      </ImageEdgeFade>
      {children ? <View style={styles.overlay}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
});
