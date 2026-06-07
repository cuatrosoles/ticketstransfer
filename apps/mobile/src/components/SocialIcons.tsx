/**
 * Iconos redes sociales – Facebook, Instagram, WhatsApp (PNG).
 * Ubicación: apps/mobile/src/components/SocialIcons.tsx
 */

import * as React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Linking, type ImageSourcePropType } from 'react-native';

const SOCIAL_LINKS: Array<{
  id: string;
  label: string;
  uri: string;
  source: ImageSourcePropType;
  bg: string;
}> = [
  {
    id: 'facebook',
    label: 'Facebook',
    uri: 'https://www.facebook.com/profile.php?id=61562829737223',
    source: require('../assets/images/FACE.png'),
    bg: '#1877f2',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    uri: 'https://www.instagram.com/ticketstransfer.01/?ref=xav_igxfb_comet_ig_bookmark_mega_menu_launch',
    source: require('../assets/images/INSTA.png'),
    bg: '#c13584',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    uri: 'https://wa.me/+5491176675436',
    source: require('../assets/images/WHATS.png'),
    bg: '#25d366',
  },
];

export function SocialIcons() {
  const openLink = (uri: string) => {
    void Linking.openURL(uri).catch(() => {});
  };

  return (
    <View style={styles.row} accessibilityRole="list">
      {SOCIAL_LINKS.map(({ id, label, uri, source, bg }) => (
        <TouchableOpacity
          key={id}
          style={[styles.iconBtn, { backgroundColor: bg }]}
          onPress={() => openLink(uri)}
          accessibilityRole="button"
          accessibilityLabel={label}
          activeOpacity={0.85}
        >
          <Image source={source} style={styles.iconImg} resizeMode="contain" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  iconImg: {
    width: 28,
    height: 28,
  },
});
