/**
 * Home – Portada con banner TIENDA, secciones destacados / cercanos / recomendados (Cap02, Cap16).
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
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList, TabCompositeNavigationProp } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { BiometricActivationModal } from '../components/BiometricActivationModal';
import { AuthBackground } from '../components/AuthBackground';
import { HomeHeroHeader } from '../components/HomeHeroHeader';
import { HeroImageBanner } from '../components/HeroImageBanner';
import { HomeEventCard, HOME_CARD_WIDTHS } from '../components/HomeEventCard';
import { GradientButton } from '../components/GradientButton';
import { SocialIcons } from '../components/SocialIcons';
import { useBranding } from '../context/BrandingContext';
import { useUserMenu } from '../context/UserMenuContext';
import { useProfileImage } from '../context/ProfileImageContext';
import { useFavorites } from '../context/FavoritesContext';
import { getMarketplaceRecommended, getMarketplaceNearby, recordListingInteraction, type MarketplacePublicItem } from '../lib/api';
import { DEFAULT_NEARBY_RADIUS_KM } from '@tickets-transfer/shared';
import { formatDateTime } from '../lib/datetime';
import { colors, spacing, screenRoot, screenScroll } from '../theme';

const HERO_IMAGE = require('../assets/images/TIENDA-1920x1054.png');

type Nav = TabCompositeNavigationProp<'Home'>;

export function HomeScreen() {
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [featured, setFeatured] = useState<MarketplacePublicItem[]>([]);
  const [recommended, setRecommended] = useState<MarketplacePublicItem[]>([]);
  const [nearby, setNearby] = useState<MarketplacePublicItem[]>([]);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [nearbyLocationMissing, setNearbyLocationMissing] = useState(false);
  const [personalized, setPersonalized] = useState(false);
  const [marketplaceLoading, setMarketplaceLoading] = useState(true);
  const [marketplaceError, setMarketplaceError] = useState('');
  const route = useRoute<RouteProp<MainTabParamList, 'Home'>>();
  const {
    getPostRegisterRedirectToKyc,
    clearPostRegisterRedirectToKyc,
    getPostRegisterRedirectToPreferences,
    clearPostRegisterRedirectToPreferences,
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
  const insets = useSafeAreaInsets();
  const nearbyCardWidth = Math.round(Math.min(HOME_CARD_WIDTHS.nearby, width * 0.48));
  const recommendedCardWidth = Math.round(Math.min(HOME_CARD_WIDTHS.recommended, width * 0.38));
  const nearbyRadius = brand.data?.marketplaceNearbyRadiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (getPostRegisterRedirectToPreferences()) {
      clearPostRegisterRedirectToPreferences();
      navigation.navigate('PreferencesOnboarding');
      return;
    }
    if (getPostRegisterRedirectToKyc()) {
      clearPostRegisterRedirectToKyc();
      navigation.navigate('Kyc');
    }
  }, [
    getPostRegisterRedirectToPreferences,
    clearPostRegisterRedirectToPreferences,
    getPostRegisterRedirectToKyc,
    clearPostRegisterRedirectToKyc,
    navigation,
  ]);

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
    setNearbyLoading(true);
    setMarketplaceError('');
    setNearbyLocationMissing(false);

    const recommendedReq = getMarketplaceRecommended();
    const nearbyReq = getMarketplaceNearby(nearbyRadius).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : '';
      if (msg.toLowerCase().includes('ubicación') || msg.toLowerCase().includes('location')) {
        return null;
      }
      throw e;
    });

    Promise.all([recommendedReq, nearbyReq])
      .then(([res, nearbyRes]) => {
        if (cancelled) return;
        setFeatured(res.featured ?? []);
        setRecommended(res.recommended ?? []);
        setPersonalized(Boolean(res.personalized));

        if (nearbyRes == null) {
          setNearby([]);
          setNearbyRadiusKm(null);
          setNearbyLocationMissing(true);
        } else {
          setNearby(nearbyRes.items ?? []);
          setNearbyRadiusKm(nearbyRes.radiusKm ?? nearbyRadius);
          setNearbyLocationMissing(false);
        }
      })
      .catch(() => {
        if (!cancelled) setMarketplaceError('No se pudieron cargar los eventos.');
      })
      .finally(() => {
        if (!cancelled) {
          setMarketplaceLoading(false);
          setNearbyLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [nearbyRadius]);

  useEffect(() => {
    const cleanup = loadMarketplace();
    return cleanup;
  }, [loadMarketplace]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshListings) {
        loadMarketplace();
        navigation.setParams({ refreshListings: undefined });
      }
    }, [route.params?.refreshListings, loadMarketplace, navigation])
  );

  const goDetail = (item: MarketplacePublicItem) => {
    void recordListingInteraction(item.id, 'CLICK', item.category).catch(() => {});
    navigation.navigate('ComprarTicketDetalle', { listingId: item.id, password: '' });
  };

  const goTienda = () => navigation.navigate('Tienda');

  const renderCarousel = (
    items: MarketplacePublicItem[],
    variant: 'nearby' | 'recommended',
    keyPrefix: string,
    cardWidth: number
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {items.map((item) => (
        <View key={`${keyPrefix}-${item.id}`} style={[styles.carouselCell, { width: cardWidth }]}>
          <HomeEventCard
            item={item}
            variant={variant}
            carouselWidth={cardWidth}
            formatEventDateTime={formatDateTime}
            onPress={() => goDetail(item)}
            showFavoriteToggle
            favoriteActive={isFavorite(item.id)}
            onFavoritePress={() => toggleFavorite(item)}
          />
        </View>
      ))}
    </ScrollView>
  );

  return (
    <AuthBackground>
      <SafeAreaView style={styles.safe} edges={[]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <TouchableOpacity activeOpacity={0.92} onPress={goTienda}>
              <HeroImageBanner
                source={HERO_IMAGE}
                aspectRatio={0.58}
                edgeFadeTop={{ heightPx: 0 }}
                edgeFadeBottom={{ heightPx: 34 }}
              />
            </TouchableOpacity>
            <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
              <HomeHeroHeader
                profileImageUri={profileImageUrl}
                onOpenMenu={openMenu}
                onBell={() => navigation.navigate('Mensajes')}
                onAvatar={() => navigation.navigate('Profile')}
              />
            </View>
          </View>

          <View style={styles.body}>
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
                <GradientButton title="Ir a la tienda" onPress={goTienda} style={{ alignSelf: 'center' }} />
              </View>
            ) : featured.length === 0 ? (
              <View style={styles.fallback}>
                <Text style={styles.hint}>No hay eventos destacados por el momento.</Text>
                <GradientButton title="Ir a la tienda" onPress={goTienda} style={{ alignSelf: 'center' }} />
              </View>
            ) : (
              <View style={styles.featuredRow}>
                {featured.slice(0, 2).map((item) => (
                  <HomeEventCard
                    key={item.id}
                    item={item}
                    variant="featured"
                    formatEventDateTime={formatDateTime}
                    onPress={() => goDetail(item)}
                    showFavoriteToggle
                    favoriteActive={isFavorite(item.id)}
                    onFavoritePress={() => toggleFavorite(item)}
                  />
                ))}
              </View>
            )}

            <View style={[styles.sectionHead, { marginTop: spacing.lg }]}>
              <View style={styles.sectionTitleWrap}>
                <Text style={styles.sectionTitle}>Eventos cerca de vos</Text>
                {nearbyRadiusKm ? (
                  <Text style={styles.sectionHint}>A {nearbyRadiusKm} km de tu ubicación</Text>
                ) : !nearbyLoading && !nearbyLocationMissing ? (
                  <Text style={styles.sectionHint}>Según la ubicación de tu cuenta</Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={goTienda} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {nearbyLoading ? (
              <View style={styles.sectionLoader}>
                <ActivityIndicator color={brand.primaryLight} size="small" />
              </View>
            ) : nearbyLocationMissing ? (
              <View style={styles.fallbackCompact}>
                <Text style={styles.hint}>
                  Configurá tu ubicación en el registro o en tu perfil para ver eventos cerca tuyo.
                </Text>
                <GradientButton
                  title="Ir a mi perfil"
                  onPress={() => navigation.navigate('Profile')}
                  size="compact"
                />
              </View>
            ) : nearby.length > 0 ? (
              renderCarousel(nearby, 'nearby', 'near', nearbyCardWidth)
            ) : !marketplaceLoading ? (
              <Text style={styles.hint}>
                No hay eventos publicados dentro de {nearbyRadiusKm ?? nearbyRadius} km de tu ubicación.
              </Text>
            ) : null}

            <View style={[styles.sectionHead, { marginTop: spacing.lg }]}>
              <View>
                <Text style={styles.sectionTitle}>Recomendados para vos</Text>
                {personalized ? (
                  <Text style={styles.sectionHint}>Según tus gustos e interacciones</Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={goTienda} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {!marketplaceLoading && recommended.length > 0
              ? renderCarousel(recommended, 'recommended', 'rec', recommendedCardWidth)
              : null}

            <Text style={styles.socialTitle}>Seguinos en nuestras redes</Text>
            <SocialIcons />
          </View>
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
  safe: screenRoot,
  scroll: screenScroll,
  content: { paddingBottom: 100 },
  heroSection: {
    position: 'relative',
    width: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  body: { paddingHorizontal: spacing.lg },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 0.3,
    lineHeight: 30,
    maxWidth: '72%',
  },
  heroSub: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 6,
    marginBottom: 12,
  },
  heroBtnWrap: { alignSelf: 'flex-start', maxWidth: 240 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
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
  sectionHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
  sectionLoader: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  fallbackCompact: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fallback: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  err: { color: '#f87171', textAlign: 'center', fontSize: 14 },
  hint: { color: colors.textMuted, textAlign: 'center', fontSize: 14 },
  socialTitle: {
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: 12,
    fontWeight: '700',
    fontSize: 16,
    color: '#f8fafc',
  },
});
