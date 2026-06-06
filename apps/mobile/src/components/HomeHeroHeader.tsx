/**
 * Header Home: menú, campana y avatar (sin logo central – Cap04/Cap16).
 */

import * as React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ensureImageUrl } from '../lib/api';
import { headerEdgePadding, headerTopPadding } from '../theme';
import { neonGlow } from '../lib/neonStyles';

type Props = {
  profileImageUri: string | null;
  onOpenMenu: () => void;
  onBell: () => void;
  onAvatar: () => void;
};

export function HomeHeroHeader({ profileImageUri, onOpenMenu, onBell, onAvatar }: Props) {
  const uriDisplay = ensureImageUrl(profileImageUri);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.menuBtn, neonGlow('#38bdf8', 'soft')]}
        onPress={onOpenMenu}
        accessibilityLabel="Menú"
      >
        <FontAwesome name="bars" size={20} color="#f8fafc" />
      </TouchableOpacity>

      <View style={styles.spacer} />

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
    borderColor: 'rgba(96, 165, 250, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  spacer: { flex: 1 },
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
