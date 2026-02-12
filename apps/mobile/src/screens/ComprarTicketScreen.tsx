/**
 * Comprar Ticket – Buscar por ID, previsualizar, contraseña del vendedor (opcional), continuar compra.
 * Ubicación: apps/mobile/src/screens/ComprarTicketScreen.tsx
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
import { colors, spacing, radius, glassCard } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ComprarTicket'>;

type Preview = {
  id: string;
  eventName: string;
  eventDate: string;
  sector?: string | null;
  price: number;
  currency: string;
} | null;

export function ComprarTicketScreen() {
  const [id, setId] = useState('');
  const [preview, setPreview] = useState<Preview>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const navigation = useNavigation<Nav>();

  const handleSearch = async () => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setError('');
    setLoading(true);
    setPreview(null);
    try {
      const res = await api<Preview>(`/api/tickets/${encodeURIComponent(trimmed)}`);
      setPreview(res);
    } catch {
      setError('No se encontró ninguna publicación con ese ID. Verificá el número con el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!preview) return;
    setError('');
    setLoading(true);
    try {
      const order = await api<{ id: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ ticketListingId: preview.id, paymentMethod: 'mercadopago' }),
      });
      navigation.navigate('OrderPago', { orderId: order.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar la compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}></Text>
      <Text style={styles.subtitle}>Ingresá el ID que te pasó el vendedor para ver la publicación y continuar con la compra.</Text>

      <Text style={styles.label}>ID de la publicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: UUID o código"
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
          <Text style={styles.previewTitle}>Previsualización</Text>
          <Text style={styles.previewRow}>Evento: {preview.eventName}</Text>
          <Text style={styles.previewRow}>Fecha: {new Date(preview.eventDate).toLocaleDateString('es-AR')}</Text>
          {preview.sector ? <Text style={styles.previewRow}>Sector: {preview.sector}</Text> : null}
          <Text style={styles.previewRow}>Precio: {preview.currency} {preview.price}</Text>

          <TouchableOpacity style={styles.chatToggle} onPress={() => setShowChat(!showChat)}>
            <Text style={styles.chatToggleText}>💬 {showChat ? 'Ocultar chat' : 'Chat con el vendedor (opcional)'}</Text>
          </TouchableOpacity>
          {showChat && (
            <View style={styles.chatPlaceholder}>
              <Text style={styles.chatPlaceholderText}>Chat interno (próximamente)</Text>
            </View>
          )}

          <Text style={styles.label}>Contraseña del vendedor (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Si el vendedor te pasó una contraseña"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Continuar con la compra</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: spacing.sm },
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
  preview: { marginTop: spacing.lg, padding: spacing.lg, backgroundColor: 'rgba(30, 58, 138, 0.4)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)' },
  previewTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: spacing.md },
  previewRow: { fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  chatToggle: { paddingVertical: 12, marginTop: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius, alignItems: 'center' },
  chatToggleText: { color: colors.primaryLight, fontWeight: '600', fontSize: 14 },
  chatPlaceholder: { padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.bg, borderRadius: radius, borderWidth: 1, borderColor: colors.border },
  chatPlaceholderText: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
