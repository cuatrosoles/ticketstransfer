/**
 * Pago de orden – Confirmar pago (escrow) tras Comprar Ticket.
 * Ubicación: apps/mobile/src/screens/OrderPagoScreen.tsx
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

type Order = {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  ticketListing?: { eventName: string };
};

type Route = RouteProp<RootStackParamList, 'OrderPago'>;

export function OrderPagoScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!params?.orderId) {
      setLoading(false);
      return;
    }
    api<Order>(`/api/orders/${params.orderId}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params?.orderId]);

  const confirmPayment = async () => {
    if (!params?.orderId) return;
    setSubmitting(true);
    try {
      await api(`/api/orders/${params.orderId}/confirm-payment`, { method: 'POST' });
      navigation.navigate('MyPurchases');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al confirmar pago');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AuthBackground>
    );
  }
  if (!order) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <Text style={styles.text}>No se encontró la orden.</Text>
        </View>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Confirmar pago</Text>
        <View style={[styles.card, glassCard]}>
        <Text style={styles.eventName}>{order.ticketListing?.eventName ?? 'Orden'}</Text>
        <Text style={styles.total}>{order.currency} {order.totalAmount.toLocaleString('es-AR')}</Text>
        <Text style={styles.escrow}>
          Tu dinero será retenido hasta que el vendedor transfiera el ticket.
        </Text>
        {order.status === 'PENDIENTE_PAGO' && (
          <TouchableOpacity
            style={[styles.btn, submitting && styles.btnDisabled]}
            onPress={confirmPayment}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.btnText}>Confirmar pago</Text>}
          </TouchableOpacity>
        )}
        {order.status !== 'PENDIENTE_PAGO' && (
          <Text style={styles.muted}>Esta orden ya fue procesada.</Text>
        )}
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 120, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: colors.textMuted },
  title: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: spacing.lg },
  card: {
    padding: spacing.lg,
  },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  total: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  escrow: { fontSize: 14, color: colors.primaryLight, marginBottom: spacing.lg },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center' },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  muted: { fontSize: 14, color: colors.textMuted },
});
