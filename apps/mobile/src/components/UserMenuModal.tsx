/**
 * Menú lateral – drawer desde la izquierda con logo TT, íconos y neón (Cap03).
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useUserMenu } from '../context/UserMenuContext';
import { neonGlow } from '../lib/neonStyles';

const LOGO_TT = require('../assets/images/LogoTT-1920x1036.png');
const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 320);

type MenuEntry =
  | { id: string; label: string; icon: string; kind: 'tab'; tab: keyof MainTabParamList }
  | { id: string; label: string; icon: string; kind: 'stack'; route: keyof RootStackParamList };

const MENU_ITEMS: MenuEntry[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home', kind: 'tab', tab: 'Home' },
  { id: 'tarjetas', label: 'Tarjetas adheridas', icon: 'credit-card', kind: 'stack', route: 'TarjetasAdheridas' },
  { id: 'soporte', label: 'Chat soporte', icon: 'comments', kind: 'stack', route: 'ChatSoporte' },
  { id: 'mensajes', label: 'Mensajes', icon: 'bell', kind: 'stack', route: 'Mensajes' },
  { id: 'politica', label: 'Política de privacidad y uso de datos', icon: 'shield', kind: 'stack', route: 'PoliticaPrivacidad' },
  { id: 'terminos', label: 'Términos y condiciones de uso', icon: 'file-text-o', kind: 'stack', route: 'TerminosYCondiciones' },
  { id: 'acerca', label: 'Acerca de', icon: 'info-circle', kind: 'stack', route: 'Acerca' },
  { id: 'recomendaciones', label: 'Recomendaciones y quejas', icon: 'star', kind: 'stack', route: 'RecomendacionesQuejas' },
  { id: 'faq', label: 'Preguntas frecuentes', icon: 'question-circle', kind: 'stack', route: 'PreguntasFrecuentes' },
  { id: 'baja', label: 'Eliminar cuenta', icon: 'ban', kind: 'stack', route: 'SolicitarBaja' },
];

export function UserMenuModal() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { isOpen, closeMenu } = useUserMenu();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activeTab = useNavigationState((state) => {
    const mainRoute = state?.routes?.find((r) => r.name === 'Main');
    const tabState = mainRoute?.state;
    if (tabState && 'index' in tabState && tabState.routes) {
      const idx = tabState.index ?? 0;
      return tabState.routes[idx]?.name as keyof MainTabParamList | undefined;
    }
    return undefined;
  });

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen, slideAnim, fadeAnim]);

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
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={closeMenu}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeMenu} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            neonGlow('#38bdf8', 'strong'),
            { width: DRAWER_WIDTH, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.drawerInner}>
            <View style={styles.logoWrap}>
              <Image source={LOGO_TT} style={styles.logo} resizeMode="contain" />
            </View>

            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map((item) => {
                const active = item.kind === 'tab' && item.tab === activeTab;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuItem, active && styles.menuItemActive]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.85}
                  >
                    <FontAwesome
                      name={item.icon}
                      size={18}
                      color={active ? '#ffffff' : '#93c5fd'}
                      style={styles.menuIcon}
                    />
                    <Text style={[styles.menuItemText, active && styles.menuItemTextActive]} numberOfLines={2}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.logoutBtn, neonGlow('#60a5fa', 'soft')]} onPress={handleLogout}>
              <FontAwesome name="sign-out" size={18} color="#ffffff" style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawer: {
    height: '100%',
    backgroundColor: 'rgba(8, 18, 40, 0.97)',
    borderRightWidth: 1.5,
    borderRightColor: 'rgba(96, 165, 250, 0.65)',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
  },
  drawerInner: {
    flex: 1,
    paddingTop: 52,
    paddingBottom: 24,
  },
  logoWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 64,
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginBottom: 4,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
  },
  menuIcon: {
    width: 22,
    textAlign: 'center',
  },
  menuItemText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  menuItemTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(147, 197, 253, 0.55)',
    gap: 10,
  },
  logoutIcon: {},
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
