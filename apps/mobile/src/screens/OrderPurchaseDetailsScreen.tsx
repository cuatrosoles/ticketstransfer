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
import { EventDetailsPanel } from '../components/EventDetailsPanel';
import { SellerInfoBlock, type SellerInfo } from '../components/SellerInfoBlock';
import { colors, radius, spacing, stackScreenContent } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderPurchaseDetails'>;
type Route = RouteProp<RootStackParamList, 'OrderPurchaseDetails'>;

const BASE_INPUTS: Array<{
  key: 'deliveryUsername' | 'deliveryIdNumber' | 'deliveryEmail' | 'deliveryPhone';
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
}> = [
  {
    key: 'deliveryUsername',
    label: 'Nombre de usuario',
    placeholder: 'Ej.: tu usuario en la app de boletos (Quentro, Enigma, etc.)',
    autoCapitalize: 'none',
  },
  {
    key: 'deliveryIdNumber',
    label: 'Número de ID',
    placeholder: 'Ej.: DNI, pasaporte o ID de cuenta en la ticketera',
  },
  {
    key: 'deliveryEmail',
    label: 'Email',
    placeholder: 'Correo donde recibirás la confirmación o la transferencia',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    key: 'deliveryPhone',
    label: 'Número de teléfono',
    placeholder: 'Incluí código de país, ej. +54 9 11 2345-6789',
    keyboardType: 'phone-pad',
    autoCapitalize: 'none',
  },
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
  seller?: SellerInfo;
};

type DeliveryForm = {
  deliveryUsername: string;
  deliveryIdNumber: string;
  deliveryEmail: string;
  deliveryPhone: string;
  deliveryOther: string;
};

const emptyForm: DeliveryForm = {
  deliveryUsername: '',
  deliveryIdNumber: '',
  deliveryEmail: '',
  deliveryPhone: '',
  deliveryOther: '',
};

function hasAnyDeliveryData(form: DeliveryForm, showOtherField: boolean): boolean {
  const t = (s: string) => s.trim().length > 0;
  return (
    t(form.deliveryUsername) ||
    t(form.deliveryIdNumber) ||
    t(form.deliveryEmail) ||
    t(form.deliveryPhone) ||
    (showOtherField && t(form.deliveryOther))
  );
}

export function OrderPurchaseDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listingId, password } = route.params;
  const [form, setForm] = useState<DeliveryForm>(emptyForm);
  const [showOtherField, setShowOtherField] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<TicketPreview | null>(null);

  const setField = (key: keyof DeliveryForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOtro = () => {
    setShowOtherField((prev) => {
      if (prev) {
        setForm((f) => ({ ...f, deliveryOther: '' }));
      }
      return !prev;
    });
  };

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

  const deliveryOk = useMemo(() => hasAnyDeliveryData(form, showOtherField), [form, showOtherField]);
  const canContinue = useMemo(
    () => !creating && !!preview?.showFull && deliveryOk,
    [creating, preview?.showFull, deliveryOk]
  );

  const handleCreateOrder = async () => {
    if (!preview?.showFull) {
      setError('Necesitás visualizar el ticket completo antes de continuar.');
      return;
    }
    if (!deliveryOk) {
      setError('Completá al menos uno de los datos de contacto o recepción, u «Otro» si lo activaste.');
      return;
    }
    setError('');
    setCreating(true);
    const trimOrUndef = (s: string) => {
      const t = s.trim();
      return t.length > 0 ? t : undefined;
    };
    try {
      const body: Record<string, unknown> = {
        ticketListingId: preview.id,
        paymentMethod: 'mercadopago',
        deliveryUsername: trimOrUndef(form.deliveryUsername),
        deliveryIdNumber: trimOrUndef(form.deliveryIdNumber),
        deliveryEmail: trimOrUndef(form.deliveryEmail),
        deliveryPhone: trimOrUndef(form.deliveryPhone),
      };
      if (showOtherField) {
        body.deliveryOther = trimOrUndef(form.deliveryOther);
      }
      const res = await api<{
        order: { id: string };
        checkoutUrl?: string;
        resumed?: boolean;
      }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(body),
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
            <EventDetailsPanel
              data={{
                listingId: preview.id,
                eventName: preview.eventName,
                eventDate: preview.eventDate,
                eventPlace: preview.eventPlace,
                sector: preview.sector,
                row: preview.row,
                seat: preview.seat,
                quantityEntries: preview.quantityEntries,
                price: preview.price,
                currency: preview.currency,
                ticketera: preview.ticketera,
                appBoletos: preview.appBoletos,
                orderRef: preview.orderRef,
              }}
              showFull={preview.showFull}
            />

            {preview.seller ? <SellerInfoBlock seller={preview.seller} /> : null}

            <Text style={styles.help}>
              Corroborá tener instalada la app donde recibirás el ticket. Completá los datos que correspondan. Si necesitás indicar
              algo más (por ejemplo una dirección), tocá OTRO.
            </Text>
            <View style={styles.inputsBlock}>
              {BASE_INPUTS.map((field) => (
                <View key={field.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    value={form[field.key]}
                    onChangeText={(t) => setField(field.key, t)}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    keyboardType={field.keyboardType ?? 'default'}
                    autoCapitalize={field.autoCapitalize ?? 'sentences'}
                    autoCorrect={false}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={toggleOtro}
              style={[styles.otroBtn, showOtherField && styles.otroBtnActive]}
              accessibilityRole="button"
              accessibilityLabel={showOtherField ? 'Ocultar campo Otro' : 'Agregar campo Otro'}
            >
              <Text style={styles.otroBtnText}>OTRO</Text>
            </TouchableOpacity>

            {showOtherField ? (
              <View style={[styles.fieldWrap, styles.otherFieldWrap]}>
                <Text style={styles.fieldLabel}>Otro</Text>
                <TextInput
                  value={form.deliveryOther}
                  onChangeText={(t) => setField('deliveryOther', t)}
                  placeholder="Ej.: dirección de entrega, indicaciones o cualquier dato adicional"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  multiline
                />
              </View>
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
  content: stackScreenContent,
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  help: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md, lineHeight: 20 },
  inputsBlock: { gap: spacing.sm },
  fieldWrap: { marginBottom: spacing.xs },
  otherFieldWrap: { marginTop: spacing.sm },
  fieldLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
    color: colors.text,
    backgroundColor: 'rgba(30,58,138,0.35)',
    padding: 12,
    fontSize: 14,
    minHeight: 44,
  },
  otroBtn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30,58,138,0.35)',
    alignItems: 'center',
  },
  otroBtnActive: { backgroundColor: 'rgba(59,130,246,0.35)', borderColor: colors.primaryLight },
  otroBtnText: { color: colors.text, fontWeight: '700', fontSize: 14 },
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
