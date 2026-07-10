/**
 * Menú lateral – drawer flotante (Cap03): margen superior/izquierdo, logo con halo,
 * ítems con gradiente horizontal e íconos en casillas redondeadas.
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
  ImageBackground,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { RootStackParamList, MainTabParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useUserMenu } from '../context/UserMenuContext';
import { neonGlow } from '../lib/neonStyles';

const LOGO_TT = require('../assets/images/LogoTT-1920x1036.png');
const DRAWER_BG = require('../assets/images/fondoApp1.jpg');
const LOGO_ASPECT = 1920 / 1036;

const DRAWER_MARGIN_LEFT = 10;
const DRAWER_MARGIN_TOP = 56;
const DRAWER_MARGIN_BOTTOM = 6;
const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH - DRAWER_MARGIN_LEFT * 2, 240);

type MenuEntry =
  | { id: string; label: string; icon: string; iconVariant?: 'shield-check'; badge?: string; kind: 'tab'; tab: keyof MainTabParamList }
  | { id: string; label: string; icon: string; iconVariant?: 'shield-check'; badge?: string; kind: 'stack'; route: keyof RootStackParamList };

const MENU_ITEMS: MenuEntry[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home', kind: 'tab', tab: 'Home' },
  ///{ id: 'tarjetas', label: 'Tarjetas adheridas', icon: 'credit-card', kind: 'stack', route: 'TarjetasAdheridas' },
  { id: 'soporte', label: 'Chat soporte', icon: 'comments', kind: 'stack', route: 'ChatSoporte' },
  { id: 'mensajes', label: 'Mensajes', icon: 'bell', kind: 'stack', route: 'Mensajes' },
  { id: 'politica', label: 'Política de privacidad y uso de datos', icon: 'shield', kind: 'stack', route: 'PoliticaPrivacidad' },
  { id: 'terminos', label: 'Términos y condiciones de uso', icon: 'file-text-o', kind: 'stack', route: 'TerminosYCondiciones' },
  {
    id: 'antifraude',
    label: 'Política antifraude',
    icon: 'shield',
    iconVariant: 'shield-check',
    badge: 'NUEVO',
    kind: 'stack',
    route: 'PoliticaAntifraude',
  },
  { id: 'acerca', label: 'Acerca de', icon: 'info-circle', kind: 'stack', route: 'Acerca' },
  { id: 'recomendaciones', label: 'Recomendaciones y quejas', icon: 'star', kind: 'stack', route: 'RecomendacionesQuejas' },
  { id: 'faq', label: 'Preguntas frecuentes', icon: 'question-circle', kind: 'stack', route: 'PreguntasFrecuentes' },
  { id: 'baja', label: 'Eliminar cuenta', icon: 'ban', kind: 'stack', route: 'SolicitarBaja' },
];

const ROW_GRADIENT_ACTIVE: [string, string] = ['rgba(72, 130, 220, 0.78)', 'rgba(5, 12, 32, 0.96)'];
const ROW_GRADIENT_DEFAULT: [string, string] = ['rgba(48, 98, 190, 0.42)', 'rgba(5, 12, 32, 0.9)'];

const LOGO_HEIGHT = 30;

function MenuRow({
  item,
  active,
  onPress,
}: {
  item: MenuEntry;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.menuItemTouch}>
      <LinearGradient
        colors={active ? ROW_GRADIENT_ACTIVE : ROW_GRADIENT_DEFAULT}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.menuItem, active && styles.menuItemActive]}
      >
        <View style={[styles.iconBox, active && styles.iconBoxActive]}>
          {item.iconVariant === 'shield-check' ? (
            <View style={styles.shieldCheckWrap}>
              <FontAwesome name="shield" size={15} color="#f8fafc" />
              <FontAwesome name="check" size={8} color="#60a5fa" style={styles.shieldCheckMark} />
            </View>
          ) : (
            <FontAwesome name={item.icon} size={15} color="#f8fafc" />
          )}
        </View>
        <Text style={[styles.menuItemText, active && styles.menuItemTextActive]} numberOfLines={2}>
          {item.label}
        </Text>
        {item.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function UserMenuModal() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const { isOpen, closeMenu } = useUserMenu();
  const slideAnim = useRef(new Animated.Value(-(DRAWER_WIDTH + DRAWER_MARGIN_LEFT + 8))).current;
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
    const hiddenX = -(DRAWER_WIDTH + DRAWER_MARGIN_LEFT + 8);
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: hiddenX, duration: 220, useNativeDriver: true }),
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
            styles.drawerShell,
            neonGlow('#38bdf8', 'strong'),
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ImageBackground
            source={DRAWER_BG}
            style={styles.drawer}
            imageStyle={styles.drawerBgImage}
            resizeMode="cover"
          >
            <View style={styles.drawerInner}>
              <View style={styles.logoWrap}>
                <View style={[styles.logoHalo, neonGlow('#38bdf8', 'strong')]}>
                  <Image
                    source={LOGO_TT}
                    style={{ width: LOGO_HEIGHT * LOGO_ASPECT, height: LOGO_HEIGHT }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                {MENU_ITEMS.map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    active={item.kind === 'tab' && item.tab === activeTab}
                    onPress={() => handleItemPress(item)}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.logoutBtn, neonGlow('#60a5fa', 'soft')]}
                onPress={handleLogout}
                activeOpacity={0.88}
              >
                <View style={styles.iconBox}>
                  <FontAwesome name="sign-out" size={15} color="#f8fafc" />
                </View>
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  drawerShell: {
    position: 'absolute',
    left: DRAWER_MARGIN_LEFT,
    top: DRAWER_MARGIN_TOP,
    bottom: DRAWER_MARGIN_BOTTOM,
    borderRadius: 24,
  },
  drawer: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.55)',
  },
  drawerBgImage: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 24,
  },
  drawerInner: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 6,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoHalo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItemTouch: {
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.28)',
  },
  menuItemActive: {
    borderColor: 'rgba(147, 197, 253, 0.55)',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 20, 48, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.38)',
  },
  iconBoxActive: {
    borderColor: 'rgba(147, 197, 253, 0.65)',
    backgroundColor: 'rgba(12, 28, 68, 0.95)',
  },
  shieldCheckWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldCheckMark: {
    position: 'absolute',
    top: 5,
  },
  menuItemText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  menuItemTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.55)',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 14,
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(147, 197, 253, 0.55)',
    backgroundColor: 'rgba(8, 18, 40, 0.55)',
    gap: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
