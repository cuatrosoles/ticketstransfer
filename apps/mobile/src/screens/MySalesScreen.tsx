/**
 * Mis ventas – Lista de órdenes como vendedor
 * Ubicación: apps/mobile/src/screens/MySalesScreen.tsx
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMySales, type OrderItem } from '../lib/api';
import { colors, spacing, radius } from '../theme';

export function MySalesScreen() {
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
    <View style={styles.card}>
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
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Cargando…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListEmptyComponent={<Text style={styles.emptyText}>No tenés ventas.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  buyer: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
