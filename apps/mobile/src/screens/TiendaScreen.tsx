/**
 * Tienda – listado completo de tickets con visibilidad pública (marketplace).
 */

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
import { StoreEventListCard } from '../components/StoreEventListCard';
import {
  STORE_CATEGORY_CHIPS,
  filterStoreListings,
  type StoreCategoryFilter,
} from '../lib/storeFilters';
import { colors, spacing, tabScreenContent } from '../theme';
import { formatDateTime } from '../lib/datetime';

type Nav = TabCompositeNavigationProp<'Tienda'>;

export function TiendaScreen() {
  const navigation = useNavigation<Nav>();
  const brand = useBranding();
  const nearbyRadiusKm =
    brand.data?.marketplaceNearbyRadiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [items, setItems] = useState<MarketplacePublicItem[]>([]);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<StoreCategoryFilter>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredItems = useMemo(
    () => filterStoreListings(items, searchQuery, categoryFilter),
    [items, searchQuery, categoryFilter]
  );

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

  const goDetail = (id: string) => {
    navigation.navigate('ComprarTicketDetalle', { listingId: id, password: '' });
  };

  const showEmptyFiltered =
    !error && items.length > 0 && filteredItems.length === 0;
  const showEmptyStore = !error && items.length === 0;

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="Tienda" rightSlot={<UserMenuButton />} logoUri={brand.logoUrl} />
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => load(true)}
                tintColor={colors.primaryLight}
              />
            }
          >
            <Text style={styles.lead}>
              Tickets públicos verificados. Elegí tu evento y continuá con la compra.
            </Text>

            <View style={styles.searchWrap}>
              <FontAwesome name="search" size={15} color="#93c5fd" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar eventos..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                accessibilityLabel="Buscar eventos"
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <FontAwesome name="times-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
              style={styles.chipScroll}
            >
              {STORE_CATEGORY_CHIPS.map((chip) => {
                const active = categoryFilter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.label}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setCategoryFilter(chip.id)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.proximityRow}>
              <TouchableOpacity
                style={[styles.filterChip, !nearbyOnly && styles.filterChipActive]}
                onPress={() => setNearbyOnly(false)}
              >
                <Text style={[styles.filterChipText, !nearbyOnly && styles.filterChipTextActive]}>
                  Todos los eventos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, nearbyOnly && styles.filterChipActive]}
                onPress={() => (nearbyOnly ? setNearbyOnly(false) : void enableNearbyWithGps())}
                disabled={locationBusy}
              >
                <Text style={[styles.filterChipText, nearbyOnly && styles.filterChipTextActive]}>
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

            {showEmptyStore ? (
              <Text style={styles.empty}>No hay publicaciones en la tienda por el momento.</Text>
            ) : null}

            {showEmptyFiltered ? (
              <Text style={styles.empty}>
                No encontramos eventos con esos filtros. Probá otra búsqueda o categoría.
              </Text>
            ) : null}

            <View style={styles.list}>
              {filteredItems.map((item) => (
                <StoreEventListCard
                  key={item.id}
                  item={item}
                  formatEventDateTime={formatDateTime}
                  onPress={() => goDetail(item.id)}
                  favoriteActive={isFavorite(item.id)}
                  onFavoritePress={() => toggleFavorite(item)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: tabScreenContent,
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lead: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    backgroundColor: 'rgba(8, 18, 40, 0.72)',
  },
  searchIcon: {
    width: 18,
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
    minHeight: 22,
  },
  chipScroll: {
    marginBottom: spacing.sm,
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  proximityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(8, 18, 40, 0.45)',
  },
  filterChipActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
  },
  filterChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  error: { color: '#f87171', marginBottom: spacing.md, fontSize: 14 },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  list: {
    marginTop: spacing.xs,
  },
});
