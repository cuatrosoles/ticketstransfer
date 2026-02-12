/**
 * Publicar ticket – Evento, tipo, precio, capturas
 * Ubicación: apps/mobile/src/screens/PublishTicketScreen.tsx
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
  Alert,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createTicketListing } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

const TIPOS_ENTRADA = ['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO'];
const TICKETERAS = ['TICKETEK', 'ALLACCESS', 'TICKETERA', 'TICKET_PLUS', 'OTRA'];
const APPS_BOLETOS = ['QUENTRO', 'ENIGMA', 'TICKET360', 'TICKETMAKER', 'OTRA'];

type ImageAsset = { uri: string; fileName?: string; type?: string };

export function PublishTicketScreen() {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPlace, setEventPlace] = useState('');
  const [sector, setSector] = useState('');
  const [tipoEntrada, setTipoEntrada] = useState('GENERAL');
  const [price, setPrice] = useState('');
  const [ticketera, setTicketera] = useState('TICKETEK');
  const [appBoletos, setAppBoletos] = useState('QUENTRO');
  const [orderRef, setOrderRef] = useState('');
  const [captureTicket, setCaptureTicket] = useState<ImageAsset | null>(null);
  const [captureOwnership, setCaptureOwnership] = useState<ImageAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = (setter: (a: ImageAsset | null) => void) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (res) => {
        if (res.didCancel || !res.assets?.[0]) return;
        const asset = res.assets[0];
        setter({
          uri: asset.uri!,
          fileName: asset.fileName || `img_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      }
    );
  };

  const formatDateForApi = (localDate: string) => {
    if (!localDate) return '';
    const [d, m, y] = localDate.split('/');
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = async () => {
    const dateStr = eventDate.includes('-') ? eventDate : eventDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
    if (!eventName.trim()) {
      Alert.alert('Falta nombre', 'Ingresá el nombre del evento.');
      return;
    }
    if (!dateStr) {
      Alert.alert('Falta fecha', 'Ingresá la fecha del evento (AAAA-MM-DD o DD/MM/AAAA).');
      return;
    }
    const priceNum = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Precio inválido', 'Ingresá un precio válido.');
      return;
    }
    if (!captureTicket?.uri) {
      Alert.alert('Falta imagen', 'Subí la captura del ticket (QR pixelado).');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('eventName', eventName.trim());
      formData.append('eventDate', dateStr);
      formData.append('eventPlace', eventPlace.trim());
      formData.append('sector', sector.trim());
      formData.append('tipoEntrada', tipoEntrada);
      formData.append('price', String(priceNum));
      formData.append('currency', 'ARS');
      formData.append('ticketera', ticketera);
      formData.append('appBoletos', appBoletos);
      if (orderRef.trim()) formData.append('orderRef', orderRef.trim());
      const uri = (uri: string) => (Platform.OS === 'android' ? uri : uri.replace('file://', ''));
      formData.append('captureTicket', {
        uri: uri(captureTicket.uri),
        name: captureTicket.fileName || 'ticket.jpg',
        type: captureTicket.type || 'image/jpeg',
      } as unknown as Blob);
      if (captureOwnership?.uri) {
        formData.append('captureOwnership', {
          uri: uri(captureOwnership.uri),
          name: captureOwnership.fileName || 'ownership.jpg',
          type: captureOwnership.type || 'image/jpeg',
        } as unknown as Blob);
      }
      await createTicketListing(formData);
      Alert.alert('Listo', 'Tu ticket fue enviado a verificación.');
      setEventName('');
      setEventDate('');
      setPrice('');
      setCaptureTicket(null);
      setCaptureOwnership(null);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Nombre del evento *</Text>
      <TextInput style={styles.input} placeholder="Ej. Recital X" placeholderTextColor={colors.textMuted} value={eventName} onChangeText={setEventName} />

      <Text style={styles.label}>Fecha (AAAA-MM-DD o DD/MM/AAAA) *</Text>
      <TextInput style={styles.input} placeholder="2025-03-15" placeholderTextColor={colors.textMuted} value={eventDate} onChangeText={setEventDate} />

      <Text style={styles.label}>Lugar</Text>
      <TextInput style={styles.input} placeholder="Estadio / Teatro" placeholderTextColor={colors.textMuted} value={eventPlace} onChangeText={setEventPlace} />

      <Text style={styles.label}>Sector</Text>
      <TextInput style={styles.input} placeholder="Platea, Campo..." placeholderTextColor={colors.textMuted} value={sector} onChangeText={setSector} />

      <Text style={styles.label}>Tipo de entrada</Text>
      <View style={styles.chipRow}>
        {TIPOS_ENTRADA.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, tipoEntrada === t && styles.chipActive]} onPress={() => setTipoEntrada(t)}>
            <Text style={styles.chipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Precio (ARS) *</Text>
      <TextInput style={styles.input} placeholder="15000" placeholderTextColor={colors.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <Text style={styles.label}>Ticketera</Text>
      <View style={styles.chipRow}>
        {TICKETERAS.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, ticketera === t && styles.chipActive]} onPress={() => setTicketera(t)}>
            <Text style={styles.chipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>App de boletos</Text>
      <View style={styles.chipRow}>
        {APPS_BOLETOS.map((a) => (
          <TouchableOpacity key={a} style={[styles.chip, appBoletos === a && styles.chipActive]} onPress={() => setAppBoletos(a)}>
            <Text style={styles.chipText}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Código de orden / referencia</Text>
      <TextInput style={styles.input} placeholder="Opcional" placeholderTextColor={colors.textMuted} value={orderRef} onChangeText={setOrderRef} />

      <Text style={styles.label}>Captura del ticket (QR pixelado) *</Text>
      <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setCaptureTicket)}>
        {captureTicket ? (
          <Image source={{ uri: captureTicket.uri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Captura de titularidad</Text>
      <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setCaptureOwnership)}>
        {captureOwnership ? (
          <Image source={{ uri: captureOwnership.uri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabled]} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Publicar</Text>}
      </TouchableOpacity>
    </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
  input: { backgroundColor: 'rgba(30, 58, 138, 0.4)', borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)', borderRadius: 20, padding: 14, color: colors.text, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)' },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(59,130,246,0.2)' },
  chipText: { color: colors.text, fontSize: 13 },
  imageButton: { height: 100, backgroundColor: 'rgba(30, 58, 138, 0.4)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)', marginBottom: spacing.md, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imageButtonText: { color: colors.primaryLight },
  thumb: { width: '100%', height: '100%' },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center', marginTop: spacing.sm },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.7 },
});
