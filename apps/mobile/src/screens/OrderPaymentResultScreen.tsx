/**
 * Resultado del pago Mercado Pago — pantalla tras volver del checkout.
 */

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { api, syncOrderPayment } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { colors, spacing, radius, stackScreenContent } from '../theme';

type Route = RouteProp<RootStackParamList, 'OrderPaymentResult'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderPaymentResult'>;

type OrderSummary = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  ticketListing?: { eventName: string };
};

type MpReturnStatus = 'success' | 'failure' | 'pending';

const POLL_MS = 2000;
const MAX_POLLS = 8;

function normalizeReturnStatus(raw?: string): MpReturnStatus {
  if (raw === 'failure') return 'failure';
  if (raw === 'pending') return 'pending';
  return 'success';
}

export function OrderPaymentResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId, status: statusParam } = route.params;
  const returnStatus = normalizeReturnStatus(statusParam);

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(returnStatus === 'success');
  const [syncError, setSyncError] = useState('');
  const pollCount = useRef(0);
  const cancelled = useRef(false);

  const loadOrder = useCallback(async () => {
    const o = await api<OrderSummary>(`/api/orders/${orderId}`);
    setOrder(o);
    return o;
  }, [orderId]);

  const runSync = useCallback(async (): Promise<string> => {
    const result = await syncOrderPayment(orderId);
    const o = await loadOrder();
    return o?.status || result.orderStatus;
  }, [orderId, loadOrder]);

  useEffect(() => {
    cancelled.current = false;
    pollCount.current = 0;
    setLoading(true);
    setSyncError('');

    void (async () => {
      try {
        let orderStatus = (await loadOrder())?.status || 'PENDIENTE_PAGO';

        if (returnStatus === 'success' && orderStatus === 'PENDIENTE_PAGO') {
          setSyncing(true);
          while (!cancelled.current && pollCount.current < MAX_POLLS && orderStatus === 'PENDIENTE_PAGO') {
            try {
              orderStatus = await runSync();
            } catch (e) {
              setSyncError(e instanceof Error ? e.message : 'No se pudo confirmar el pago');
            }
            if (orderStatus !== 'PENDIENTE_PAGO') break;
            pollCount.current += 1;
            await new Promise((r) => setTimeout(r, POLL_MS));
          }
        } else if (returnStatus === 'pending' && orderStatus === 'PENDIENTE_PAGO') {
          try {
            await runSync();
          } catch {
            /* ignorar */
          }
        }

        if (!cancelled.current) {
          const refreshed = await loadOrder();
          orderStatus = refreshed?.status || orderStatus;
        }
      } catch (e) {
        if (!cancelled.current) {
          setSyncError(e instanceof Error ? e.message : 'No se pudo cargar la orden');
        }
      } finally {
        if (!cancelled.current) {
          setLoading(false);
          setSyncing(false);
        }
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [orderId, returnStatus, loadOrder, runSync]);

  const orderStatus = order?.status || '';
  const paid =
    orderStatus === 'ESPERANDO_TRANSFERENCIA' ||
    ['TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO', 'COMPLETADA'].includes(
      orderStatus
    );
  const stillPending = orderStatus === 'PENDIENTE_PAGO';

  let title = 'Resultado del pago';
  let message = '';
  let tone: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';

  if (loading || syncing) {
    title = 'Procesando pago';
    message = 'Estamos confirmando tu pago con Mercado Pago. Esto puede tardar unos segundos…';
    tone = 'neutral';
  } else if (paid) {
    title = '¡Pago confirmado!';
    message =
      'Tu pago fue acreditado. El dinero queda protegido por la plataforma hasta que recibas el ticket. El vendedor fue notificado y debe transferirte el ticket en las próximas horas.';
    tone = 'success';
  } else if (returnStatus === 'failure' || (returnStatus === 'success' && stillPending)) {
    title = 'Pago no completado';
    message =
      returnStatus === 'success' && stillPending
        ? 'Mercado Pago indicó éxito pero aún no confirmamos el pago. Revisá tu cuenta de MP o reintentá desde la app.'
        : 'El pago no se completó o fue cancelado. Podés volver a intentar el pago cuando quieras.';
    tone = 'danger';
  } else if (returnStatus === 'pending' || stillPending) {
    title = 'Pago pendiente';
    message =
      'Tu pago está en proceso de acreditación. Te avisaremos por email y notificación cuando se confirme.';
    tone = 'warning';
  } else {
    message = `Estado de la orden: ${orderStatus || '—'}`;
    tone = 'neutral';
  }

  const goToOrderDetail = () => {
    navigation.replace('OrderDetail', { orderId, source: 'buyer' });
  };

  const retryPayment = () => {
    navigation.replace('OrderPago', { orderId });
  };

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Pago"
          showBack={false}
          rightSlot={<UserMenuButton />}
        />

        {loading || syncing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>{message}</Text>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.banner,
                tone === 'success' && styles.bannerSuccess,
                tone === 'warning' && styles.bannerWarning,
                tone === 'danger' && styles.bannerDanger,
              ]}
            >
              <Text style={styles.bannerTitle}>{title}</Text>
              <Text style={styles.bannerMessage}>{message}</Text>
              {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
            </View>

            {order ? (
              <TicketStubBackground style={styles.ticketWrap} contentStyle={styles.ticketInner}>
                <Text style={styles.eventName}>{order.ticketListing?.eventName ?? 'Ticket'}</Text>
                <Text style={styles.total}>
                  {order.currency} {Number(order.totalAmount).toLocaleString('es-AR')}
                </Text>
                <Text style={styles.orderId}>Orden: {order.id}</Text>
              </TicketStubBackground>
            ) : null}

            {paid ? (
              <>
                <TouchableOpacity style={styles.primaryBtn} onPress={goToOrderDetail}>
                  <Text style={styles.primaryBtnText}>Ver mi compra y seguimiento</Text>
                </TouchableOpacity>
                <Text style={styles.hint}>
                  Ahí podrás ver el estado de la transferencia del ticket, subir capturas y contactar soporte.
                </Text>
              </>
            ) : null}

            {(returnStatus === 'failure' || (returnStatus === 'success' && stillPending)) && stillPending ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={retryPayment}>
                <Text style={styles.primaryBtnText}>Reintentar pago</Text>
              </TouchableOpacity>
            ) : null}

            {returnStatus === 'pending' && stillPending ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={goToOrderDetail}>
                <Text style={styles.secondaryBtnText}>Ver estado de mi compra</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
              <Text style={styles.secondaryBtnText}>Ir al inicio</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  centered: { alignItems: 'center', paddingVertical: 48, gap: 16 },
  processingText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  banner: {
    padding: spacing.lg,
    borderRadius: radius,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.35)',
  },
  bannerSuccess: {
    borderColor: 'rgba(34, 197, 94, 0.5)',
    backgroundColor: 'rgba(22, 101, 52, 0.35)',
  },
  bannerWarning: {
    borderColor: 'rgba(234, 179, 8, 0.5)',
    backgroundColor: 'rgba(120, 53, 15, 0.35)',
  },
  bannerDanger: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
  },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: spacing.sm },
  bannerMessage: { fontSize: 15, color: colors.text, lineHeight: 22 },
  syncError: { color: '#fca5a5', fontSize: 13, marginTop: spacing.sm },
  ticketWrap: { marginBottom: spacing.lg },
  ticketInner: { padding: spacing.lg },
  eventName: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  total: { fontSize: 18, fontWeight: '700', color: colors.primaryLight, marginBottom: 4 },
  orderId: { fontSize: 12, color: colors.textMuted },
  hint: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 19 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderRadius: radius,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
  },
  secondaryBtnText: { color: colors.text, fontWeight: '600', fontSize: 15 },
});
