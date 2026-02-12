/**
 * Mis compras – Lista de órdenes como comprador
 * Ubicación: apps/mobile/src/screens/MyPurchasesScreen.tsx
/**
 * Mis compras – Lista de órdenes como comprador
 * Ubicación: apps/mobile/src/screens/MyPurchasesScreen.tsx
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyPurchases, type OrderItem } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

export function MyPurchasesScreen() {
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

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={[styles.card, glassCard]}>
      <Text style={styles.eventName}>{item.ticketListing.eventName}</Text>
      <Text style={styles.meta}>
        {item.totalAmount} {item.currency} · {statusLabel(item.status)}
      </Text>
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
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      ListEmptyComponent={<Text style={styles.emptyText}>No tenés compras.</Text>}
    />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
