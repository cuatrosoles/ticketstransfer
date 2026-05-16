/**
 * Pago de orden – Mercado Pago Checkout Pro abre en el **navegador del sistema** (Chrome / Safari).
 * El checkout de MP en WebView embebido suele fallar (pantalla en blanco, esquemas mercadopago://, bloqueos).
 * Los `back_urls` de la preferencia ya apuntan a `ticketTransfer://orden/:id/pago`; al volver refrescamos la orden.
 */

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  AppState,
  InteractionManager,
  type AppStateStatus,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
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

export function OrderPagoScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(params?.checkoutUrl ?? null);
  const [openingMp, setOpeningMp] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

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
  }, [params?.orderId]);

  /** Al volver del navegador (pago MP), actualizar estado de la orden. */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (next === 'active' && /inactive|background/.test(prev) && order?.status === 'PENDIENTE_PAGO' && params?.orderId) {
        void loadOrder();
      }
    });
    return () => sub.remove();
  }, [order?.status, params?.orderId, loadOrder]);

  const openCheckoutInBrowser = async () => {
    if (!checkoutUrl) return;
    const url = checkoutUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Pago', 'La URL de checkout no es válida.');
      return;
    }
    setOpeningMp(true);
    try {
      /** Deja terminar animaciones / layout antes de lanzar Chrome (menos picos de RAM en MIUI). */
      await InteractionManager.runAfterInteractions();
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Mercado Pago', e instanceof Error ? e.message : 'No se pudo abrir el navegador.');
    } finally {
      setOpeningMp(false);
    }
  };

  const copyCheckoutLink = () => {
    if (!checkoutUrl) return;
    Clipboard.setString(checkoutUrl.trim());
    Alert.alert(
      'Enlace copiado',
      'Si el teléfono se reinicia al abrir el pago, pegá el enlace en otro dispositivo o en Chrome desde el portapapeles.',
    );
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
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => void openCheckoutInBrowser()}
                  disabled={openingMp}
                >
                  <Text style={styles.btnText}>
                    {openingMp ? 'Abriendo…' : 'Pagar con Mercado Pago'}
                  </Text>
                </TouchableOpacity>
              )}
              {checkoutUrl && (
                <Text style={styles.browserHint}>
                  Se abre el checkout de Mercado Pago en tu navegador (recomendado). Cuando termines, volvé a esta app:
                  el estado del pago se actualiza solo al regresar.
                </Text>
              )}
              {checkoutUrl && (
                <TouchableOpacity style={styles.copyLinkBtn} onPress={copyCheckoutLink}>
                  <Text style={styles.copyLinkBtnText}>Copiar enlace de pago</Text>
                </TouchableOpacity>
              )}
              {checkoutUrl && (
                <Text style={styles.miuiHint}>
                  Si el teléfono se apaga o reinicia al pagar: suele ser falta de RAM o el ahorro de batería de Xiaomi (MIUI).
                  Probá cerrar otras apps, desactivar “ahorro extremo” para esta app, o pagar desde otro equipo con el enlace
                  copiado.
                </Text>
              )}
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={addCard}>
                <Text style={styles.btnText}>+ Agregar tarjeta</Text>
              </TouchableOpacity>
              {!checkoutUrl && <Text style={styles.muted}>Generando link de pago…</Text>}
              <TouchableOpacity style={styles.refreshBtn} onPress={() => void loadOrder()}>
                <Text style={styles.refreshBtnText}>Actualizar estado del pago</Text>
              </TouchableOpacity>
              <Text style={styles.hintError}>
                Si falla el pago con tarjeta adherida, usá Mercado Pago en el navegador y elegí allí el medio guardado.
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
  browserHint: {
    fontSize: 13,
    color: colors.primaryLight,
    marginTop: spacing.sm,
    lineHeight: 19,
  },
  copyLinkBtn: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  copyLinkBtnText: { color: colors.primaryLight, fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  miuiHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  refreshBtn: {
    marginTop: spacing.md,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshBtnText: { color: colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.sm, lineHeight: 18 },
  hintError: { fontSize: 12, color: '#fca5a5', marginTop: spacing.sm, lineHeight: 18 },
  muted: { fontSize: 14, color: colors.textMuted },
  success: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: spacing.sm },
});
