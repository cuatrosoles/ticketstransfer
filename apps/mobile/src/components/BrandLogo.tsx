/**
 * Logo de marca: URL remota (branding) o recurso local por defecto.
 */

import * as React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { useBranding } from '../context/BrandingContext';

const DEFAULT_LOGO = require('../assets/images/LogoTT-v01.png');

type Props = {
  style?: StyleProp<ImageStyle>;
  /** Si se pasa, tiene prioridad sobre el logo del branding remoto. */
  uri?: string | null;
};

export function BrandLogo({ style, uri }: Props) {
  const brand = useBranding();
  const remote = uri ?? brand.logoUrl;
  if (remote) {
    return <Image source={{ uri: remote }} style={style} resizeMode="contain" />;
  }
  return <Image source={DEFAULT_LOGO} style={style} resizeMode="contain" />;
}
