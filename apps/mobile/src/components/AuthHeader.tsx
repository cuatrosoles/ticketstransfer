/**
 * Header para pantallas auth (Welcome, Login, Register) – Logo + título.
 * Proporciones idénticas a web: logo width 100% del contenedor, object-fit contain, título debajo.
 */

import * as React from 'react';
import { View, Image, Text, StyleSheet, useWindowDimensions } from 'react-native';

interface AuthHeaderProps {
  title: string;
}

const LOGO_ASPECT = 200 / 56;
const MAX_LOGO_WIDTH = 420;

export function AuthHeader({ title }: AuthHeaderProps) {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.9, MAX_LOGO_WIDTH);
  const logoHeight = logoWidth / LOGO_ASPECT;

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/LogoTT-v01.png')}
        style={[styles.logo, { width: logoWidth, height: logoHeight }]}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  logo: {},
  title: { fontSize: 28, fontWeight: '800', letterSpacing: 0.08 * 16, color: '#f8fafc', marginTop: 8, textAlign: 'center' },
});
