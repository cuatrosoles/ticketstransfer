/**
 * Header unificado – Back + Logo + Título de pantalla + User.
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { BrandLogo, BRAND_LOGO_HEIGHT_COMPACT } from './BrandLogo';
import { headerBleedMargin, headerBottomPadding, headerEdgePadding, headerTopPadding, spacing } from '../theme';

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
  const { width: screenW } = useWindowDimensions();
  const sideW = 40 + 40 + 12;
  const logoMaxWidth = Math.max(100, screenW - headerEdgePadding * 2 - sideW);

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
          <View style={styles.backSpacer} />
        )}
        <BrandLogo
          uri={logoUri}
          height={BRAND_LOGO_HEIGHT_COMPACT}
          style={[styles.logo, { maxWidth: logoMaxWidth }]}
        />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : <View style={styles.backSpacer} />}
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
    gap: 6,
    minHeight: 44,
  },
  backSpacer: { width: 40, height: 40 },
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
    minWidth: 0,
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
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
