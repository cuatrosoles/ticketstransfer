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
  Image,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useProfileImage } from '../context/ProfileImageContext';
import { getProfile, updateProfile, uploadProfileImage, requestPhoneVerification, confirmPhoneVerification, ensureImageUrl, type Profile, type ProfileUpdate } from '../lib/api';
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { getBiometricsEnabled } from '../lib/secureStorage';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
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
  const navigation = useNavigation();
  const { fetchUser, enableBiometrics, disableBiometrics, biometricAvailability } = useAuth();
  const { refreshProfileImage } = useProfileImage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [biometricsOn, setBiometricsOn] = useState<boolean | null>(null);
  const [pickerModal, setPickerModal] = useState<'province' | 'city' | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [phoneVerifyModal, setPhoneVerifyModal] = useState(false);
  const [phoneVerifyStep, setPhoneVerifyStep] = useState<'phone' | 'code'>('phone');
  const [phoneVerifyPhone, setPhoneVerifyPhone] = useState('');
  const [phoneVerifyCode, setPhoneVerifyCode] = useState('');
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  const [phoneVerifyError, setPhoneVerifyError] = useState('');
  const [form, setForm] = useState<ProfileUpdate & { username: string }>({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    province: '',
    postalCode: '',
    address: '',
    cbuCvu: '',
    bankName: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        username: data.username ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        city: data.city ?? '',
        province: data.province ?? '',
        postalCode: data.postalCode ?? '',
        address: data.address ?? '',
        cbuCvu: data.cbuCvu ?? '',
        bankName: data.bankName ?? '',
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
      const payload: ProfileUpdate = {
        username: form.username.trim(),
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        city: form.city?.trim() || undefined,
        province: form.province || undefined,
        postalCode: form.postalCode?.trim() || undefined,
        address: form.address?.trim() || undefined,
        cbuCvu: form.cbuCvu?.replace(/\D/g, '').slice(0, 22) || undefined,
        bankName: form.bankName?.trim() || undefined,
      };
      await updateProfile(payload);
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
        username: profile.username ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        province: profile.province ?? '',
        postalCode: profile.postalCode ?? '',
        address: profile.address ?? '',
        cbuCvu: profile.cbuCvu ?? '',
        bankName: profile.bankName ?? '',
      });
    }
    setEditing(false);
    setError('');
  };

  const uploadAvatarFromAsset = async (asset: { uri?: string; fileName?: string; type?: string }) => {
    if (!asset.uri) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      const uri = Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', '');
      formData.append('avatar', {
        uri,
        name: asset.fileName || `avatar_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      } as unknown as Blob);
      await uploadProfileImage(formData);
      await loadProfile();
      await refreshProfileImage();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir la foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Permiso de cámara',
        message: 'La app necesita acceso a la cámara para tomar tu foto de perfil.',
        buttonPositive: 'Aceptar',
        buttonNegative: 'Cancelar',
      });
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Se necesita permiso de cámara para tomar fotos.');
        return;
      }
    }
    setTimeout(() => {
      launchCamera(
        { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
        (res) => {
          if (res.errorCode) {
            setError(res.errorMessage || 'Error al abrir la cámara');
            return;
          }
          if (res.didCancel || !res.assets?.[0]) return;
          uploadAvatarFromAsset(res.assets[0]);
        }
      );
    }, 300);
  };

  const handleChangeAvatar = () => {
    Alert.alert('Cambiar foto de perfil', '¿De dónde querés la foto?', [
      { text: 'Tomar foto', onPress: openCamera },
      {
        text: 'Elegir de galería',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (res.didCancel || !res.assets?.[0]) return;
            uploadAvatarFromAsset(res.assets[0]);
          }),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
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
        <ScreenHeader
          title="Mi perfil"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <View style={[styles.card, glassCard]}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleChangeAvatar}
            disabled={uploadingAvatar}
            style={styles.avatarTouch}
          >
            {profile.profileImageUrl ? (
              <Image source={{ uri: ensureImageUrl(profile.profileImageUrl)! }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>📷</Text>
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChangeAvatar}
            disabled={uploadingAvatar}
            style={styles.changePhotoBtn}
          >
            <Text style={styles.changePhotoBtnText}>
              {profile.profileImageUrl ? 'Cambiar foto' : 'Subir foto de perfil'}
            </Text>
          </TouchableOpacity>
        </View>
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
            <View style={styles.phoneSection}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.phoneValueRow}>
                <Text style={styles.value}>{profile.phone || '—'}</Text>
                {profile.phone ? (
                  <View style={styles.phoneVerifyBadge}>
                    {profile.phoneVerified ? (
                      <Text style={styles.phoneVerified}>✔ Verificado</Text>
                    ) : (
                      <>
                        <Text style={styles.phoneUnverified}>Sin verificar</Text>
                        <TouchableOpacity style={styles.verifyPhoneBtn} onPress={() => { setPhoneVerifyPhone(profile.phone || ''); setPhoneVerifyStep('phone'); setPhoneVerifyModal(true); setPhoneVerifyError(''); }}>
                          <Text style={styles.verifyPhoneBtnText}>VERIFICAR TELEFONO</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity style={styles.verifyPhoneBtn} onPress={() => setEditing(true)}>
                    <Text style={styles.verifyPhoneBtnText}>Agregar teléfono</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <ProfileField label="CBU/CVU (para recibir pagos)" value={profile.cbuCvu ? `****${profile.cbuCvu.slice(-4)}` : '—'} />
            <ProfileField label="Banco" value={profile.bankName || '—'} />
            <ProfileField label="Domicilio" value={profile.address || '—'} />
            <ProfileField label="Ciudad" value={profile.city || '—'} />
            <ProfileField
              label="Provincia"
              value={profile.province ? (PROVINCIAS_ARGENTINA.find((p) => p.id === profile!.province)?.nombre ?? profile.province) : '—'}
            />
            <ProfileField label="Código postal" value={profile.postalCode || '—'} />
            {profile.dateOfBirth ? <ProfileField label="Fecha de nacimiento" value={formatDate(profile.dateOfBirth)} /> : null}
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
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor={colors.textMuted}
              value={form.username}
              onChangeText={(t) => setForm((f) => ({ ...f, username: t }))}
              autoCapitalize="none"
              autoCorrect={false}
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
            <Text style={styles.label}>Domicilio (calle y número)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. Corrientes 1234"
              placeholderTextColor={colors.textMuted}
              value={form.address}
              onChangeText={(t) => setForm((f) => ({ ...f, address: t }))}
            />
            <Text style={styles.label}>Código postal</Text>
            <TextInput
              style={styles.input}
              placeholder="Código postal"
              placeholderTextColor={colors.textMuted}
              value={form.postalCode}
              onChangeText={(t) => setForm((f) => ({ ...f, postalCode: t }))}
            />
            <Text style={styles.label}>CBU/CVU (22 dígitos, para recibir pagos)</Text>
            <TextInput
              style={styles.input}
              placeholder="0000000000000000000000"
              placeholderTextColor={colors.textMuted}
              value={form.cbuCvu}
              onChangeText={(t) => setForm((f) => ({ ...f, cbuCvu: t.replace(/\D/g, '').slice(0, 22) }))}
              keyboardType="numeric"
              maxLength={22}
            />
            <Text style={styles.label}>Nombre del banco (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Banco Nación"
              placeholderTextColor={colors.textMuted}
              value={form.bankName}
              onChangeText={(t) => setForm((f) => ({ ...f, bankName: t }))}
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

        <Modal visible={phoneVerifyModal} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setPhoneVerifyModal(false)}>
            <View style={styles.phoneVerifyModal} onStartShouldSetResponder={() => true}>
              <Text style={styles.phoneVerifyTitle}>Verificar teléfono</Text>
              {phoneVerifyStep === 'phone' ? (
                <>
                  <Text style={styles.label}>Número de teléfono</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+549 11 1234 5678"
                    placeholderTextColor={colors.textMuted}
                    value={phoneVerifyPhone}
                    onChangeText={(t) => { setPhoneVerifyPhone(t); setPhoneVerifyError(''); }}
                    keyboardType="phone-pad"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Código de 6 dígitos</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    value={phoneVerifyCode}
                    onChangeText={(t) => { setPhoneVerifyCode(t.replace(/\D/g, '').slice(0, 6)); setPhoneVerifyError(''); }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </>
              )}
              {phoneVerifyError ? <Text style={styles.error}>{phoneVerifyError}</Text> : null}
              <View style={styles.phoneVerifyActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setPhoneVerifyModal(false)}>
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, phoneVerifyLoading && styles.disabled]}
                  onPress={async () => {
                    setPhoneVerifyError('');
                    setPhoneVerifyLoading(true);
                    try {
                      if (phoneVerifyStep === 'phone') {
                        await requestPhoneVerification(phoneVerifyPhone);
                        setPhoneVerifyStep('code');
                        setPhoneVerifyCode('');
                      } else {
                        await confirmPhoneVerification(phoneVerifyCode);
                        setPhoneVerifyModal(false);
                        await loadProfile();
                      }
                    } catch (e) {
                      setPhoneVerifyError(e instanceof Error ? e.message : 'Error');
                    } finally {
                      setPhoneVerifyLoading(false);
                    }
                  }}
                  disabled={phoneVerifyLoading || (phoneVerifyStep === 'phone' ? !phoneVerifyPhone.trim() : phoneVerifyCode.length !== 6)}
                >
                  {phoneVerifyLoading ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.primaryButtonText}>{phoneVerifyStep === 'phone' ? 'Enviar código' : 'Confirmar'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>

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
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatarTouch: { position: 'relative' },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: { fontSize: 32 },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoBtn: { marginTop: spacing.sm },
  changePhotoBtnText: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
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
  phoneSection: { marginBottom: spacing.md },
  phoneValueRow: { flexDirection: 'column', gap: 4 },
  phoneVerifyBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  phoneVerified: { fontSize: 14, color: '#22c55e', fontWeight: '600' },
  phoneUnverified: { fontSize: 14, color: '#ef4444' },
  verifyPhoneBtn: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: colors.primary, borderRadius: 8 },
  verifyPhoneBtnText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  phoneVerifyModal: { backgroundColor: 'rgba(30, 58, 138, 0.98)', margin: 24, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)' },
  phoneVerifyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  phoneVerifyActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
