/**
 * Home – INICIO (centrado, letra grande), icono usuario → menú; tarjetas KYC, Publicar, Comprar Ticket, Mis compras/ventas; redes; Cerrar Sesion.
 * Ubicación: apps/mobile/src/screens/HomeScreen.tsx
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { getBiometricsEnabled } from '../lib/secureStorage';
import { BiometricActivationModal } from '../components/BiometricActivationModal';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors, spacing, radius, glassCard } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export function HomeScreen() {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const {
    logout,
    getPostRegisterRedirectToKyc,
    clearPostRegisterRedirectToKyc,
    getPendingBiometricPrompt,
    clearPendingBiometricPrompt,
    enableBiometrics,
    biometricAvailability,
  } = useAuth();
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    if (getPostRegisterRedirectToKyc()) {
      clearPostRegisterRedirectToKyc();
      navigation.navigate('Kyc');
    }
  }, [getPostRegisterRedirectToKyc, clearPostRegisterRedirectToKyc, navigation]);

  useEffect(() => {
    if (!getPendingBiometricPrompt() || !biometricAvailability) return;
    clearPendingBiometricPrompt();
    getBiometricsEnabled().then((enabled) => {
      if (biometricAvailability.available && !enabled) {
        setShowBiometricModal(true);
      }
    });
  }, [biometricAvailability, getPendingBiometricPrompt, clearPendingBiometricPrompt]);

  const handleLogout = () => logout();

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="INICIO"
          showBack={navigation.canGoBack()}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          rightSlot={<UserMenuButton />}
        />
        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('Kyc')}>
          <Text style={styles.cardTitle}>Verificación KYC</Text>
          <Text style={styles.cardSubtitle}>Verificar identidad con DNI y selfie</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('Publish', {})}>
          <Text style={styles.cardTitle}>Publicar ticket</Text>
          <Text style={styles.cardSubtitle}>Vender o intercambiar tu entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('ComprarTicket')}>
          <Text style={styles.cardTitle}>Comprar Ticket</Text>
          <Text style={styles.cardSubtitle}>Buscar por ID y comprar de forma segura</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('MyPurchases')}>
          <Text style={styles.cardTitle}>Mis compras</Text>
          <Text style={styles.cardSubtitle}>Órdenes como comprador</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('MySales')}>
          <Text style={styles.cardTitle}>Mis ventas</Text>
          <Text style={styles.cardSubtitle}>Órdenes como vendedor</Text>
        </TouchableOpacity>

        <Text style={styles.socialTitle}>Seguinos en nuestras redes</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#1877f2' }]} onPress={() => Linking.openURL('https://facebook.com')}>
            <FontAwesome name="facebook" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#e1306c' }]} onPress={() => Linking.openURL('https://instagram.com')}>
            <FontAwesome name="instagram" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#25d366' }]} onPress={() => Linking.openURL('https://wa.me')}>
            <FontAwesome name="whatsapp" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesion</Text>
        </TouchableOpacity> */}
        
      </ScrollView>

      <BiometricActivationModal
        visible={showBiometricModal}
        biometricType={biometricAvailability?.type ?? null}
        onActivate={enableBiometrics}
        onSkip={() => setShowBiometricModal(false)}
        onSuccess={() => setShowBiometricModal(false)}
      />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  banner: { marginBottom: spacing.lg, alignItems: 'center' },
  bannerLogo: { width: 200, height: 56 },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { color: colors.text, fontWeight: '600', fontSize: 16 },
  cardSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  socialTitle: { fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: 'center' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  logoutText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
