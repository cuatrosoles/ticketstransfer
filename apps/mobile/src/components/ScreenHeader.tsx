/**
 * Header unificado – Back + Logo + Título + User (compacto, sin espacio excesivo).
 * Igual que web: elementos cercanos, layout horizontal.
 */

import * as React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LOGO_ASPECT = 200 / 56;
const MAX_LOGO_WIDTH = 300;

type Props = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

export function ScreenHeader({ title, showBack, onBack, rightSlot }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <Image
          source={require('../assets/images/LogoTT-v01.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {rightSlot ?? <View style={styles.spacer} />}
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 8, paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  spacer: { width: 4, height: 4 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: '#f8fafc' },
  logo: {
    width: MAX_LOGO_WIDTH,
    height: MAX_LOGO_WIDTH / LOGO_ASPECT,
    flex: 0,
  },
  userBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    color: '#f8fafc',
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIcon: { fontSize: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#f8fafc',
    marginTop: 6,
    textAlign: 'center',
  },
});
