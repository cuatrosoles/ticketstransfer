/**
 * Mis compras – Lista de órdenes como comprador
 * Ubicación: apps/mobile/src/screens/MyPurchasesScreen.tsx
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMyPurchases, type OrderItem } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { OrderListCard } from '../components/OrderListCard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, stackScreenContent } from '../theme';
import { formatDateTime } from '../lib/datetime';

export function MyPurchasesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    getMyPurchases()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDIENTE_PAGO: 'Pendiente de pago',
      PAGADO: 'Pago realizado',
      ESPERANDO_TRANSFERENCIA: 'Esperando transferencia',
      TRANSFERIDO_VENDEDOR: 'Transferido',
      EVIDENCIA_SUBIDA: 'Verificando',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      EN_DISPUTA: 'En disputa',
    };
    return map[s] || s;
  };

  const renderItem = ({ item }: { item: OrderItem }) => {
    const listing = item.ticketListing;
    return (
      <OrderListCard
        eventName={listing.eventName}
        eventDate={listing.eventDate}
        eventPlace={listing.eventPlace}
        eventImageUrl={listing.eventImageUrl}
        category={listing.category}
        subtitle={`${item.totalAmount} ${item.currency} · ${statusLabel(item.status)}`}
        buttonTitle="Ver detalles"
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, source: 'buyer' })}
        formatEventDateTime={formatDateTime}
      />
    );
  };

  if (loading && orders.length === 0) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Cargando…</Text>
        </View>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <ScreenHeader
          title="Mis compras"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
      }
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListEmptyComponent={<Text style={styles.emptyText}>No tenés compras.</Text>}
    />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  list: stackScreenContent,
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
