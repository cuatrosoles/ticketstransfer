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
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createTicketListing } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius } from '../theme';
import { TICKETERA_LOGOS, APP_BOLETOS_LOGOS } from '../data/serviceLogos';

const TIPOS_ENTRADA = ['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO'];
const TICKETERAS = ['TICKETEK', 'ALLACCESS', 'TICKET_PLUS', 'OTRA'];
const APPS_BOLETOS = ['QUENTRO', 'ENIGMA', 'OTRA'];
const COMISION_PORCENTAJE = 5;

type ImageAsset = { uri: string; fileName?: string; type?: string };

function ServiceChip({
  label,
  selected,
  onPress,
  logoUri,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  logoUri?: string | null;
}) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.chipActive]}
      onPress={onPress}
    >
      {logoUri ? (
        <Image source={{ uri: logoUri }} style={chipStyles.logo} resizeMode="contain" />
      ) : null}
      <Text style={chipStyles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    gap: 6,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(59,130,246,0.2)' },
  chipText: { color: colors.text, fontSize: 13 },
  logo: { width: 24, height: 24 },
});

export function PublishTicketScreen() {
  const navigation = useNavigation();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPlace, setEventPlace] = useState('');
  const [sector, setSector] = useState('');
  const [fila, setFila] = useState('');
  const [cantidadEntradas, setCantidadEntradas] = useState('');
  const [tipoEntrada, setTipoEntrada] = useState('GENERAL');
  const [tipoEntradaOtro, setTipoEntradaOtro] = useState('');
  const [price, setPrice] = useState('');
  const [ticketera, setTicketera] = useState('TICKETEK');
  const [ticketeraOtra, setTicketeraOtra] = useState('');
  const [appBoletos, setAppBoletos] = useState('QUENTRO');
  const [butacasAsientos, setButacasAsientos] = useState('');
  const [appBoletosOtra, setAppBoletosOtra] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [publicationPassword, setPublicationPassword] = useState('');
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
      if (fila.trim()) formData.append('row', fila.trim());
      if (cantidadEntradas.trim()) formData.append('quantityEntries', cantidadEntradas.trim());
      formData.append('tipoEntrada', tipoEntrada);
      formData.append('price', String(priceNum));
      formData.append('currency', 'ARS');
      formData.append('ticketera', ticketera);
      formData.append('appBoletos', appBoletos);
      if (orderRef.trim()) formData.append('orderRef', orderRef.trim());
      if (publicationPassword.trim()) formData.append('publicationPassword', publicationPassword.trim());
      if (ticketera === 'OTRA' && ticketeraOtra.trim()) formData.append('ticketeraOtra', ticketeraOtra.trim());
      if (appBoletos === 'OTRA' && appBoletosOtra.trim()) formData.append('appBoletosOtra', appBoletosOtra.trim());
      if (butacasAsientos.trim()) formData.append('seat', butacasAsientos.trim());
      if (tipoEntrada === 'OTRO' && tipoEntradaOtro.trim()) formData.append('tipoEntradaOtro', tipoEntradaOtro.trim());
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

  const priceNum = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const comision = priceNum * (COMISION_PORCENTAJE / 100);
  const montoVendedor = priceNum - comision;

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header dentro del scroll: se desplaza con el contenido (sin sticky) */}
      <View style={styles.inlineHeader}>
        <ScreenHeader
          title="Publicar ticket"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
      </View>

      <Text style={styles.label}>Nombre del evento *</Text>
      <TextInput style={styles.input} placeholder="Ej. Recital X" placeholderTextColor={colors.textMuted} value={eventName} onChangeText={setEventName} />

      <Text style={styles.label}>Fecha (AAAA-MM-DD o DD/MM/AAAA) *</Text>
      <TextInput style={styles.input} placeholder="2025-03-15" placeholderTextColor={colors.textMuted} value={eventDate} onChangeText={setEventDate} />

      <Text style={styles.label}>Lugar</Text>
      <TextInput style={styles.input} placeholder="Estadio / Teatro" placeholderTextColor={colors.textMuted} value={eventPlace} onChangeText={setEventPlace} />

      <Text style={styles.label}>Sector</Text>
      <TextInput style={styles.input} placeholder="Platea, Campo..." placeholderTextColor={colors.textMuted} value={sector} onChangeText={setSector} />

      <Text style={styles.label}>Fila</Text>
      <TextInput style={styles.input} placeholder="Fila" placeholderTextColor={colors.textMuted} value={fila} onChangeText={setFila} />

      <Text style={styles.label}>Tipo de entrada</Text>
      <View style={styles.chipRow}>
        {TIPOS_ENTRADA.map((t) => (
          <TouchableOpacity key={t} style={[styles.chip, tipoEntrada === t && styles.chipActive]} onPress={() => setTipoEntrada(t)}>
            <Text style={styles.chipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tipoEntrada === 'OTRO' && (
        <>
          <Text style={styles.label}>Especificar tipo de entrada</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Palco, Preferencial..."
            placeholderTextColor={colors.textMuted}
            value={tipoEntradaOtro}
            onChangeText={setTipoEntradaOtro}
          />
        </>
      )}

      <Text style={styles.label}>Cantidad de entradas</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 2"
        placeholderTextColor={colors.textMuted}
        value={cantidadEntradas}
        onChangeText={setCantidadEntradas}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio (ARS) *</Text>
      <TextInput style={styles.input} placeholder="15000" placeholderTextColor={colors.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" />
      {priceNum > 0 && (
        <Text style={styles.montoVendedor}>
          Comisión por transferencia {COMISION_PORCENTAJE}%. Usted recibirá: ARS ${montoVendedor.toLocaleString('es-AR')}
        </Text>
      )}

      <Text style={styles.label}>Ticketera</Text>
      <View style={styles.chipRow}>
        {TICKETERAS.map((t) => (
          <ServiceChip
            key={t}
            label={t}
            selected={ticketera === t}
            onPress={() => setTicketera(t)}
            logoUri={TICKETERA_LOGOS[t]}
          />
        ))}
      </View>
      {ticketera === 'OTRA' && (
        <>
          <Text style={styles.label}>Especificar ticketera</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la ticketera"
            placeholderTextColor={colors.textMuted}
            value={ticketeraOtra}
            onChangeText={setTicketeraOtra}
          />
        </>
      )}

      <Text style={styles.label}>App de boletos</Text>
      <View style={styles.chipRow}>
        {APPS_BOLETOS.map((a) => (
          <ServiceChip
            key={a}
            label={a}
            selected={appBoletos === a}
            onPress={() => setAppBoletos(a)}
            logoUri={APP_BOLETOS_LOGOS[a]}
          />
        ))}
      </View>
      {appBoletos === 'OTRA' && (
        <>
          <Text style={styles.label}>Especificar app de boletos</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la app"
            placeholderTextColor={colors.textMuted}
            value={appBoletosOtra}
            onChangeText={setAppBoletosOtra}
          />
        </>
      )}

      <Text style={styles.label}>Butacas - Asientos Nro.</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 1, 2, 3"
        placeholderTextColor={colors.textMuted}
        value={butacasAsientos}
        onChangeText={setButacasAsientos}
      />

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

      <Text style={styles.label}>Captura de titularidad o factura</Text>
      <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setCaptureOwnership)}>
        {captureOwnership ? (
          <Image source={{ uri: captureOwnership.uri }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Contraseña de la publicación</Text>
      <TextInput
        style={styles.input}
        placeholder="Contraseña para transferir el ticket"
        placeholderTextColor={colors.textMuted}
        value={publicationPassword}
        onChangeText={setPublicationPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabled]} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Publicar</Text>}
      </TouchableOpacity>
    </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  inlineHeader: { marginBottom: spacing.md },
  montoVendedor: { fontSize: 13, color: colors.primaryLight, marginTop: -spacing.sm, marginBottom: spacing.md },
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
