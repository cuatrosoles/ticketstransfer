/**
 * Tienda – listado completo de tickets con visibilidad pública (marketplace).
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { TabCompositeNavigationProp } from '../navigation/types';
import {
  getMarketplaceStoreListings,
  getMarketplaceNearby,
  updateUserLocation,
  type MarketplacePublicItem,
} from '../lib/api';
import { LocationCaptureButton } from '../components/LocationCaptureButton';
import { getCurrentDeviceLocation, showLocationError } from '../lib/geolocation';
import { DEFAULT_NEARBY_RADIUS_KM } from '@tickets-transfer/shared';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { useBranding } from '../context/BrandingContext';
import { useFavorites } from '../context/FavoritesContext';
import { MarketplaceTicketCard } from '../components/MarketplaceTicketCard';
import { colors, spacing } from '../theme';
import { formatDateTime } from '../lib/datetime';

type Nav = TabCompositeNavigationProp<'Tienda'>;

export function TiendaScreen() {
  const navigation = useNavigation<Nav>();
  const brand = useBranding();
  const nearbyRadiusKm =
    brand.data?.marketplaceNearbyRadiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<MarketplacePublicItem[]>([]);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      if (nearbyOnly) {
        const res = await getMarketplaceNearby(nearbyRadiusKm);
        setItems(res.items ?? []);
      } else {
        const res = await getMarketplaceStoreListings();
        setItems(res.items ?? []);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (nearbyOnly && msg.includes('ubicación')) {
        setError('Configurá tu ubicación para ver eventos cercanos (registro o botón abajo).');
      } else {
        setError('No se pudieron cargar las publicaciones.');
      }
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [nearbyOnly, nearbyRadiusKm]);

  const enableNearbyWithGps = async () => {
    setLocationBusy(true);
    try {
      const loc = await getCurrentDeviceLocation();
      await updateUserLocation({ ...loc, locationSource: 'gps' });
      setNearbyOnly(true);
    } catch (err) {
      showLocationError(err instanceof Error ? err.message : 'No se pudo obtener la ubicación');
    } finally {
      setLocationBusy(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const gap = spacing.sm;
  const horizontalPad = spacing.lg;
  const cardWidth = (width - horizontalPad * 2 - gap) / 2;
  /** Altura del ticket en Tienda (cubre portada + título 2 líneas + metadatos + zona código de barras). */
  const storeCardHeight = Math.round(Math.max(320, cardWidth * 1.55));

  const goDetail = (id: string) => {
    navigation.navigate('ComprarTicketDetalle', { listingId: id, password: '' });
  };

  return (
    <AuthBackground>
      <View style={styles.root}>
        <ScreenHeader title="Tienda" rightSlot={<UserMenuButton />} logoUri={brand.logoUrl} />
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => load(true)}
                tintColor={colors.primaryLight}
              />
            }
          >
          <Text style={styles.lead}>
            Tickets públicos verificados. Tocá un ticket para ver el detalle y continuar con la compra.
          </Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, !nearbyOnly && styles.filterChipActive]}
              onPress={() => setNearbyOnly(false)}
            >
              <Text style={styles.filterChipText}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, nearbyOnly && styles.filterChipActive]}
              onPress={() => (nearbyOnly ? setNearbyOnly(false) : void enableNearbyWithGps())}
              disabled={locationBusy}
            >
              <Text style={styles.filterChipText}>
                {locationBusy ? 'Ubicando…' : `Cercanos (${nearbyRadiusKm} km)`}
              </Text>
            </TouchableOpacity>
          </View>
          {nearbyOnly ? (
            <LocationCaptureButton
              label="Actualizar mi ubicación"
              latitude={null}
              longitude={null}
              onCapture={async ({ latitude, longitude }) => {
                await updateUserLocation({ latitude, longitude, locationSource: 'gps' });
                load(true);
              }}
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!error && items.length === 0 ? (
            <Text style={styles.empty}>No hay publicaciones en la tienda por el momento.</Text>
          ) : null}
          <View style={styles.grid}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[styles.gridCell, { width: cardWidth, height: storeCardHeight }]}
              >
                <MarketplaceTicketCard
                  item={item}
                  compact={false}
                  frameHeight={storeCardHeight}
                  fixedTitleLines={2}
                  formatEventDateTime={formatDateTime}
                  onPress={() => goDetail(item.id)}
                  favoriteActive={isFavorite(item.id)}
                  onFavoritePress={() => toggleFavorite(item)}
                />
              </View>
            ))}
          </View>
          </ScrollView>
        )}
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lead: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  filterChipActive: { borderColor: colors.primaryLight, backgroundColor: 'rgba(59,130,246,0.2)' },
  filterChipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  error: { color: '#f87171', marginBottom: spacing.md, fontSize: 14 },
  empty: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.lg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: spacing.sm,
    rowGap: spacing.md,
  },
  gridCell: {
    overflow: 'hidden',
  },
});
