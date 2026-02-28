/**
 * Comprar Ticket – Flujo completo: buscar por ID, previsualizar con info vendedor,
 * contraseña para ver ticket completo, vista previa QR/factura, continuar compra.
 */

import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { api, ensureImageUrl } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ComprarTicket'>;

type Seller = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  reputationScore?: number | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kyc?: { status: string } | null;
};

type TicketPreview = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  sector?: string | null;
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  tipoEntrada?: string;
  price: number;
  currency: string;
  ticketera?: string;
  appBoletos?: string;
  orderRef?: string | null;
  captureTicketUrl?: string | null;
  captureOwnershipUrl?: string | null;
  showFull?: boolean;
  seller?: Seller;
};

export function ComprarTicketScreen() {
  const [id, setId] = useState('');
  const [preview, setPreview] = useState<TicketPreview | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<'qr' | 'factura' | null>(null);
  const navigation = useNavigation<Nav>();

  const fetchTicket = async (pwd?: string) => {
    const trimmed = id.trim();
    if (!trimmed) return null;
    const url = pwd ? `/api/tickets/${encodeURIComponent(trimmed)}?password=${encodeURIComponent(pwd)}` : `/api/tickets/${encodeURIComponent(trimmed)}`;
    return api<TicketPreview>(url);
  };

  const handleSearch = async () => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setError('');
    setLoading(true);
    setPreview(null);
    setPassword('');
    try {
      const res = await fetchTicket();
      setPreview(res);
    } catch {
      setError('No se encontró ninguna publicación con ese ID. Verificá el número con el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!preview || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetchTicket(password.trim());
      setPreview(res);
    } catch {
      setError('Contraseña incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!preview) return;
    setError('');
    setLoading(true);
    try {
      const res = await api<{ order: { id: string }; checkoutUrl?: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ ticketListingId: preview.id, paymentMethod: 'mercadopago' }),
      });
      navigation.navigate('OrderPago', { orderId: res.order.id, checkoutUrl: res.checkoutUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar la compra.');
    } finally {
      setLoading(false);
    }
  };

  const seller = preview?.seller;
  const sellerName = seller ? [seller.firstName, seller.lastName].filter(Boolean).join(' ') || seller.username || '—' : '—';
  const needsPassword = preview && !preview.showFull && preview.id;
  const salesCount = 0;

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Comprar Ticket"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <Text style={styles.subtitle}>
          Ingresá el ID que te pasó el vendedor para ver la publicación y continuar con la compra.
        </Text>

        <Text style={styles.label}>ID de la publicación</Text>
        <TextInput
          style={styles.input}
          placeholder="TTY1NX9ZNLCRV2"
          placeholderTextColor={colors.textMuted}
          value={id}
          onChangeText={setId}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} disabled={loading}>
          {loading && !preview ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Buscar</Text>}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {preview && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Comprar Ticket</Text>
            <View style={styles.ticketCard}>
              <Text style={styles.ticketId}>TICKET ID N°: {preview.id.slice(0, 14).toUpperCase()}</Text>
              <Text style={styles.previewRow}>EVENTO: {preview.eventName}</Text>
              <Text style={styles.previewRow}>FECHA: {new Date(preview.eventDate).toLocaleDateString('es-AR')}</Text>
              <Text style={styles.previewRow}>LUGAR: {preview.eventPlace || '—'}</Text>
              {preview.sector ? <Text style={styles.previewRow}>SECTOR: {preview.sector}</Text> : null}
              <Text style={styles.previewRow}>CANTIDAD DE ENTRADAS: {preview.quantityEntries || '—'}</Text>
            </View>

            {seller && (
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerLabel}>VENDEDOR: {sellerName.toUpperCase()}</Text>
                <Text style={styles.previewRow}>USUARIO: {seller.username || '—'}</Text>
                <Text style={styles.previewRow}>REPUTACIÓN: {seller.reputationScore ?? 0} PTS</Text>
                <Text style={styles.previewRow}>
                  VERIFICACION KYC: {seller.kyc?.status === 'APROBADO' ? '✓ Verificado' : 'Sin verificar'}
                </Text>
                <Text style={styles.previewRow}>
                  VERIFICACION EMAIL: {seller.emailVerified ? '✓ Verificado' : 'Sin verificar'}
                </Text>
                <Text style={styles.previewRow}>
                  VERIFICACION TELEFONO: {seller.phoneVerified ? '✓ Verificado' : 'Sin verificar'}
                </Text>
                <Text style={styles.previewRow}>VENTAS CONCRETADAS: {salesCount}</Text>
              </View>
            )}

            {needsPassword ? (
              <>
                <Text style={styles.label}>CONTRASEÑA DEL TICKET:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresá la contraseña que te pasó el vendedor"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Text style={styles.hint}>
                  Ingresá aquí la contraseña que te adjuntó el vendedor para visualizar el ticket completo antes de efectuar la compra.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordSubmit} disabled={loading}>
                  {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>SIGUIENTE</Text>}
                </TouchableOpacity>
              </>
            ) : preview.showFull ? (
              <>
                <View style={styles.ticketCard}>
                  {preview.row ? <Text style={styles.previewRow}>FILA: {preview.row}</Text> : null}
                  {preview.seat ? <Text style={styles.previewRow}>BUTACA ASIENTO: {preview.seat}</Text> : null}
                  <Text style={styles.previewRow}>PRECIO: {preview.currency} ${preview.price?.toLocaleString('es-AR')}</Text>
                  {preview.ticketera ? <Text style={styles.previewRow}>TICKETERA: {preview.ticketera}</Text> : null}
                  {preview.appBoletos ? <Text style={styles.previewRow}>APP DE BOLETOS: {preview.appBoletos}</Text> : null}
                  {preview.orderRef ? <Text style={styles.previewRow}>CODIGO DE ORDEN: {preview.orderRef}</Text> : null}
                </View>

                {(preview.captureTicketUrl || preview.captureOwnershipUrl) && (
                  <View style={styles.previewButtons}>
                    {preview.captureTicketUrl && (
                      <TouchableOpacity style={styles.previewBtn} onPress={() => setImagePreview('qr')}>
                        <Text style={styles.previewBtnText}>👁 VISTA PREVIA QR</Text>
                      </TouchableOpacity>
                    )}
                    {preview.captureOwnershipUrl && (
                      <TouchableOpacity style={styles.previewBtn} onPress={() => setImagePreview('factura')}>
                        <Text style={styles.previewBtnText}>👁 VISTA PREVIA TITULARIDAD O FACTURA</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} disabled={loading}>
                  {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>CONTINUAR CON LA COMPRA</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>CONTINUAR CON LA COMPRA</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={imagePreview !== null} transparent animationType="fade">
        <Pressable style={styles.imageModalOverlay} onPress={() => setImagePreview(null)}>
          <View style={styles.imageModalContent}>
            {imagePreview === 'qr' && preview?.captureTicketUrl && (
              <Image source={{ uri: ensureImageUrl(preview.captureTicketUrl)! }} style={styles.previewImage} resizeMode="contain" />
            )}
            {imagePreview === 'factura' && preview?.captureOwnershipUrl && (
              <Image source={{ uri: ensureImageUrl(preview.captureOwnershipUrl)! }} style={styles.previewImage} resizeMode="contain" />
            )}
            <TouchableOpacity style={styles.closeImageBtn} onPress={() => setImagePreview(null)}>
              <Text style={styles.closeImageBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md },
  input: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 20,
    padding: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  error: { color: '#ef4444', marginTop: spacing.sm },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  preview: { marginTop: spacing.lg },
  previewTitle: { fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: spacing.md },
  ticketCard: {
    padding: spacing.lg,
    backgroundColor: 'rgba(30, 58, 138, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    marginBottom: spacing.md,
  },
  ticketId: { fontSize: 12, color: colors.primaryLight, marginBottom: spacing.sm },
  previewRow: { fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  sellerInfo: { marginBottom: spacing.lg, padding: spacing.md },
  sellerLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  previewButtons: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  previewBtn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  previewBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  imageModalContent: { width: '100%', maxHeight: '80%', alignItems: 'center' },
  previewImage: { width: '100%', height: 400, borderRadius: 12 },
  closeImageBtn: { marginTop: spacing.lg, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: radius },
  closeImageBtnText: { color: colors.white, fontWeight: '600' },
});
