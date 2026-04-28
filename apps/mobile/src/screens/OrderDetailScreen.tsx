import * as React from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  api,
  confirmOrderReceived,
  ensureImageUrl,
  markTransferDone,
  openOrderDispute,
  uploadOrderEvidence,
  type OrderItem,
} from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, radius, spacing } from '../theme';

type Route = RouteProp<RootStackParamList, 'OrderDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

const statusMeta: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }> = {
  PENDIENTE_PAGO: { label: 'Pendiente de pago', tone: 'warning' },
  PAGADO: { label: 'Pagado', tone: 'success' },
  ESPERANDO_TRANSFERENCIA: { label: 'En espera transferencia', tone: 'warning' },
  TRANSFERIDO_VENDEDOR: { label: 'Transferido', tone: 'success' },
  COMPLETADA: { label: 'Completada', tone: 'success' },
  CANCELADA: { label: 'Cancelado', tone: 'danger' },
  EN_DISPUTA: { label: 'En disputa', tone: 'danger' },
  EVIDENCIA_SUBIDA: { label: 'Ticket recibido informado', tone: 'warning' },
};

export function OrderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId, source } = route.params;
  const isBuyerView = source === 'buyer';
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<OrderItem>(`/api/orders/${orderId}`);
      setOrder(res);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el detalle.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const uploadEvidence = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, async (res) => {
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      setBusy(true);
      try {
        await uploadOrderEvidence(orderId, { uri: asset.uri, name: asset.fileName, type: asset.type });
        await load();
        Alert.alert('Listo', 'La captura se adjuntó correctamente.');
      } catch (e) {
        Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo subir la captura.');
      } finally {
        setBusy(false);
      }
    });
  };

  const goToPayment = () => {
    navigation.navigate('OrderPago', { orderId });
  };

  const onTransferDone = async () => {
    setBusy(true);
    try {
      await markTransferDone(orderId);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar.');
    } finally {
      setBusy(false);
    }
  };

  const onConfirmReceived = async () => {
    setBusy(true);
    try {
      await confirmOrderReceived(orderId);
      await load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo confirmar.');
    } finally {
      setBusy(false);
    }
  };

  const onOpenDispute = async () => {
    setBusy(true);
    try {
      await openOrderDispute(orderId, 'Solicitud de reintegro / inconveniente reportado por usuario');
      await load();
      Alert.alert('Solicitud enviada', 'Abrimos la disputa para revisión de soporte.');
    } catch (e) {
      Alert.alert('Aviso', e instanceof Error ? e.message : 'No se pudo abrir la disputa.');
    } finally {
      setBusy(false);
    }
  };

  const status = order?.status || '';
  const meta = statusMeta[status] || { label: status, tone: 'neutral' as const };
  const canMarkTransfer = !isBuyerView && status === 'ESPERANDO_TRANSFERENCIA';
  const canConfirmReceived = isBuyerView && ['TRANSFERIDO_VENDEDOR', 'EVIDENCIA_SUBIDA'].includes(status);
  const canGoToPay = isBuyerView && status === 'PENDIENTE_PAGO';
  const canDispute = isBuyerView && ['PENDIENTE_PAGO', 'ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR'].includes(status);
  const showReason = status === 'CANCELADA' || status === 'EN_DISPUTA';
  const otherEvidence = isBuyerView ? order?.sellerEvidenceUrl : order?.buyerEvidenceUrl;
  const badgeToneStyle =
    meta.tone === 'warning'
      ? styles.toneWarning
      : meta.tone === 'success'
        ? styles.toneSuccess
        : meta.tone === 'danger'
          ? styles.toneDanger
          : styles.toneNeutral;

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title={isBuyerView ? 'Detalle de compra' : 'Detalle de venta'}
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : !order ? (
          <Text style={styles.error}>{error || 'No se encontró la orden.'}</Text>
        ) : (
          <>
            <TicketStubBackground backgroundOrientation="portrait" style={styles.ticketWrap} contentStyle={styles.ticketInner}>
              <Text style={styles.lineTitle}>{order.ticketListing?.eventName || 'Ticket'}</Text>
              <Text style={styles.line}>
                {order.currency} {Number(order.totalAmount).toLocaleString('es-AR')}
              </Text>
              <Text style={[styles.badge, badgeToneStyle]}>
                {meta.label}
              </Text>
              {order.ticketListing?.eventDate ? (
                <Text style={styles.line}>Fecha: {new Date(order.ticketListing.eventDate).toLocaleDateString('es-AR')}</Text>
              ) : null}
              {order.ticketListing?.eventPlace ? <Text style={styles.line}>Lugar: {order.ticketListing.eventPlace}</Text> : null}
              {isBuyerView ? (
                <Text style={styles.line}>Vendedor: {order.seller?.email || '—'}</Text>
              ) : (
                <Text style={styles.line}>Comprador: {order.buyer?.email || '—'}</Text>
              )}
              {showReason ? (
                <Text style={styles.reason}>
                  Motivo: {order.cancelReason || order.cancelNote || 'Se detectó inconveniente y quedó bajo revisión.'}
                </Text>
              ) : null}
            </TicketStubBackground>

            <TouchableOpacity style={styles.secondaryBtn} onPress={() => Alert.alert('Solicitud enviada', 'Tu solicitud de factura de transacción fue registrada.')}>
              <Text style={styles.secondaryBtnText}>Solicitar factura transacción</Text>
            </TouchableOpacity>

            {canGoToPay ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={goToPayment} disabled={busy}>
                <Text style={styles.primaryBtnText}>Ir a pago</Text>
              </TouchableOpacity>
            ) : null}

            {canMarkTransfer ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn} onPress={uploadEvidence} disabled={busy}>
                  <Text style={styles.secondaryBtnText}>Adjuntar captura transferencia ticket</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={onTransferDone} disabled={busy}>
                  <Text style={styles.primaryBtnText}>Marcar como transferido</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {canConfirmReceived ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn} onPress={uploadEvidence} disabled={busy}>
                  <Text style={styles.secondaryBtnText}>Subir captura ticket recibido</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={onConfirmReceived} disabled={busy}>
                  <Text style={styles.primaryBtnText}>Confirmar ticket recibido</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {otherEvidence ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setImagePreview(otherEvidence)}>
                <Text style={styles.secondaryBtnText}>
                  {isBuyerView ? 'Ver captura transferencia ticket' : 'Ver captura ticket recibido'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {isBuyerView ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ChatSoporte')}>
                <Text style={styles.secondaryBtnText}>Ayuda con mis tickets</Text>
              </TouchableOpacity>
            ) : null}

            {canDispute ? (
              <TouchableOpacity style={styles.dangerBtn} onPress={onOpenDispute} disabled={busy}>
                <Text style={styles.primaryBtnText}>Cancelar compra (solicitar reintegro)</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>
      <Modal visible={!!imagePreview} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setImagePreview(null)}>
          <View style={styles.modalInner}>
            {imagePreview ? <Image source={{ uri: ensureImageUrl(imagePreview)! }} style={styles.bigImage} resizeMode="contain" /> : null}
          </View>
        </Pressable>
      </Modal>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ticketWrap: { marginBottom: spacing.md },
  ticketInner: { padding: spacing.lg, minHeight: 360 },
  lineTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  line: { color: colors.textMuted, fontSize: 14, marginBottom: 6 },
  badge: { fontSize: 13, fontWeight: '700', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 8 },
  toneWarning: { backgroundColor: 'rgba(234,179,8,0.2)', color: '#ca8a04' },
  toneSuccess: { backgroundColor: 'rgba(34,197,94,0.2)', color: '#16a34a' },
  toneDanger: { backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  toneNeutral: { backgroundColor: 'rgba(148,163,184,0.2)', color: colors.textMuted },
  reason: { color: '#fca5a5', marginTop: 6, fontSize: 13 },
  primaryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtn: {
    marginTop: spacing.sm,
    borderRadius: radius,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.45)',
    backgroundColor: 'rgba(30,58,138,0.3)',
    alignItems: 'center',
  },
  dangerBtn: {
    marginTop: spacing.sm,
    borderRadius: radius,
    paddingVertical: 12,
    backgroundColor: 'rgba(220,38,38,0.8)',
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  secondaryBtnText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  error: { color: '#f87171' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalInner: { width: '100%', alignItems: 'center' },
  bigImage: { width: '100%', height: 420, borderRadius: 12 },
});
