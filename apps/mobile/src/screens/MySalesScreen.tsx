/**
 * Mis ventas – Lista de órdenes como vendedor
 * Ubicación: apps/mobile/src/screens/MySalesScreen.tsx
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMySales, type OrderItem } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, glassCard } from '../theme';

export function MySalesScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    getMySales()
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
      ESPERANDO_TRANSFERENCIA: 'Debes transferir el ticket',
      TRANSFERIDO_VENDEDOR: 'Transferido',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      EN_DISPUTA: 'En disputa',
    };
    return map[s] || s;
  };

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={[styles.card, glassCard]}>
      <Text style={styles.eventName}>{item.ticketListing.eventName}</Text>
      <Text style={styles.meta}>
        {item.totalAmount} {item.currency} · {statusLabel(item.status)}
      </Text>
      {item.buyer?.email ? <Text style={styles.buyer}>Comprador: {item.buyer.email}</Text> : null}
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

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
          title="Mis ventas"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
      }
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListEmptyComponent={<Text style={styles.emptyText}>No tenés ventas.</Text>}
    />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  buyer: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
