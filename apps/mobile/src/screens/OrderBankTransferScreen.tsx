/**
 * Transferencia bancaria – datos de cuenta, adjuntar comprobante y confirmar pago.
 */

import * as React from 'react';
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
import type { RootStackParamList } from '../navigation/types';
import { api, submitBankTransferPayment } from '../lib/api';
import { launchImageLibrarySafe } from '../lib/imagePickerSafe';
import { PLATFORM_BANK_ACCOUNT } from '../constants/bankTransfer';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, glassCard, stackScreenContent } from '../theme';

type Order = {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  ticketListing?: { eventName: string };
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'OrderBankTransfer'>;
type Route = RouteProp<RootStackParamList, 'OrderBankTransfer'>;

function CopyableRow({ label, value }: { label: string; value: string }) {
  const copy = () => {
    Clipboard.setString(value);
    Alert.alert('Copiado', `${label} copiado al portapapeles.`);
  };

  return (
    <View style={styles.accountRow}>
      <View style={styles.accountTextWrap}>
        <Text style={styles.accountLabel}>{label}</Text>
        <Text style={styles.accountValue} selectable>
          {value}
        </Text>
      </View>
      <TouchableOpacity style={styles.copyBtn} onPress={copy} accessibilityRole="button" accessibilityLabel={`Copiar ${label}`}>
        <FontAwesome name="copy" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

export function OrderBankTransferScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [proofName, setProofName] = useState<string | undefined>();
  const [proofType, setProofType] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      const o = await api<Order>(`/api/orders/${orderId}`);
      setOrder(o);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const pickProof = () => {
    launchImageLibrarySafe({ mediaType: 'photo', quality: 0.85, selectionLimit: 1 }, (res) => {
      if (res.didCancel || res.errorCode) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      setProofUri(asset.uri);
      setProofName(asset.fileName);
      setProofType(asset.type);
    });
  };

  const handleSubmit = async () => {
    if (!proofUri) {
      Alert.alert('Comprobante requerido', 'Adjuntá la captura de la transferencia antes de continuar.');
      return;
    }
    setSubmitting(true);
    try {
      await submitBankTransferPayment(orderId, {
        uri: proofUri,
        name: proofName,
        type: proofType,
      });
      navigation.replace('OrderPaymentResult', { orderId, status: 'success' });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo registrar la transferencia.');
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
          <Text style={styles.muted}>No se encontró la orden.</Text>
        </View>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Transferencia bancaria"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />

        <View style={[styles.card, glassCard]}>
          <Text style={styles.eventName}>{order.ticketListing?.eventName ?? 'Orden'}</Text>
          <Text style={styles.total}>
            {order.currency} {order.totalAmount.toLocaleString('es-AR')}
          </Text>
          <Text style={styles.escrow}>
            Tu dinero será retenido y protegido por la plataforma hasta que el vendedor transfiera el ticket y ambos
            usuarios adjunten/validen capturas de recibido.
          </Text>
          <Text style={styles.noCommission}>
            Con transferencia bancaria abonás el valor indicado en la app sin comisión adicional.
          </Text>
        </View>

        <View style={[styles.accountBox, glassCard]}>
          <Text style={styles.accountTitle}>{PLATFORM_BANK_ACCOUNT.title}</Text>
          <CopyableRow label="CVU" value={PLATFORM_BANK_ACCOUNT.cvu} />
          <CopyableRow label="ALIAS" value={PLATFORM_BANK_ACCOUNT.alias} />
          <Text style={styles.accountLabel}>TITULAR</Text>
          <Text style={styles.accountValueStatic}>{PLATFORM_BANK_ACCOUNT.holder}</Text>
          <Text style={styles.accountLabel}>CUIT/CUIL</Text>
          <Text style={styles.accountValueStatic}>{PLATFORM_BANK_ACCOUNT.taxId}</Text>
        </View>

        <TouchableOpacity style={[styles.attachBtn, glassCard]} onPress={pickProof} activeOpacity={0.85}>
          <FontAwesome name="plus" size={14} color="#93c5fd" style={styles.attachIcon} />
          <Text style={styles.attachText}>
            {proofUri ? 'Cambiar captura de transferencia' : 'Adjuntar captura de transferencia'}
          </Text>
        </TouchableOpacity>

        {proofUri ? (
          <Image source={{ uri: proofUri }} style={styles.preview} resizeMode="contain" />
        ) : null}

        <Text style={styles.footerHint}>
          Recordá adjuntar el comprobante de la transferencia realizada y luego pulsar en el botón de «Ya transferí» para
          poder continuar.
        </Text>

        <TouchableOpacity
          style={[styles.submitBtn, (!proofUri || submitting) && styles.submitBtnDisabled]}
          onPress={() => void handleSubmit()}
          disabled={!proofUri || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>YA TRANSFERÍ</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: colors.textMuted },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  total: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  escrow: { fontSize: 14, color: colors.primaryLight, lineHeight: 20, marginBottom: spacing.sm },
  noCommission: { fontSize: 13, color: '#86efac', lineHeight: 19, fontWeight: '600' },
  accountBox: { padding: spacing.lg, marginBottom: spacing.md, gap: 8 },
  accountTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  accountTextWrap: { flex: 1, minWidth: 0 },
  accountLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.3 },
  accountValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },
  accountValueStatic: { fontSize: 14, color: colors.text, fontWeight: '600', marginBottom: 6 },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  attachIcon: { marginTop: 1 },
  attachText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radius,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  footerHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
