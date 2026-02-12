/**
 * Botón de usuario para el header – Abre el dropdown como en web.
 * Estilo compacto: círculo sutil, sin padding excesivo.
 */

import * as React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useUserMenu } from '../context/UserMenuContext';

export function UserMenuButton() {
  const { openMenu } = useUserMenu();

  return (
    <TouchableOpacity onPress={openMenu} style={styles.btn} hitSlop={{ top: 8, bottom: 8 }}>
      <Text style={styles.icon}>👤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f8fafc',
  },
  icon: { fontSize: 20 },
});
