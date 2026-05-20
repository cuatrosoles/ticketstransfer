/**
 * Header unificado – Back + Logo + Título de pantalla + User.
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BrandLogo } from './BrandLogo';

const LOGO_ASPECT = 200 / 56;
const MAX_LOGO_WIDTH = 300;

type Props = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  /** Contenido junto al título (ej. avatar del contacto en chat) */
  titleRight?: React.ReactNode;
  /** Logo remoto opcional (sobreescribe branding). */
  logoUri?: string | null;
};

export function ScreenHeader({ title, showBack, onBack, rightSlot, titleRight, logoUri }: Props) {
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
        <BrandLogo uri={logoUri} style={styles.logo} />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : <View style={styles.spacer} />}
      </View>
      <View style={styles.titleRow}>
        <Text style={[styles.title, titleRight ? styles.titleWithExtra : undefined]} numberOfLines={1}>
          {title}
        </Text>
        {titleRight ? <View style={styles.titleRightWrap}>{titleRight}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 8, paddingVertical: 8, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  spacer: { width: 4, height: 4 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rightSlot: { flexShrink: 0 },
  backIcon: { fontSize: 22, color: '#f8fafc' },
  logo: {
    flex: 1,
    maxWidth: MAX_LOGO_WIDTH,
    height: MAX_LOGO_WIDTH / LOGO_ASPECT,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Cooper-Black',
    letterSpacing: 0.5,
    color: '#f8fafc',
    textAlign: 'center',
    flexShrink: 1,
  },
  titleWithExtra: { flex: 1, textAlign: 'center' as const },
  titleRightWrap: { flexShrink: 0 },
});
