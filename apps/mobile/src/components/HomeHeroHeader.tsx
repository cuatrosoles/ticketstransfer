/**
 * Header Home: menú, logo ancho, campana y avatar.
 */

import * as React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BrandLogo, BRAND_LOGO_HEIGHT_COMPACT } from './BrandLogo';
import { ensureImageUrl } from '../lib/api';
import { headerEdgePadding, headerTopPadding } from '../theme';

type Props = {
  profileImageUri: string | null;
  onOpenMenu: () => void;
  onBell: () => void;
  onAvatar: () => void;
};

export function HomeHeroHeader({ profileImageUri, onOpenMenu, onBell, onAvatar }: Props) {
  const uriDisplay = ensureImageUrl(profileImageUri);
  const { width: screenW } = useWindowDimensions();
  const sideControlsW = 44 + 40 + 44 + 10 + 8;
  const logoMaxWidth = Math.max(120, screenW - headerEdgePadding * 2 - sideControlsW);

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.menuBtn} onPress={onOpenMenu} accessibilityLabel="Menú">
        <FontAwesome name="bars" size={20} color="#f8fafc" />
      </TouchableOpacity>

      <View style={styles.logoWrap}>
        <BrandLogo height={BRAND_LOGO_HEIGHT_COMPACT} style={[styles.logo, { maxWidth: logoMaxWidth }]} />
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={styles.iconGhost} onPress={onBell} accessibilityLabel="Mensajes">
          <FontAwesome name="bell-o" size={20} color="#f8fafc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn} onPress={onAvatar} accessibilityLabel="Mi perfil">
          {uriDisplay ? (
            <Image source={{ uri: uriDisplay }} style={styles.avatarImg} />
          ) : (
            <FontAwesome name="user" size={17} color="#f8fafc" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: headerEdgePadding,
    paddingTop: headerTopPadding,
    paddingBottom: 8,
    gap: 6,
    minHeight: 48,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  logo: {
    width: '100%',
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  iconGhost: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
