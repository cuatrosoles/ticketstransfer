/**
 * Tienda – listado completo de tickets con visibilidad pública (marketplace).
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  getMarketplaceStoreListings,
  type MarketplacePublicItem,
} from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { MarketplaceTicketCard } from '../components/MarketplaceTicketCard';
import { colors, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Tienda'>;

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

export function TiendaScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const [items, setItems] = useState<MarketplacePublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await getMarketplaceStoreListings();
      setItems(res.items ?? []);
    } catch {
      setError('No se pudieron cargar las publicaciones.');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const gap = spacing.sm;
  const horizontalPad = spacing.lg;
  const cardWidth = (width - horizontalPad * 2 - gap) / 2;
  const storeCardMinHeight = Math.round(Math.max(260, cardWidth * 1.38));

  const goDetail = (id: string) => {
    navigation.navigate('ComprarTicketDetalle', { listingId: id, password: '' });
  };

  return (
    <AuthBackground>
      <View style={styles.root}>
        <ScreenHeader
          title="Tienda"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
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
            Tickets a la venta con visibilidad pública. Tocá una tarjeta para ver el detalle y comprar con Mercado
            Pago.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!error && items.length === 0 ? (
            <Text style={styles.empty}>No hay publicaciones en la tienda por el momento.</Text>
          ) : null}
          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.id} style={{ width: cardWidth, marginBottom: spacing.md }}>
                <MarketplaceTicketCard
                  item={item}
                  compact={false}
                  minFrameHeight={storeCardMinHeight}
                  formatEventDateTime={formatEventDateTime}
                  onPress={() => goDetail(item.id)}
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
    paddingBottom: spacing.xl * 2,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lead: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },
  error: { color: '#f87171', marginBottom: spacing.md, fontSize: 14 },
  empty: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.lg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 0,
  },
});
