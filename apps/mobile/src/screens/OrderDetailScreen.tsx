import * as React from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrarySafe } from '../lib/imagePickerSafe';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  api,
  confirmOrderReceived,
  ensureImageUrl,
  markTransferDone,
  openOrderDispute,
  requestTransactionInvoice,
  uploadOrderEvidence,
  type OrderItem,
} from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, radius, spacing } from '../theme';
import { formatDate } from '../lib/datetime';

type Route = RouteProp<RootStackParamList, 'OrderDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

const statusMeta: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }> = {
  PENDIENTE_PAGO: { label: 'Pendiente de pago', tone: 'warning' },
  PAGADO: { label: 'Pagado', tone: 'success' },
  ESPERANDO_TRANSFERENCIA: { label: 'En espera transferencia', tone: 'warning' },
  TRANSFERIDO_VENDEDOR: { label: 'Transferido', tone: 'success' },
  ESPERANDO_CONFIRMACION_COMPRADOR: { label: 'Esperando confirmación comprador', tone: 'warning' },
  VERIFICANDO: { label: 'Verificando', tone: 'warning' },
  COMPLETADA: { label: 'Completada', tone: 'success' },
  CANCELADA: { label: 'Cancelado', tone: 'danger' },
  EN_DISPUTA: { label: 'En disputa', tone: 'danger' },
  EVIDENCIA_SUBIDA: { label: 'Ticket recibido informado', tone: 'warning' },
};

/** Fase para los 3 indicadores: pendiente / transferido / rechazado. */
function getTransferPhase(status: string): 'pendiente' | 'transferido' | 'rechazado' {
  if (status === 'CANCELADA' || status === 'EN_DISPUTA') return 'rechazado';
  if (
    status === 'TRANSFERIDO_VENDEDOR' ||
    status === 'ESPERANDO_CONFIRMACION_COMPRADOR' ||
    status === 'EVIDENCIA_SUBIDA' ||
    status === 'VERIFICANDO' ||
    status === 'COMPLETADA'
  ) {
    return 'transferido';
  }
  return 'pendiente';
}

const TRANSFER_CAPTURE_DISCLAIMER =
  'Por favor corroborá que también los tickets te hayan llegado por el medio que solicitaste al usuario vendedor. Corroborá en tu app de boletos o email. Cuando el vendedor adjunta la captura de transferencia del ticket a tu app de destino, revisala acá: el comprador debe verla y dar el OK para liberar fondos una vez constatado que todo es correcto.';

const DELIVERY_METHOD_LABEL: Record<string, string> = {
  usuario: 'Nombre de usuario',
  id: 'Número de ID',
  email: 'Email',
  telefono: 'Teléfono',
  otro: 'Otro',
};

function orderHasDeliveryInfo(o: OrderItem): boolean {
  return !!(
    o.deliveryMethod ||
    o.deliveryUsername ||
    o.deliveryIdNumber ||
    o.deliveryEmail ||
    o.deliveryPhone ||
    o.deliveryOther ||
    o.deliveryDetail
  );
}

const RECHAZADO_FOOTNOTE =
  'Su dinero será reintegrado: el usuario vendedor canceló la compra, se abrió disputa o se detectó fraude o estafa.';

/** Tras el pago: el vendedor puede adjuntar la captura de transferencia (visible para el comprador en su ticket). */
const SELLER_ATTACH_TRANSFER_STATUSES = [
  'PAGADO',
  'ESPERANDO_TRANSFERENCIA',
  'TRANSFERIDO_VENDEDOR',
  'ESPERANDO_CONFIRMACION_COMPRADOR',
  'VERIFICANDO',
];

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
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);

  const openBuyerTransferCapture = () => {
    if (!order?.sellerEvidenceUrl) {
      Alert.alert(
        'Captura no disponible',
        'El vendedor aún no adjuntó la captura de transferencia del ticket. Volvé a intentar más tarde o tocá «Ayuda con mis tickets».',
      );
      return;
    }
    setTransferModalVisible(true);
  };

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
    launchImageLibrarySafe({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 }, (res) => {
      if (res.didCancel || res.errorCode) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      setBusy(true);
      void (async () => {
        try {
          await uploadOrderEvidence(orderId, { uri: asset.uri, name: asset.fileName, type: asset.type });
          await load();
          Alert.alert('Listo', 'La captura se adjuntó correctamente.');
        } catch (e) {
          Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo subir la captura.');
        } finally {
          setBusy(false);
        }
      })();
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

  const onRequestInvoice = () => {
    if (!order) return;
    setInvoiceBusy(true);
    void requestTransactionInvoice(orderId)
      .then((r) => {
        Alert.alert(
          r.alreadyExists ? 'Ya registrada' : 'Solicitud enviada',
          r.alreadyExists
            ? 'Ya tenías una solicitud de factura pendiente para esta operación. El equipo de administración la verá en el panel.'
            : 'Tu solicitud de factura de transacción fue registrada. El equipo de administración la procesará.'
        );
      })
      .catch((e) => {
        Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo registrar la solicitud.');
      })
      .finally(() => setInvoiceBusy(false));
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
  const canSellerAttachTransferCapture =
    !isBuyerView && SELLER_ATTACH_TRANSFER_STATUSES.includes(status);
  const canUploadBuyerCapture =
    isBuyerView &&
    ['TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA'].includes(status);
  const canConfirmReceived =
    isBuyerView &&
    ['TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA'].includes(status);
  const canGoToPay = isBuyerView && status === 'PENDIENTE_PAGO';
  const canDispute =
    isBuyerView &&
    ['PENDIENTE_PAGO', 'PAGADO', 'ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA'].includes(
      status
    );
  const showReason = status === 'CANCELADA' || status === 'EN_DISPUTA';
  const otherEvidence = !isBuyerView ? order?.buyerEvidenceUrl : null;
  const transferPhase = getTransferPhase(status);
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
          title={isBuyerView ? 'Comprar ticket' : 'Detalle de venta'}
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
                <Text style={styles.line}>Fecha: {formatDate(order.ticketListing.eventDate)}</Text>
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

            {orderHasDeliveryInfo(order) ? (
              <View style={styles.deliveryBox}>
                <Text style={styles.deliveryTitle}>Datos indicados para recibir el ticket</Text>
                {order.deliveryMethod ? (
                  <Text style={styles.deliveryLine}>
                    Medio principal: {DELIVERY_METHOD_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
                  </Text>
                ) : null}
                {order.deliveryUsername ? <Text style={styles.deliveryLine}>Nombre de usuario: {order.deliveryUsername}</Text> : null}
                {order.deliveryIdNumber ? <Text style={styles.deliveryLine}>Número de ID: {order.deliveryIdNumber}</Text> : null}
                {order.deliveryEmail ? <Text style={styles.deliveryLine}>Email: {order.deliveryEmail}</Text> : null}
                {order.deliveryPhone ? <Text style={styles.deliveryLine}>Teléfono: {order.deliveryPhone}</Text> : null}
                {order.deliveryOther ? <Text style={styles.deliveryLine}>Otro: {order.deliveryOther}</Text> : null}
                {order.deliveryDetail ? <Text style={styles.deliveryLine}>Detalle adicional: {order.deliveryDetail}</Text> : null}
              </View>
            ) : null}

            {isBuyerView ? (
              <View style={styles.buyerTransferPanel}>
                <Text style={styles.transferPhaseTitle}>Estado de transferencia del ticket</Text>
                <View style={styles.transferPhaseRow}>
                  {(
                    [
                      { phase: 'pendiente' as const, label: 'PENDIENTE DE TRANSFERENCIA' },
                      { phase: 'transferido' as const, label: 'TRANSFERIDO' },
                      { phase: 'rechazado' as const, label: 'RECHAZADO' },
                    ] as const
                  ).map(({ phase, label }) => {
                    const active = transferPhase === phase;
                    return (
                      <View key={phase} style={[styles.transferPhaseCell, active && styles.transferPhaseCellActive]}>
                        <Text style={[styles.transferPhaseBullet, active && styles.transferPhaseBulletActive]}>●</Text>
                        <Text style={[styles.transferPhaseLabel, active && styles.transferPhaseLabelActive]}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
                {transferPhase === 'rechazado' ? <Text style={styles.rechazadoFootnote}>{RECHAZADO_FOOTNOTE}</Text> : null}
                <TouchableOpacity
                  style={[styles.captureCtaBtn, !order.sellerEvidenceUrl && styles.captureCtaBtnMuted]}
                  onPress={openBuyerTransferCapture}
                  disabled={busy}
                >
                  <Text style={styles.captureCtaBtnText}>VER CAPTURA TRANSFERENCIA TICKET</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {!isBuyerView && canSellerAttachTransferCapture ? (
              <View style={styles.sellerAttachOutside}>
                <Text style={styles.sellerAttachHint}>
                  Adjuntá la captura de la transferencia del ticket. El comprador la verá en su ticket de compra y podrá subir
                  la captura del ticket recibido.
                </Text>
                <TouchableOpacity
                  style={[styles.secondaryBtn, styles.secondaryBtnNoTop]}
                  onPress={uploadEvidence}
                  disabled={busy}
                >
                  <Text style={styles.secondaryBtnText}>Adjuntar captura transferencia ticket</Text>
                </TouchableOpacity>
                {order.sellerEvidenceUrl ? (
                  <TouchableOpacity onPress={() => setImagePreview(order.sellerEvidenceUrl!)} activeOpacity={0.85}>
                    <Text style={styles.sellerAttachLink}>Ver captura adjunta</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onRequestInvoice}
              disabled={invoiceBusy || busy}
            >
              <Text style={styles.secondaryBtnText}>
                {invoiceBusy ? 'Enviando…' : 'Solicitar factura transacción'}
              </Text>
            </TouchableOpacity>

            {canGoToPay ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={goToPayment} disabled={busy}>
                <Text style={styles.primaryBtnText}>Ir a pago</Text>
              </TouchableOpacity>
            ) : null}

            {canMarkTransfer ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={onTransferDone} disabled={busy}>
                <Text style={styles.primaryBtnText}>Marcar como transferido</Text>
              </TouchableOpacity>
            ) : null}

            {canUploadBuyerCapture ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={uploadEvidence} disabled={busy}>
                <Text style={styles.secondaryBtnText}>SUBIR CAPTURA TICKET RECIBIDO</Text>
              </TouchableOpacity>
            ) : null}
            {canConfirmReceived ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={onConfirmReceived} disabled={busy}>
                <Text style={styles.primaryBtnText}>Confirmar ticket recibido</Text>
              </TouchableOpacity>
            ) : null}

            {isBuyerView && order.buyerEvidenceUrl ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setImagePreview(order.buyerEvidenceUrl!)}>
                <Text style={styles.secondaryBtnText}>Ver mi captura de ticket recibido</Text>
              </TouchableOpacity>
            ) : null}

            {otherEvidence ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setImagePreview(otherEvidence)}>
                <Text style={styles.secondaryBtnText}>Ver captura ticket recibido (comprador)</Text>
              </TouchableOpacity>
            ) : null}

            {isBuyerView ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ChatSoporte')}>
                <Text style={styles.secondaryBtnText}>AYUDA CON MIS TICKETS</Text>
              </TouchableOpacity>
            ) : null}

            {canDispute ? (
              <TouchableOpacity style={styles.dangerBtn} onPress={onOpenDispute} disabled={busy}>
                <Text style={styles.primaryBtnText}>CANCELAR COMPRA (SOLICITAR REINTEGRO)</Text>
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

      <Modal visible={transferModalVisible && !!order?.sellerEvidenceUrl} transparent animationType="fade">
        <View style={styles.transferModalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTransferModalVisible(false)} />
          <View style={styles.transferModalBox}>
            <ScrollView style={styles.transferModalScroll} contentContainerStyle={styles.transferModalScrollContent}>
              <Text style={styles.transferModalDisclaimer}>{TRANSFER_CAPTURE_DISCLAIMER}</Text>
              {order?.sellerEvidenceUrl ? (
                <Image
                  source={{ uri: ensureImageUrl(order.sellerEvidenceUrl)! }}
                  style={styles.bigImage}
                  resizeMode="contain"
                />
              ) : null}
            </ScrollView>
            <TouchableOpacity style={styles.transferModalClose} onPress={() => setTransferModalVisible(false)}>
              <Text style={styles.primaryBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  deliveryBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
  },
  deliveryTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: spacing.sm },
  deliveryLine: { color: colors.textMuted, fontSize: 13, marginBottom: 4, lineHeight: 19 },
  lineTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  line: { color: colors.textMuted, fontSize: 14, marginBottom: 6 },
  badge: { fontSize: 13, fontWeight: '700', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 8 },
  toneWarning: { backgroundColor: 'rgba(234,179,8,0.2)', color: '#ca8a04' },
  toneSuccess: { backgroundColor: 'rgba(34,197,94,0.2)', color: '#16a34a' },
  toneDanger: { backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  toneNeutral: { backgroundColor: 'rgba(148,163,184,0.2)', color: colors.textMuted },
  reason: { color: '#fca5a5', marginTop: 6, fontSize: 13 },
  sellerAttachOutside: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    gap: 10,
  },
  sellerAttachHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  sellerAttachLink: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 2,
  },
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
  secondaryBtnNoTop: { marginTop: 0 },
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
  buyerTransferPanel: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.25)',
  },
  transferPhaseTitle: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: spacing.sm },
  transferPhaseRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
  transferPhaseCell: {
    flex: 1,
    minWidth: 92,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  transferPhaseCellActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },
  transferPhaseBullet: { color: colors.textMuted, fontSize: 14, lineHeight: 18 },
  transferPhaseBulletActive: { color: colors.primaryLight },
  transferPhaseLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', flex: 1, lineHeight: 14 },
  transferPhaseLabelActive: { color: colors.text },
  rechazadoFootnote: { color: '#fca5a5', fontSize: 12, lineHeight: 18, marginBottom: spacing.sm },
  captureCtaBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius,
    paddingVertical: 14,
    alignItems: 'center',
  },
  captureCtaBtnMuted: { backgroundColor: 'rgba(59, 130, 246, 0.45)' },
  captureCtaBtnText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  transferModalBox: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    padding: spacing.md,
  },
  transferModalScroll: { maxHeight: 520 },
  transferModalScrollContent: { paddingBottom: spacing.md },
  transferModalDisclaimer: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  transferModalClose: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius,
    paddingVertical: 12,
    alignItems: 'center',
  },
  transferModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    padding: 20,
  },
});
