/**
 * Dropdown de usuario – Igual que web: Perfil, Tickets, etc. y Cerrar sesión.
 * Se muestra desde cualquier pantalla autenticada al tocar el icono 👤.
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useUserMenu } from '../context/UserMenuContext';

const MENU_ITEMS = [
  { id: 'inicio', label: 'Inicio', route: 'Main' as const },
  { id: 'perfil', label: 'Información de tu perfil', route: 'Profile' as const },
  { id: 'tarjetas', label: 'Tarjetas adheridas', route: 'TarjetasAdheridas' as const },
  { id: 'soporte', label: 'Chat Soporte', route: 'ChatSoporte' as const },
  { id: 'mensajes', label: 'Mensajes', route: 'Mensajes' as const },
  { id: 'politica', label: 'Política de privacidad y uso de datos', route: 'PoliticaPrivacidad' as const },
  { id: 'terminos', label: 'Términos y condiciones de uso', route: 'TerminosYCondiciones' as const },
  { id: 'acerca', label: 'Acerca de', route: 'Acerca' as const },
  { id: 'recomendaciones', label: 'Recomendaciones y quejas', route: 'RecomendacionesQuejas' as const },
  { id: 'faq', label: 'Preguntas frecuentes', route: 'PreguntasFrecuentes' as const },
  { id: 'baja', label: 'Solicitar baja de cuenta', route: 'SolicitarBaja' as const },
];

export function UserMenuModal() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { isOpen, closeMenu } = useUserMenu();

  const handleItemPress = (route: keyof RootStackParamList) => {
    closeMenu();
    if (route === 'OrderPago') return;
    navigation.navigate(route as never, {} as never);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeMenu} />
        <View style={styles.menuContainer}>
          <View style={styles.menuBox}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleItemPress(item.route)}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    ['politica', 'terminos', 'acerca', 'recomendaciones', 'faq', 'baja'].includes(item.id) &&
                      styles.menuItemLink,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 24,
  },
  menuContainer: {},
  menuBox: {
    backgroundColor: 'rgba(30, 58, 138, 0.95)',
    borderRadius: 20,
    paddingVertical: 8,
    minWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  menuItem: { paddingVertical: 14, paddingHorizontal: 24 },
  menuItemText: { color: '#f8fafc', fontSize: 16, fontFamily: 'serif', fontWeight: '700' },
  menuItemLink: { color: '#60a5fa' },
  logoutBtn: {
    marginTop: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
  },
  logoutText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});
