/**
 * Header unificado – Back + Logo + Título de pantalla + User.
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BrandLogo, BRAND_LOGO_HEIGHT_COMPACT } from './BrandLogo';
import { headerBleedMargin, headerBottomPadding, headerEdgePadding, headerTopPadding, spacing } from '../theme';

const LOGO_MAX_WIDTH = 140;

type Props = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  /** Contenido junto al título (ej. avatar del contacto en chat) */
  titleRight?: React.ReactNode;
  /** Logo remoto opcional (sobreescribe branding). */
  logoUri?: string | null;
  /** Padding horizontal del contenedor padre (p. ej. spacing.lg). 0 si el padre no tiene padding. */
  parentContentPadding?: number;
};

export function ScreenHeader({
  title,
  showBack,
  onBack,
  rightSlot,
  titleRight,
  logoUri,
  parentContentPadding = spacing.lg,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        parentContentPadding > 0 && { marginHorizontal: headerBleedMargin(parentContentPadding) },
      ]}
    >
      <View style={styles.row}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}
        <View style={styles.logoCenter} pointerEvents="box-none">
          <BrandLogo
            uri={logoUri}
            height={BRAND_LOGO_HEIGHT_COMPACT}
            style={[styles.logo, { maxWidth: LOGO_MAX_WIDTH, width: LOGO_MAX_WIDTH }]}
          />
        </View>
        {rightSlot ? <View style={styles.sideSlot}>{rightSlot}</View> : <View style={styles.sideSlot} />}
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
  container: {
    width: '100%',
    paddingHorizontal: headerEdgePadding,
    paddingTop: headerTopPadding,
    paddingBottom: headerBottomPadding,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    position: 'relative',
  },
  sideSlot: {
    width: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    flexShrink: 0,
  },
  logoCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  backIcon: { fontSize: 22, color: '#f8fafc' },
  logo: {
    height: BRAND_LOGO_HEIGHT_COMPACT,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 20,
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
