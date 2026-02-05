/**
 * Verificación de identidad (KYC) – Estado y subida de DNI + selfie
 * Ubicación: apps/mobile/src/screens/KycScreen.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getKyc, uploadKyc } from '../lib/api';
import { colors, spacing, radius } from '../theme';

type ImageAsset = { uri: string; fileName?: string; type?: string };

export function KycScreen() {
  const [status, setStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dniFront, setDniFront] = useState<ImageAsset | null>(null);
  const [dniBack, setDniBack] = useState<ImageAsset | null>(null);
  const [selfie, setSelfie] = useState<ImageAsset | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  const pickImage = (setter: (a: ImageAsset | null) => void) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (res) => {
        if (res.didCancel || !res.assets?.[0]) return;
        const asset = res.assets[0];
        setter({
          uri: asset.uri!,
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        });
      }
    );
  };

  const handleUpload = async () => {
    if (!dniFront?.uri) {
      Alert.alert('Falta imagen', 'Subí al menos el frente del DNI.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      if (dniFront.uri) {
        formData.append('dniFront', {
          uri: Platform.OS === 'android' ? dniFront.uri : dniFront.uri.replace('file://', ''),
          name: dniFront.fileName || 'dni_front.jpg',
          type: dniFront.type || 'image/jpeg',
        } as unknown as Blob);
      }
      if (dniBack?.uri) {
        formData.append('dniBack', {
          uri: Platform.OS === 'android' ? dniBack.uri : dniBack.uri.replace('file://', ''),
          name: dniBack.fileName || 'dni_back.jpg',
          type: dniBack.type || 'image/jpeg',
        } as unknown as Blob);
      }
      if (selfie?.uri) {
        formData.append('selfie', {
          uri: Platform.OS === 'android' ? selfie.uri : selfie.uri.replace('file://', ''),
          name: selfie.fileName || 'selfie.jpg',
          type: selfie.type || 'image/jpeg',
        } as unknown as Blob);
      }
      await uploadKyc(formData);
      setStatus('EN_REVISION');
      setDniFront(null);
      setDniBack(null);
      setSelfie(null);
      Alert.alert('Listo', 'Documentación enviada. Te avisaremos cuando sea revisada.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo subir.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statusLabel = status === 'APROBADO' ? 'Aprobado' : status === 'RECHAZADO' ? 'Rechazado' : status === 'EN_REVISION' ? 'En revisión' : 'Pendiente';
  const canUpload = status === 'PENDIENTE' || status === 'RECHAZADO';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estado de verificación</Text>
        <Text style={[styles.status, status === 'APROBADO' && styles.statusOk, status === 'RECHAZADO' && styles.statusError]}>
          {statusLabel}
        </Text>
        {rejectionReason ? <Text style={styles.reason}>{rejectionReason}</Text> : null}
      </View>

      {canUpload && (
        <>
          <Text style={styles.label}>DNI – Frente (obligatorio)</Text>
          <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setDniFront)}>
            {dniFront ? (
              <Image source={{ uri: dniFront.uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <Text style={styles.imageButtonText}>Tocar para seleccionar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>DNI – Dorso</Text>
          <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setDniBack)}>
            {dniBack ? (
              <Image source={{ uri: dniBack.uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <Text style={styles.imageButtonText}>Tocar para seleccionar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Selfie</Text>
          <TouchableOpacity style={styles.imageButton} onPress={() => pickImage(setSelfie)}>
            {selfie ? (
              <Image source={{ uri: selfie.uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <Text style={styles.imageButtonText}>Tocar para seleccionar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, uploading && styles.disabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Enviar verificación</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  status: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  statusOk: { color: '#22c55e' },
  statusError: { color: '#ef4444' },
  reason: { marginTop: spacing.sm, fontSize: 14, color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
  imageButton: { height: 120, backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imageButtonText: { color: colors.primaryLight },
  thumb: { width: '100%', height: '100%' },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center', marginTop: spacing.sm },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.7 },
});
