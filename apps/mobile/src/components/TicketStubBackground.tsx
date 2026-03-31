/**
 * Fondo del ticket: Image absoluta con ancho/alto = contenedor (onLayout).
 * En Android un Image solo con absoluteFill suele quedarse al tamaño intrínseco del PNG (“chico”).
 */

import * as React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
  type LayoutChangeEvent,
  type StyleProp,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * `landscape`: el PNG horizontal (1280×540) se estira al contenedor.
   * `portrait`: misma textura rotada 90° para que la zona tipo código de barras quede abajo.
   */
  backgroundOrientation?: 'landscape' | 'portrait';
  /** Altura mínima del stub (ej. grilla 2 cols en inicio → ticket más alto que ancho). */
  minFrameHeight?: number;
};

const TICKET_BG = require('../assets/ticket-card-bg.png');

export function TicketStubBackground({
  children,
  style,
  contentStyle,
  backgroundOrientation = 'landscape',
  minFrameHeight,
}: Props) {
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  const onFrameLayout = React.useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }));
  }, []);

  const bgImageStyle = React.useMemo((): StyleProp<ImageStyle> => {
    if (size.w <= 0 || size.h <= 0) return styles.bgImage;
    if (backgroundOrientation === 'portrait') {
      return [
        styles.bgImage,
        {
          width: size.h,
          height: size.w,
          left: (size.w - size.h) / 2,
          top: (size.h - size.w) / 2,
          transform: [{ rotate: '90deg' }],
        },
      ];
    }
    return [styles.bgImage, { width: size.w, height: size.h }];
  }, [size.w, size.h, backgroundOrientation]);

  const frameMin = minFrameHeight != null && minFrameHeight > 0 ? { minHeight: minFrameHeight } : null;
  /** Sin flexGrow: el contenido queda arriba y la zona baja del PNG (código de barras) queda libre de texto. */
  return (
    <View style={[styles.shadowOuter, style]}>
      <View style={[styles.frame, frameMin]} collapsable={false} onLayout={onFrameLayout}>
        {size.w > 0 && size.h > 0 ? (
          <View style={styles.bgHitBlocker} pointerEvents="none">
            <Image source={TICKET_BG} style={bgImageStyle} resizeMode="stretch" />
          </View>
        ) : null}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowOuter: {
    alignSelf: 'stretch',
    width: '100%',
    borderRadius: 20,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#020617',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.38,
        shadowRadius: 18,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  frame: {
    position: 'relative',
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  bgHitBlocker: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  bgImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    ...Platform.select({
      android: {
        // Sin esto, en Android la Image puede pintar encima aunque zIndex del texto sea mayor.
        elevation: 4,
      },
      default: {},
    }),
  },
});
