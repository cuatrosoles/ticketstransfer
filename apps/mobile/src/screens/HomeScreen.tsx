/**
 * Home – Portada inspirada en mockup: banner promo, destacados y recomendados.
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabParamList, TabCompositeNavigationProp } from '../navigation/types';
import { TopLoadingBar } from '../components/TopLoadingBar';
import { useAuth } from '../context/AuthContext';
import { BiometricActivationModal } from '../components/BiometricActivationModal';
import { AuthBackground } from '../components/AuthBackground';
import { HomeHeroHeader } from '../components/HomeHeroHeader';
import { HomeEventCard } from '../components/HomeEventCard';
import { useBranding } from '../context/BrandingContext';
import { useUserMenu } from '../context/UserMenuContext';
import { useProfileImage } from '../context/ProfileImageContext';
import { useFavorites } from '../context/FavoritesContext';
import { getMarketplacePublicListings, type MarketplacePublicItem } from '../lib/api';
import { formatDateTime } from '../lib/datetime';
import { colors, spacing } from '../theme';

type Nav = TabCompositeNavigationProp<'Home'>;

export function HomeScreen() {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplacePublicItem[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState('');
  const [topLoadingBar, setTopLoadingBar] = useState(false);
  const route = useRoute<RouteProp<MainTabParamList, 'Home'>>();
  const {
    getPostRegisterRedirectToKyc,
    clearPostRegisterRedirectToKyc,
    getPendingBiometricPrompt,
    clearPendingBiometricPrompt,
    enableBiometrics,
    biometricEnabled,
    biometricAvailability,
  } = useAuth();
  const navigation = useNavigation<Nav>();
  const brand = useBranding();
  const { openMenu } = useUserMenu();
  const { profileImageUrl } = useProfileImage();
  const { width } = useWindowDimensions();
  const carouselCardWidth = Math.round(Math.min(168, width * 0.44));
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (getPostRegisterRedirectToKyc()) {
      clearPostRegisterRedirectToKyc();
      navigation.navigate('Kyc');
    }
  }, [getPostRegisterRedirectToKyc, clearPostRegisterRedirectToKyc, navigation]);

  useEffect(() => {
    if (!getPendingBiometricPrompt() || !biometricAvailability) return;
    clearPendingBiometricPrompt();
    if (biometricAvailability.available && !biometricEnabled) {
      setShowBiometricModal(true);
    }
  }, [biometricAvailability, biometricEnabled, getPendingBiometricPrompt, clearPendingBiometricPrompt]);

  const loadMarketplace = useCallback(() => {
    let cancelled = false;
    setMarketplaceLoading(true);
    setMarketplaceError('');
    getMarketplacePublicListings()
      .then((res) => {
        if (!cancelled) setMarketplaceItems(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setMarketplaceError('No se pudieron cargar los eventos.');
      })
      .finally(() => {
        if (!cancelled) setMarketplaceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadMarketplace();
    return cleanup;
  }, [loadMarketplace]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshListings) {
        setTopLoadingBar(true);
        loadMarketplace();
        navigation.setParams({ refreshListings: undefined });
      }
    }, [route.params?.refreshListings, loadMarketplace, navigation])
  );

  const featured = marketplaceItems.slice(0, 2);
  const recommended = marketplaceItems.slice(2, 14);

  const goDetail = (id: string) => {
    navigation.navigate('ComprarTicketDetalle', { listingId: id, password: '' });
  };

  const goTienda = () => navigation.navigate('Tienda');

  return (
    <AuthBackground>
      <TopLoadingBar visible={topLoadingBar} onFinish={() => setTopLoadingBar(false)} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <HomeHeroHeader
            profileImageUri={profileImageUrl}
            onOpenMenu={openMenu}
            onBell={() => navigation.navigate('Mensajes')}
            onAvatar={() => navigation.navigate('Profile')}
          />

          <View style={{ marginLeft: '-18%', marginBottom: '6%'}}>
            <TouchableOpacity onPress={goTienda} activeOpacity={0.2}>
              <Image source={require('../assets/images/home-hero-ref.png')} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Eventos destacados</Text>
            <TouchableOpacity onPress={goTienda} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {marketplaceLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={brand.primaryLight} size="large" />
            </View>
          ) : marketplaceError ? (
            <View style={styles.fallback}>
              <Text style={styles.err}>{marketplaceError}</Text>
              <TouchableOpacity style={[styles.promoBtn, { backgroundColor: brand.primaryHex, alignSelf: 'center' }]} onPress={goTienda}>
                <Text style={styles.promoBtnText}>Ir a la tienda</Text>
              </TouchableOpacity>
            </View>
          ) : featured.length === 0 ? (
            <View style={styles.fallback}>
              <Text style={styles.hint}>No hay eventos destacados por el momento.</Text>
              <TouchableOpacity style={[styles.promoBtn, { backgroundColor: brand.primaryHex, alignSelf: 'center' }]} onPress={goTienda}>
                <Text style={styles.promoBtnText}>Ir a la tienda</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.featuredRow}>
              {featured.map((item) => (
                <HomeEventCard
                  key={item.id}
                  item={item}
                  variant="featured"
                  formatEventDateTime={formatDateTime}
                  onPress={() => goDetail(item.id)}
                  showFavoriteToggle
                  favoriteActive={isFavorite(item.id)}
                  onFavoritePress={() => toggleFavorite(item)}
                />
              ))}
            </View>
          )}

          <View style={[styles.sectionHead, { marginTop: spacing.lg }]}>
            <Text style={styles.sectionTitle}>Recomendados para vos</Text>
            <TouchableOpacity onPress={goTienda} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {!marketplaceLoading && recommended.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {recommended.map((item) => (
                <View key={item.id} style={[styles.carouselCell, { width: carouselCardWidth }]}>
                  <HomeEventCard
                    item={item}
                    variant="carousel"
                    carouselWidth={carouselCardWidth}
                    formatEventDateTime={formatDateTime}
                    onPress={() => goDetail(item.id)}
                    showFavoriteToggle
                    favoriteActive={isFavorite(item.id)}
                    onFavoritePress={() => toggleFavorite(item)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : null}
        </ScrollView>
      </SafeAreaView>

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
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  promoOuter: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.38)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  promoCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderTopWidth: 3,
    borderTopColor: 'rgba(96, 165, 250, 0.95)',
  },
  promoTopGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '42%',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  promoCopy: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  promoSub: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  promoBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  promoBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  promoMascot: {
    width: 460,
    height: 160,
    flexShrink: 0,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93c5fd',
  },
  featuredRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  carousel: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
    flexDirection: 'row',
  },
  carouselCell: {
    marginRight: spacing.sm,
  },
  loader: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  err: { color: '#f87171', textAlign: 'center', fontSize: 14 },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
});
