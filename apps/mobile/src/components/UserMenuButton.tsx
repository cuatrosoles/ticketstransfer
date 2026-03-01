/**
 * Botón de usuario para el header – Abre el dropdown como en web.
 * Muestra la imagen de perfil si existe, sino el icono de usuario.
 */

import * as React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useUserMenu } from '../context/UserMenuContext';
import { useProfileImage } from '../context/ProfileImageContext';
import { ensureImageUrl } from '../lib/api';

export function UserMenuButton() {
  const { openMenu } = useUserMenu();
  const { profileImageUrl } = useProfileImage();
  const imageUri = ensureImageUrl(profileImageUrl);

  return (
    <TouchableOpacity onPress={openMenu} style={styles.btn} hitSlop={{ top: 8, bottom: 8 }}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatar} />
      ) : (
        <FontAwesome name="user" size={18} color="#fff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
