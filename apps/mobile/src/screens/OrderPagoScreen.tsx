/**
 * Pago de orden – Mercado Pago Checkout Pro (WebView in-app) + tarjetas adheridas.
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { api, getUserCards, removeUserCard, type CardItem } from '../lib/api';
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
type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderPago'>;

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export function OrderPagoScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(params?.checkoutUrl ?? null);
  const [mpOpen, setMpOpen] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!params?.orderId) return;
    try {
      const o = await api<Order>(`/api/orders/${params.orderId}`);
      setOrder(o);
      setCheckoutUrl((prev) => prev || o.checkoutUrl || null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [params?.orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!params?.orderId || !order || order.status !== 'PENDIENTE_PAGO' || checkoutUrl) return;
    api<{ checkoutUrl: string }>(`/api/orders/${params.orderId}/checkout-url`)
      .then((r) => setCheckoutUrl(r.checkoutUrl))
      .catch(() => {});
  }, [params?.orderId, order?.status, checkoutUrl]);

  useEffect(() => {
    let cancelled = false;
    setCardsLoading(true);
    getUserCards()
      .then((r) => {
        if (!cancelled) setCards(r.cards || []);
      })
      .catch(() => {
        if (!cancelled) setCards([]);
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params?.orderId, mpOpen]);

  const openCheckout = () => {
    if (checkoutUrl) setMpOpen(true);
  };

  const onCheckoutWebRequest = (req: { url: string }) => {
    const u = req.url || '';
    if (u.startsWith('ticketTransfer://')) {
      setMpOpen(false);
      void loadOrder();
      return false;
    }
    return true;
  };

  const handleRemoveCard = (card: CardItem) => {
    Alert.alert('Eliminar tarjeta', '¿Quitar esta tarjeta de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(card.id);
          try {
            await removeUserCard(card.id);
            setCards((c) => c.filter((x) => x.id !== card.id));
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const addCard = () => {
    if (params?.orderId) {
      navigation.navigate('CardFormWebView', { returnTo: 'OrderPago', orderId: params.orderId });
    } else {
      navigation.navigate('CardFormWebView', {});
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
          <Text style={styles.total}>
            {order.currency} {order.totalAmount.toLocaleString('es-AR')}
          </Text>
          <Text style={styles.escrow}>
            Tu dinero será retenido y protegido por la plataforma hasta que el vendedor transfiera el ticket y ambos
            usuarios adjunten/validen capturas de recibido.
          </Text>
          <Text style={styles.hint}>
            Podés usar tarjeta, débito o cuenta de Mercado Pago. Agregá tarjetas acá o en Perfil → Tarjetas
            adheridas. Al pagar con Mercado Pago podés elegir medios guardados en tu cuenta MP.
          </Text>

          {order.status === 'PENDIENTE_PAGO' && (
            <>
              <Text style={styles.sectionLabel}>Tarjetas adheridas</Text>
              {cardsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />
              ) : cards.length === 0 ? (
                <Text style={styles.muted}>No tenés tarjetas guardadas todavía.</Text>
              ) : (
                cards.map((c) => (
                  <View key={c.id} style={styles.cardRow}>
                    <Text style={styles.cardLabel}>
                      {(c.payment_method?.name || 'Tarjeta')} •••• {c.last_four_digits}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveCard(c)}
                      disabled={deletingId === c.id}
                      style={styles.deleteCardBtn}
                    >
                      <Text style={styles.deleteCardBtnText}>
                        {deletingId === c.id ? '…' : 'Eliminar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {checkoutUrl && (
                <TouchableOpacity style={styles.btn} onPress={openCheckout}>
                  <Text style={styles.btnText}>Pagar con Mercado Pago</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={addCard}>
                <Text style={styles.btnText}>+ Agregar tarjeta</Text>
              </TouchableOpacity>
              {!checkoutUrl && <Text style={styles.muted}>Generando link de pago…</Text>}
              <Text style={styles.hintError}>
                Si falla el pago con tarjeta adherida, usá el botón de Mercado Pago y elegí allí el medio guardado.
              </Text>
            </>
          )}

          {['ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO'].includes(order.status) && (
            <Text style={styles.success}>Pago recibido. Esperando la transferencia del vendedor.</Text>
          )}
          {order.status === 'COMPLETADA' && <Text style={styles.success}>¡Orden completada!</Text>}
          {!['PENDIENTE_PAGO', 'ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO', 'COMPLETADA'].includes(order.status) && (
            <Text style={styles.muted}>Estado: {order.status}</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={mpOpen} animationType="slide" onRequestClose={() => setMpOpen(false)}>
        <SafeAreaView style={styles.mpModal} edges={['top']}>
          <View style={styles.mpBar}>
            <TouchableOpacity onPress={() => setMpOpen(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.mpClose}>Cerrar</Text>
            </TouchableOpacity>
            <Text style={styles.mpTitle}>Mercado Pago</Text>
            <View style={{ width: 56 }} />
          </View>
          {checkoutUrl ? (
            <WebView
              style={{ flex: 1 }}
              source={{ uri: checkoutUrl }}
              userAgent={USER_AGENT}
              onShouldStartLoadWithRequest={onCheckoutWebRequest}
              setSupportMultipleWindows={false}
            />
          ) : (
            <View style={styles.centered}>
              <Text style={styles.muted}>Sin URL de checkout</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  escrow: { fontSize: 14, color: colors.primaryLight, marginBottom: spacing.md },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginTop: spacing.md, marginBottom: spacing.sm },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.2)',
  },
  cardLabel: { color: colors.text, flex: 1, fontSize: 15 },
  deleteCardBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  deleteCardBtnText: { color: '#f87171', fontWeight: '600', fontSize: 14 },
  btn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center', marginTop: spacing.md },
  btnSecondary: { backgroundColor: 'rgba(59, 130, 246, 0.35)', borderWidth: 1, borderColor: 'rgba(147, 197, 253, 0.5)' },
  btnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.sm, lineHeight: 18 },
  hintError: { fontSize: 12, color: '#fca5a5', marginTop: spacing.sm, lineHeight: 18 },
  muted: { fontSize: 14, color: colors.textMuted },
  success: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
  mpModal: { flex: 1, backgroundColor: '#0f172a' },
  mpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.25)',
  },
  mpClose: { color: colors.primaryLight, fontWeight: '600', fontSize: 16, width: 56 },
  mpTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
});
