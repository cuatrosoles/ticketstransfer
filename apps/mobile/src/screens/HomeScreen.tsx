/**
 * Home – INICIO (centrado, letra grande), icono usuario → menú; tarjetas KYC, Publicar, Comprar Ticket, Mis compras/ventas; redes; Cerrar Sesion.
 * Ubicación: apps/mobile/src/screens/HomeScreen.tsx
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  useWindowDimensions,
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
import { getMarketplacePublicListings, type MarketplacePublicItem } from '../lib/api';
import { MarketplaceTicketCard } from '../components/MarketplaceTicketCard';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

function formatEventDateTime(iso: string | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HomeScreen() {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplacePublicItem[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState('');
  const {
    getPostRegisterRedirectToKyc,
    clearPostRegisterRedirectToKyc,
    getPendingBiometricPrompt,
    clearPendingBiometricPrompt,
    enableBiometrics,
    biometricAvailability,
  } = useAuth();
  const navigation = useNavigation<Nav>();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const marketplaceMaxHeight = windowHeight * 0.4;
  /** Columna ~48% del ancho útil: altura mínima > ancho para que el stub se lea en vertical */
  const homeMarketplaceCardMinHeight = Math.round(
    Math.max(232, (windowWidth - spacing.lg * 2) * 0.48 * 1.42)
  );

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

  useEffect(() => {
    let cancelled = false;
    setMarketplaceLoading(true);
    setMarketplaceError('');
    getMarketplacePublicListings()
      .then((res) => {
        if (!cancelled) setMarketplaceItems(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setMarketplaceError('No se pudieron cargar los tickets públicos.');
      })
      .finally(() => {
        if (!cancelled) setMarketplaceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="INICIO"
          showBack={navigation.canGoBack()}
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
          rightSlot={<UserMenuButton />}
        />

        <Text style={styles.sectionTitle}>Tickets a la Venta</Text>
        <Text style={styles.sectionHint}>Publicaciones visibles para todos los usuarios</Text>
        <View style={[styles.marketplaceSection, { height: marketplaceMaxHeight }]}>
          {marketplaceLoading ? (
            <View style={styles.marketplaceLoading}>
              <ActivityIndicator color={colors.primaryLight} />
            </View>
          ) : marketplaceError ? (
            <View style={styles.marketplaceFallback}>
              <Text style={styles.marketplaceError}>{marketplaceError}</Text>
              <TouchableOpacity style={styles.tiendaBtn} onPress={() => navigation.navigate('Tienda')}>
                <Text style={styles.tiendaBtnText}>Ir a la Tienda</Text>
              </TouchableOpacity>
            </View>
          ) : marketplaceItems.length === 0 ? (
            <View style={styles.marketplaceFallback}>
              <Text style={styles.marketplaceEmpty}>No hay tickets públicos por el momento.</Text>
              <TouchableOpacity style={styles.tiendaBtn} onPress={() => navigation.navigate('Tienda')}>
                <Text style={styles.tiendaBtnText}>Ir a la Tienda</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                nestedScrollEnabled
                style={styles.marketplaceScroll}
                showsVerticalScrollIndicator
                contentContainerStyle={styles.marketplaceScrollContent}
              >
                <View style={styles.marketplaceGrid}>
                  {marketplaceItems.map((item) => (
                    <View key={item.id} style={styles.marketplaceCell}>
                      <MarketplaceTicketCard
                        compact
                        minFrameHeight={homeMarketplaceCardMinHeight}
                        item={item}
                        formatEventDateTime={formatEventDateTime}
                        onPress={() =>
                          navigation.navigate('ComprarTicketDetalle', {
                            listingId: item.id,
                            password: '',
                          })
                        }
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity style={styles.tiendaBtn} onPress={() => navigation.navigate('Tienda')}>
                <Text style={styles.tiendaBtnText}>Ir a la Tienda</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  marketplaceSection: {
    marginBottom: spacing.lg,
  },
  marketplaceFallback: { flex: 1, justifyContent: 'center' },
  marketplaceLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  marketplaceError: { color: '#f87171', marginBottom: spacing.md, fontSize: 13, textAlign: 'center' },
  marketplaceEmpty: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: spacing.md },
  marketplaceScroll: { flex: 1 },
  marketplaceScrollContent: { paddingBottom: spacing.xs },
  marketplaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  marketplaceCell: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  tiendaBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  tiendaBtnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  banner: { marginBottom: spacing.lg, alignItems: 'center' },
  bannerLogo: { width: 200, height: 56 },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 18, fontFamily: 'serif' },
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
