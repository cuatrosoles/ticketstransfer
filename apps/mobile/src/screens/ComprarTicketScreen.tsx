/**
 * Comprar Ticket – Paso 1: buscar por ID, datos de evento y vendedor, contraseña → pantalla de detalle.
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { TicketStubBackground } from '../components/TicketStubBackground';
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
  quantityEntries?: string | null;
  seller?: Seller;
  showFull?: boolean;
};

export function ComprarTicketScreen() {
  const [id, setId] = useState('');
  const [preview, setPreview] = useState<TicketPreview | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<Nav>();

  const fetchTicket = async (pwd?: string) => {
    const trimmed = id.trim();
    if (!trimmed) return null;
    const url = pwd
      ? `/api/tickets/${encodeURIComponent(trimmed)}?password=${encodeURIComponent(pwd)}`
      : `/api/tickets/${encodeURIComponent(trimmed)}`;
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

  const goToDetail = (pwd: string) => {
    if (!preview) return;
    navigation.navigate('ComprarTicketDetalle', { listingId: preview.id, password: pwd });
  };

  const handlePasswordSubmit = async () => {
    if (!preview || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetchTicket(password.trim());
      if (!res || !res.showFull) {
        setError('Contraseña incorrecta.');
        return;
      }
      goToDetail(password.trim());
    } catch {
      setError('Contraseña incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextWithoutPassword = () => {
    if (!preview) return;
    goToDetail('');
  };

  const seller = preview?.seller;
  const sellerName = seller
    ? [seller.firstName, seller.lastName].filter(Boolean).join(' ') || seller.username || '—'
    : '—';
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
          Podés elegir un ticket desde Inicio (Tickets a la Venta) o ingresá el ID que te pasó el vendedor para
          publicaciones privadas.
        </Text>

        <Text style={styles.label}>ID de la publicación</Text>
        <TextInput
          style={styles.input}
          placeholder="81y7eZv1bVC16kfBu7db"
          placeholderTextColor={colors.textMuted}
          value={id}
          onChangeText={setId}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} disabled={loading}>
          {loading && !preview ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Buscar</Text>
          )}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {preview && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Comprar Ticket</Text>
            <TicketStubBackground style={styles.ticketStubWrap} contentStyle={styles.ticketInner}>
              <Text style={styles.ticketId}>TICKET ID N°: {preview.id}</Text>
              <View style={styles.perforation} />
              <Text style={styles.previewRow}>EVENTO: {preview.eventName}</Text>
              <Text style={styles.previewRow}>
                FECHA: {new Date(preview.eventDate).toLocaleDateString('es-AR')}
              </Text>
              <Text style={styles.previewRow}>LUGAR: {preview.eventPlace || '—'}</Text>
              {preview.sector ? <Text style={styles.previewRow}>SECTOR: {preview.sector}</Text> : null}
              <Text style={styles.previewRow}>
                CANTIDAD DE ENTRADAS: {preview.quantityEntries || '—'}
              </Text>
            </TicketStubBackground>

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
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    placeholder="Ingresá la contraseña que te pasó el vendedor"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeBtnText}>{showPassword ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>
                  Ingresá aquí la contraseña que te adjuntó el vendedor para visualizar el ticket completo
                  antes de efectuar la compra.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordSubmit} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>SIGUIENTE</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleNextWithoutPassword}>
                <Text style={styles.primaryButtonText}>SIGUIENTE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 20,
    padding: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  inputFlex: { flex: 1, marginBottom: 0 },
  eyeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 58, 138, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  eyeBtnText: { fontSize: 18 },
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
  preview: { marginTop: spacing.lg * 2 },
  previewTitle: { fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: spacing.md },
  ticketStubWrap: { marginBottom: spacing.md },
  ticketInner: { padding: spacing.lg },
  ticketId: { fontSize: 12, color: colors.primaryLight, marginTop: spacing.lg, marginBottom: spacing.xs },
  perforation: {
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.4)',
    marginVertical: spacing.sm,
  },
  previewRow: { fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  sellerInfo: { marginBottom: spacing.lg, padding: spacing.md },
  sellerLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
});
