/**
 * Layout unificado para TODAS las pantallas.
 * AuthBackground + padding para header transparente.
 * Usar en Welcome, Login, Register, KYC, Home, Profile, etc.
 */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthBackground } from './AuthBackground';

const HEADER_PADDING = 120;

export function ScreenLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackground>
      <View style={styles.wrapper}>{children}</View>
    </AuthBackground>
  );
}

/** paddingTop para contenido que va debajo del header transparente */
export const contentPadding = {
  paddingTop: HEADER_PADDING,
  paddingHorizontal: 24,
  paddingBottom: 48,
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
});
