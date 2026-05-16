/**
 * Header para pantallas auth (Welcome, Login, Register) – Logo + título.
 * Sin recurso local obligatorio: usa fallback textual si no hay URL remota.
 */

import * as React from 'react';
import { View, Image, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useBranding } from '../context/BrandingContext';

interface AuthHeaderProps {
  title: string;
}

const LOGO_ASPECT = 200 / 56;
const MAX_LOGO_WIDTH = 420;

export function AuthHeader({ title }: AuthHeaderProps) {
  const { width } = useWindowDimensions();
  const brand = useBranding();
  const logoWidth = Math.min(width * 0.9, MAX_LOGO_WIDTH);
  const logoHeight = logoWidth / LOGO_ASPECT;

  return (
    <View style={styles.container}>
      {brand.logoUrl ? (
        <Image
          source={{ uri: brand.logoUrl }}
          style={[styles.logo, { width: logoWidth, height: logoHeight }]}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.fallbackWrap, { width: logoWidth, minHeight: logoHeight }]}>
          <Text style={styles.fallbackLogo}>Tickets Transfer</Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  logo: {},
  fallbackWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  fallbackLogo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.08 * 16,
    color: '#f8fafc',
    textAlign: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: 0.08 * 16, color: '#f8fafc', marginTop: 8, textAlign: 'center' },
});
