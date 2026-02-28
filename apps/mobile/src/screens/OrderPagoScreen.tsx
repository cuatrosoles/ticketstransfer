/**
 * Pago de orden – Mercado Pago Checkout Pro (escrow) tras Comprar Ticket.
 * Ubicación: apps/mobile/src/screens/OrderPagoScreen.tsx
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, glassCard } from '../theme';

type Order = {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  ticketListing?: { eventName: string };
  checkoutUrl?: string;
};

type Route = RouteProp<RootStackParamList, 'OrderPago'>;

export function OrderPagoScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(params?.checkoutUrl ?? null);

  useEffect(() => {
    if (!params?.orderId) {
      setLoading(false);
      return;
    }
    api<Order>(`/api/orders/${params.orderId}`)
      .then((o) => {
        setOrder(o);
        setCheckoutUrl((prev) => prev || o.checkoutUrl || null);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params?.orderId]);

  useEffect(() => {
    if (!params?.orderId || !order || order.status !== 'PENDIENTE_PAGO' || checkoutUrl) return;
    api<{ checkoutUrl: string }>(`/api/orders/${params.orderId}/checkout-url`)
      .then((r) => setCheckoutUrl(r.checkoutUrl))
      .catch(() => {});
  }, [params?.orderId, order?.status, checkoutUrl]);

  const payWithMercadoPago = () => {
    if (checkoutUrl) Linking.openURL(checkoutUrl);
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <ScreenHeader
          title="Pago"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <Text style={styles.title}>Confirmar pago</Text>
        <View style={[styles.card, glassCard]}>
        <Text style={styles.eventName}>{order.ticketListing?.eventName ?? 'Orden'}</Text>
        <Text style={styles.total}>{order.currency} {order.totalAmount.toLocaleString('es-AR')}</Text>
        <Text style={styles.escrow}>
          Tu dinero será retenido hasta que el vendedor transfiera el ticket.
        </Text>
        {order.status === 'PENDIENTE_PAGO' && checkoutUrl && (
          <>
            <TouchableOpacity style={styles.btn} onPress={payWithMercadoPago}>
              <Text style={styles.btnText}>Pagar con Mercado Pago</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>
              Podés usar tarjeta, débito o cuenta de Mercado Pago. Agregá tarjetas en Perfil → Tarjetas adheridas para pagar más rápido.
            </Text>
          </>
        )}
        {order.status === 'PENDIENTE_PAGO' && !checkoutUrl && (
          <Text style={styles.muted}>Generando link de pago…</Text>
        )}
        {['ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO'].includes(order.status) && (
          <Text style={styles.success}>Pago recibido. Esperando la transferencia del vendedor.</Text>
        )}
        {order.status === 'COMPLETADA' && (
          <Text style={styles.success}>¡Orden completada!</Text>
        )}
        {!['PENDIENTE_PAGO', 'ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO', 'COMPLETADA'].includes(order.status) && (
          <Text style={styles.muted}>Estado: {order.status}</Text>
        )}
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
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
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  muted: { fontSize: 14, color: colors.textMuted },
  success: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
});
