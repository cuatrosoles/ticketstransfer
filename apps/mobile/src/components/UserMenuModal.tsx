/**
 * Dropdown de usuario – Igual que web: Perfil, Tickets, etc. y Cerrar sesión.
 * Las entradas que corresponden a pestañas navegan dentro de Main (tabs).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useUserMenu } from '../context/UserMenuContext';

type MenuEntry =
  | { id: string; label: string; kind: 'tab'; tab: keyof MainTabParamList }
  | { id: string; label: string; kind: 'stack'; route: keyof RootStackParamList };

const MENU_ITEMS: MenuEntry[] = [
  { id: 'inicio', label: 'Inicio', kind: 'tab', tab: 'Home' },
  
  ///{ id: 'perfil', label: 'Información de tu perfil', kind: 'tab', tab: 'Profile' },
  
  { id: 'soporte', label: 'Chat Soporte', kind: 'stack', route: 'ChatSoporte' },
  { id: 'mensajes', label: 'Mensajes', kind: 'stack', route: 'Mensajes' },
  { id: 'politica', label: 'Política de privacidad y uso de datos', kind: 'stack', route: 'PoliticaPrivacidad' },
  { id: 'terminos', label: 'Términos y condiciones de uso', kind: 'stack', route: 'TerminosYCondiciones' },
  { id: 'acerca', label: 'Acerca de', kind: 'stack', route: 'Acerca' },
  { id: 'recomendaciones', label: 'Recomendaciones y quejas', kind: 'stack', route: 'RecomendacionesQuejas' },
  { id: 'faq', label: 'Preguntas frecuentes', kind: 'stack', route: 'PreguntasFrecuentes' },
  { id: 'baja', label: 'Solicitar baja de cuenta', kind: 'stack', route: 'SolicitarBaja' },
];

export function UserMenuModal() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { isOpen, closeMenu } = useUserMenu();

  const handleItemPress = (item: MenuEntry) => {
    closeMenu();
    if (item.kind === 'tab') {
      navigation.navigate('Main', { screen: item.tab });
      return;
    }
    if (item.route === 'OrderPago') return;
    navigation.navigate(item.route as never);
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
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleItemPress(item)}>
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
  menuItemText: { color: '#f8fafc', fontSize: 16, fontFamily: 'Cooper-Black', fontWeight: '700' },
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
  logoutText: { color: '#ffffff', fontWeight: '600', fontSize: 16, fontFamily: 'Cooper-Black' },
});
