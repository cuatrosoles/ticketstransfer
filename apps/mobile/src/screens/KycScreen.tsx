/**
 * Verificación KYC – Didit (WebView). Estado y botón para iniciar flujo con documento + liveness.
 * Ubicación: apps/mobile/src/screens/KycScreen.tsx
 *
 * Flujo: createKycSession → abre KycWebView con URL Didit → liveness + documento en WebView.
 * Al terminar Didit redirige a ticketTransfer://kyc/callback y el WebView cierra.
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getKyc, createKycSession } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, glassCard } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Kyc'>;

export function KycScreen() {
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const load = () => {
    setLoading(true);
    getKyc()
      .then((data) => {
        setStatus(data.status);
        setRejectionReason(data.rejectionReason || null);
      })
      .catch(() => setStatus('PENDIENTE'))
      .finally(() => setLoading(false));
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const handleStartVerification = async () => {
    setStarting(true);
    try {
      const { url } = await createKycSession('mobile');
      navigation.navigate('KycWebView', { sessionUrl: url });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo iniciar la verificación.');
    } finally {
      setStarting(false);
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

  const statusLabel =
    status === 'APROBADO'
      ? 'Aprobado'
      : status === 'RECHAZADO'
        ? 'Rechazado'
        : status === 'EN_REVISION'
          ? 'En revisión'
          : 'Pendiente';
  const canStart = (status === 'PENDIENTE' || status === 'RECHAZADO') && !starting;
  const statusDotColor =
    status === 'APROBADO' ? '#22c55e' : status === 'RECHAZADO' ? '#ef4444' : '#eab308';

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Verificación KYC"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <View style={[styles.card, glassCard]}>
          <Text style={styles.cardTitle}>Estado de tu verificación</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
            <Text
              style={[
                styles.status,
                status === 'APROBADO' && styles.statusOk,
                status === 'RECHAZADO' && styles.statusError,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.statusDot, styles.dotYellow]} />
              <Text style={styles.legendText}>Pendiente</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.statusDot, styles.dotGreen]} />
              <Text style={styles.legendText}>Aprobado</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.statusDot, styles.dotRed]} />
              <Text style={styles.legendText}>Rechazado</Text>
            </View>
          </View>
          {rejectionReason ? <Text style={styles.reason}>{rejectionReason}</Text> : null}
        </View>

        {canStart && (
          <>
            <Text style={styles.helpText}>
              Verificá tu identidad con fotos de tu documento y selfie. Usaremos la cámara para una
              prueba de vida (liveness).
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, starting && styles.disabled]}
              onPress={handleStartVerification}
              disabled={starting}
            >
              {starting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Iniciar verificación</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.helpText}>
          Podés usar la app mientras verificamos. No podrás publicar ni comprar tickets hasta que el
          estado sea Aprobado.
        </Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
          <Text style={styles.backLinkText}>Ir al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, marginBottom: spacing.lg },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  dotYellow: { backgroundColor: '#eab308' },
  dotGreen: { backgroundColor: '#22c55e' },
  dotRed: { backgroundColor: '#ef4444' },
  legend: { marginTop: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  legendText: { fontSize: 13, color: colors.textMuted },
  status: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  statusOk: { color: '#22c55e' },
  statusError: { color: '#ef4444' },
  reason: { marginTop: spacing.sm, fontSize: 14, color: colors.textMuted },
  helpText: { fontSize: 13, color: colors.textMuted, marginTop: spacing.lg, lineHeight: 20 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.7 },
  backLink: { marginTop: spacing.lg, alignSelf: 'center' },
  backLinkText: { color: colors.primaryLight, fontWeight: '600', fontSize: 15 },
});
