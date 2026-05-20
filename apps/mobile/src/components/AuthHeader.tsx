/**
 * Header para pantallas auth (Welcome, Login, Register) – Logo + título de pantalla.
 */

import * as React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { BrandLogo, BRAND_LOGO_ASPECT, BRAND_LOGO_HEIGHT_AUTH } from './BrandLogo';

interface AuthHeaderProps {
  title: string;
}

const MAX_LOGO_WIDTH = 280;

export function AuthHeader({ title }: AuthHeaderProps) {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.82, MAX_LOGO_WIDTH);
  const logoHeight = Math.min(BRAND_LOGO_HEIGHT_AUTH, logoWidth / BRAND_LOGO_ASPECT);

  return (
    <View style={styles.container}>
      <BrandLogo style={{ width: logoWidth, height: logoHeight, maxWidth: logoWidth }} height={logoHeight} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: 0.08 * 16, color: '#f8fafc', marginTop: 6, textAlign: 'center' },
});
