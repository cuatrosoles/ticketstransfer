/**
 * Logo de marca: URL remota (branding) o recurso local por defecto.
 * Dimensiones fijas en altura para evitar que el PNG (2006×776) expanda el header.
 */

import * as React from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { useBranding } from '../context/BrandingContext';

const DEFAULT_LOGO = require('../assets/images/LogoTT-v01.png');

/** Proporción real de LogoTT-v01.png */
export const BRAND_LOGO_ASPECT = 2006 / 776;

/** Altura compacta para cabeceras de pantalla */
export const BRAND_LOGO_HEIGHT_COMPACT = 60;

/** Altura para pantallas auth (login/registro) */
export const BRAND_LOGO_HEIGHT_AUTH = 66;

type Props = {
  style?: StyleProp<ImageStyle>;
  /** Si se pasa, tiene prioridad sobre el logo del branding remoto. */
  uri?: string | null;
  /** Altura del logo; el ancho se calcula con la proporción real del asset. */
  height?: number;
};

export function BrandLogo({ style, uri, height = BRAND_LOGO_HEIGHT_COMPACT }: Props) {
  const brand = useBranding();
  const remote = uri ?? brand.logoUrl;
  const flat = StyleSheet.flatten(style) ?? {};
  const h = typeof flat.height === 'number' ? flat.height : height;
  const w = typeof flat.width === 'number' ? flat.width : undefined;
  const sized: ImageStyle = w
    ? { width: w, height: h }
    : {
        height: h,
        aspectRatio: BRAND_LOGO_ASPECT,
        maxWidth: typeof flat.maxWidth === 'number' ? flat.maxWidth : h * BRAND_LOGO_ASPECT,
      };

  if (remote) {
    return <Image source={{ uri: remote }} style={[sized, style]} resizeMode="contain" />;
  }
  return <Image source={DEFAULT_LOGO} style={[sized, style]} resizeMode="contain" />;
}
