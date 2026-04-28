import * as React from 'react';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderPurchaseDetails'>;
type Route = RouteProp<RootStackParamList, 'OrderPurchaseDetails'>;
type TransferMethod = 'usuario' | 'id' | 'email' | 'telefono' | 'otro';

const METHODS: Array<{ id: TransferMethod; label: string }> = [
  { id: 'usuario', label: 'NOMBRE DE USUARIO' },
  { id: 'id', label: 'NUMERO DE ID' },
  { id: 'email', label: 'EMAIL' },
  { id: 'telefono', label: 'NUMERO DE TELEFONO' },
  { id: 'otro', label: 'OTRO' },
];

type TicketPreview = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  sector?: string | null;
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  price: number;
  currency: string;
  ticketera?: string;
  appBoletos?: string;
  orderRef?: string | null;
  showFull?: boolean;
};

export function OrderPurchaseDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listingId, password } = route.params;
  const [method, setMethod] = useState<TransferMethod>('usuario');
  const [extraData, setExtraData] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<TicketPreview | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = password ? `?password=${encodeURIComponent(password)}` : '';
    api<TicketPreview>(`/api/tickets/${encodeURIComponent(listingId)}${q}`)
      .then((res) => {
        if (!cancelled) setPreview(res);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el detalle de compra.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId, password]);

  const extraRequired = method === 'otro';
  const canContinue = useMemo(
    () => !creating && preview?.showFull && (!extraRequired || extraData.trim().length > 0),
    [creating, preview?.showFull, extraRequired, extraData]
  );

  const handleCreateOrder = async () => {
    if (!preview?.showFull) {
      setError('Necesitás visualizar el ticket completo antes de continuar.');
      return;
    }
    if (extraRequired && !extraData.trim()) {
      setError('Completá el medio de recepción para continuar.');
      return;
    }
    setError('');
    setCreating(true);
    try {
      const res = await api<{ order: { id: string }; checkoutUrl?: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          ticketListingId: preview.id,
          paymentMethod: 'mercadopago',
          deliveryMethod: method,
          deliveryDetail: extraData.trim() || undefined,
        }),
      });
      navigation.replace('OrderPago', { orderId: res.order.id, checkoutUrl: res.checkoutUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar la compra.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Detalles de compra"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : preview ? (
          <>
            <TicketStubBackground backgroundOrientation="portrait" style={styles.stub} contentStyle={styles.stubInner}>
              <Text style={styles.line}>EVENTO: {preview.eventName}</Text>
              <Text style={styles.line}>FECHA: {new Date(preview.eventDate).toLocaleDateString('es-AR')}</Text>
              <Text style={styles.line}>LUGAR: {preview.eventPlace || '—'}</Text>
              {preview.sector ? <Text style={styles.line}>SECTOR: {preview.sector}</Text> : null}
              {preview.row ? <Text style={styles.line}>FILA: {preview.row}</Text> : null}
              {preview.seat ? <Text style={styles.line}>BUTACA: {preview.seat}</Text> : null}
              <Text style={styles.line}>
                PRECIO: {preview.currency} ${preview.price.toLocaleString('es-AR')}
              </Text>
            </TicketStubBackground>

            <Text style={styles.help}>
              Corroborá tener instalada la app donde recibirás el ticket. Indicá por qué medio querés recibirlo:
            </Text>
            <View style={styles.methodsWrap}>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMethod(m.id)}
                  style={[styles.methodBtn, method === m.id && styles.methodBtnActive]}
                >
                  <Text style={styles.methodBtnText}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {extraRequired ? (
              <TextInput
                value={extraData}
                onChangeText={setExtraData}
                placeholder="Completá el medio de recepción"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            ) : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={[styles.primaryButton, !canContinue && styles.disabledBtn]} onPress={handleCreateOrder} disabled={!canContinue}>
              <Text style={styles.primaryButtonText}>{creating ? 'Procesando…' : 'CONTINUAR AL PAGO'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.error}>{error || 'No se pudo obtener el ticket.'}</Text>
        )}
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stub: { marginBottom: spacing.md },
  stubInner: { padding: spacing.lg, minHeight: 360 },
  line: { color: colors.text, fontSize: 14, marginBottom: 8 },
  help: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md, lineHeight: 20 },
  methodsWrap: { gap: 8 },
  methodBtn: {
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30,58,138,0.35)',
  },
  methodBtnActive: { backgroundColor: 'rgba(59,130,246,0.35)', borderColor: colors.primaryLight },
  methodBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
  input: {
    marginTop: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
    color: colors.text,
    backgroundColor: 'rgba(30,58,138,0.35)',
    padding: 12,
  },
  error: { color: '#f87171', marginTop: spacing.sm },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  disabledBtn: { opacity: 0.5 },
  primaryButtonText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
