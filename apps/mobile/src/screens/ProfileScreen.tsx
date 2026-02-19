/**
 * Perfil – Información personal completa, edición, verificación KYC, biométricos.
 * Replica la funcionalidad de la web: getProfile, updateProfile, editar campos.
 * Ubicación: apps/mobile/src/screens/ProfileScreen.tsx
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, type Profile, type ProfileUpdate } from '../lib/api';
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { getBiometricsEnabled } from '../lib/secureStorage';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return value;
  }
}

function KycBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En revisión',
    APROBADO: 'Verificado',
    RECHAZADO: 'Rechazado',
  };
  const label = labels[status] ?? status;
  const bgColor = status === 'APROBADO' ? '#22c55e' : status === 'RECHAZADO' ? '#ef4444' : '#eab308';
  return (
    <View style={[styles.kycBadge, { backgroundColor: bgColor + '40', borderColor: bgColor }]}>
      <Text style={styles.kycBadgeText}>{label}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const { fetchUser, enableBiometrics, disableBiometrics, biometricAvailability } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [biometricsOn, setBiometricsOn] = useState<boolean | null>(null);
  const [pickerModal, setPickerModal] = useState<'province' | 'city' | null>(null);
  const [form, setForm] = useState<ProfileUpdate>({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        city: data.city ?? '',
        province: data.province ?? '',
        postalCode: data.postalCode ?? '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    getBiometricsEnabled().then(setBiometricsOn);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        city: form.city?.trim() || undefined,
        province: form.province || undefined,
        postalCode: form.postalCode?.trim() || undefined,
      });
      await loadProfile();
      await fetchUser();
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        province: profile.province ?? '',
        postalCode: profile.postalCode ?? '',
      });
    }
    setEditing(false);
    setError('');
  };

  const handleToggleBiometrics = async () => {
    if (!biometricAvailability?.available) return;
    if (biometricsOn) {
      const ok = await disableBiometrics();
      if (ok) setBiometricsOn(false);
      return;
    }
    const ok = await enableBiometrics();
    if (ok) setBiometricsOn(true);
  };

  const cities = form.province ? (CIUDADES_POR_PROVINCIA[form.province] ?? []) : [];
  const labelBiometric = biometricAvailability?.type === 'FaceID' ? 'Face ID' : biometricAvailability?.type === 'TouchID' ? 'Touch ID' : 'Huella dactilar';

  if (loading) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AuthBackground>
    );
  }

  if (!profile) {
    return (
      <AuthBackground>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={[styles.card, glassCard]}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.subtitle}>No se pudo cargar el perfil.</Text>
        </View>
      </ScrollView>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.card, glassCard]}>
        <View style={styles.perfilHeader}>
          <Text style={styles.title}>Información personal</Text>
          {!editing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>✏️ Editar</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!editing ? (
          <View style={styles.perfilView}>
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="Nombre" value={profile.firstName || '—'} />
            <ProfileField label="Apellido" value={profile.lastName || '—'} />
            <ProfileField label="Usuario" value={profile.username || '—'} />
            <ProfileField label="Teléfono" value={profile.phone || '—'} />
            <ProfileField label="Ciudad" value={profile.city || '—'} />
            <ProfileField
              label="Provincia"
              value={profile.province ? (PROVINCIAS_ARGENTINA.find((p) => p.id === profile!.province)?.nombre ?? profile.province) : '—'}
            />
            <ProfileField label="Código postal" value={profile.postalCode || '—'} />
            {profile.dateOfBirth ? <ProfileField label="Fecha de nacimiento" value={formatDate(profile.dateOfBirth)} /> : null}
            <ProfileField label="Número ID" value={profile.numeroId || '—'} />
            <View style={styles.kycRow}>
              <Text style={styles.label}>Verificación KYC</Text>
              <KycBadge status={profile.kyc?.status ?? 'PENDIENTE'} />
              {profile.kyc?.rejectionReason ? <Text style={styles.reason}>{profile.kyc.rejectionReason}</Text> : null}
            </View>
            {profile.reputationScore != null ? <ProfileField label="Reputación" value={`${profile.reputationScore} pts`} /> : null}
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={profile.email} editable={false} />
            <Text style={styles.hint}>El email no se puede modificar desde aquí.</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={colors.textMuted}
              value={form.firstName}
              onChangeText={(t) => setForm((f) => ({ ...f, firstName: t }))}
            />
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor={colors.textMuted}
              value={form.lastName}
              onChangeText={(t) => setForm((f) => ({ ...f, lastName: t }))}
            />
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="11 1234 5678"
              placeholderTextColor={colors.textMuted}
              value={form.phone}
              onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>Provincia</Text>
            <TouchableOpacity style={styles.input} onPress={() => setPickerModal('province')}>
              <Text style={styles.pickerValue}>
                {form.province ? PROVINCIAS_ARGENTINA.find((p) => p.id === form.province)?.nombre ?? form.province : 'Seleccionar provincia'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.label}>Ciudad</Text>
            <TouchableOpacity
              style={[styles.input, !form.province && styles.inputDisabled]}
              onPress={() => form.province && setPickerModal('city')}
              disabled={!form.province}
            >
              <Text style={styles.pickerValue}>{form.city || (form.province ? 'Seleccionar ciudad' : 'Primero elegí una provincia')}</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Código postal</Text>
            <TextInput
              style={styles.input}
              placeholder="Código postal"
              placeholderTextColor={colors.textMuted}
              value={form.postalCode}
              onChangeText={(t) => setForm((f) => ({ ...f, postalCode: t }))}
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel} disabled={saving}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.primaryButtonText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
        </View>

        {biometricAvailability?.available && (
          <View style={[styles.card, glassCard]}>
          <Text style={styles.label}>Inicio de sesión con {labelBiometric}</Text>
          <Text style={styles.subvalue}>
            {biometricsOn ? 'Activado. La próxima vez que abras la app podés usar tu biometría.' : 'Desactivado. Activá para entrar más rápido.'}
          </Text>
          <TouchableOpacity style={styles.biometricBtn} onPress={handleToggleBiometrics}>
            <Text style={styles.biometricBtnText}>{biometricsOn ? 'Desactivar' : `Activar ${labelBiometric}`}</Text>
          </TouchableOpacity>
        </View>
        )}

        <Text style={styles.subtitle}>Podés verificar tu identidad en Verificación KYC desde Inicio.</Text>

        <Modal visible={pickerModal !== null} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerModal(null)}>
          <View style={styles.pickerModal}>
            <ScrollView style={styles.pickerList}>
              {pickerModal === 'province' &&
                PROVINCIAS_ARGENTINA.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setForm((f) => ({ ...f, province: p.id, city: '' }));
                      setPickerModal(null);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{p.nombre}</Text>
                  </TouchableOpacity>
                ))}
              {pickerModal === 'city' &&
                cities.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.pickerItem}
                    onPress={() => {
                      setForm((f) => ({ ...f, city: c }));
                      setPickerModal(null);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
    </AuthBackground>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  perfilHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 20, fontWeight: '700', color: colors.white },
  editBtn: { paddingVertical: 6, paddingHorizontal: spacing.sm },
  editBtnText: { color: colors.primaryLight, fontWeight: '600', fontSize: 14 },
  perfilView: {},
  field: { marginBottom: spacing.md },
  label: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  value: { fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  kycRow: { marginTop: spacing.sm, marginBottom: spacing.md },
  kycBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  kycBadgeText: { fontSize: 13, fontWeight: '600', color: colors.white },
  reason: { marginTop: 4, fontSize: 13, color: colors.textMuted },
  form: {},
  input: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 20,
    padding: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputDisabled: { opacity: 0.7 },
  pickerValue: { color: colors.text },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  formActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  primaryButton: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center' },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  secondaryButton: { flex: 1, paddingVertical: 14, borderRadius: radius, alignItems: 'center', borderWidth: 2, borderColor: colors.primaryLight },
  secondaryButtonText: { color: colors.primaryLight, fontWeight: '600', fontSize: 16 },
  disabled: { opacity: 0.7 },
  subvalue: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  biometricBtn: {
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius,
  },
  biometricBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  subtitle: { fontSize: 14, color: colors.textMuted },
  error: { color: '#ef4444', marginBottom: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModal: { backgroundColor: 'rgba(30, 58, 138, 0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: 300, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)' },
  pickerList: { maxHeight: 280 },
  pickerItem: { paddingVertical: 16, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerItemText: { color: colors.text, fontSize: 16 },
});
