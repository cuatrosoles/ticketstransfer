/**
 * Header Home según mockup: menú hamburguesa, logo centrado, campana y avatar.
 */

import * as React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useBranding } from '../context/BrandingContext';
import { ensureImageUrl } from '../lib/api';

const LOGO_ASPECT = 200 / 56;
const SIDE_PAD = 16;

type Props = {
  profileImageUri: string | null;
  onOpenMenu: () => void;
  onBell: () => void;
  onAvatar: () => void;
};

export function HomeHeroHeader({ profileImageUri, onOpenMenu, onBell, onAvatar }: Props) {
  const brand = useBranding();
  const uriDisplay = ensureImageUrl(profileImageUri);

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.menuBtn} onPress={onOpenMenu} accessibilityLabel="Menú">
        <FontAwesome name="bars" size={20} color="#f8fafc" />
      </TouchableOpacity>

      <View style={styles.logoWrap}>
        <View style={styles.logoGlow}>
          {brand.logoUrl ? (
            <Image source={{ uri: brand.logoUrl }} style={styles.logo} resizeMode="contain" />
          ) : (
            <Text style={styles.logoFallback} numberOfLines={1}>
              Tickets Transfer
            </Text>
          )}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PAD,
    paddingBottom: 12,
    gap: 8,
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
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  logoGlow: {
    maxWidth: 280,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  logo: {
    width: '100%',
    aspectRatio: LOGO_ASPECT,
    maxHeight: 52,
  },
  logoFallback: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
