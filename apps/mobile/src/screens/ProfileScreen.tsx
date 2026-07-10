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
  Switch,
} from 'react-native';
import { launchCameraSafe, launchImageLibrarySafe } from '../lib/imagePickerSafe';
import { biometricLockBypassPickerOpenRef } from '../lib/biometricLockBypass';
import { useNavigation } from '@react-navigation/native';
import type { TabCompositeNavigationProp } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useProfileImage } from '../context/ProfileImageContext';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  requestPhoneVerification,
  confirmPhoneVerification,
  ensureImageUrl,
  getUserPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
  type Profile,
  type ProfileUpdate,
  type UserPreferences,
  type NotificationPreferences,
} from '../lib/api';
import { EventPreferencesEditor } from '../components/EventPreferencesEditor';
import { LocationCaptureButton } from '../components/LocationCaptureButton';
import {
  addressFieldsFromReverseGeocode,
  provinceDisplayLabel,
  reverseGeocodeFromApi,
} from '../lib/addressGeocode';
import { formatCoordinates, NOTIFICATION_PREFERENCE_KEYS, NOTIFICATION_PREFERENCE_LABELS, type NotificationPreferenceKey } from '@tickets-transfer/shared';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { useBranding } from '../context/BrandingContext';
import { colors, spacing, radius, glassCard, tabScreenContent } from '../theme';
import { BIOMETRIC_LOCK_DELAY_OPTIONS } from '../lib/biometricLockDelay';

type ProfileFormState = ProfileUpdate & {
  username: string;
  direccion: string;
  numero: string;
  piso: string;
  depto: string;
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const local = new Date(y, m - 1, d);
    if (!Number.isNaN(local.getTime())) {
      return local.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }
  const raw = value as unknown as { seconds?: number; _seconds?: number };
  if (typeof raw.seconds === 'number' || typeof raw._seconds === 'number') {
    const sec = raw.seconds ?? raw._seconds!;
    const d = new Date(sec * 1000);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  const navigation = useNavigation<TabCompositeNavigationProp<'Profile'>>();
  const brand = useBranding();
  const {
    fetchUser,
    enableBiometrics,
    disableBiometrics,
    biometricAvailability,
    biometricEnabled,
    biometricLockDelaySec,
    setBiometricLockDelaySec,
  } = useAuth();
  const { refreshProfileImage } = useProfileImage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [phoneVerifyModal, setPhoneVerifyModal] = useState(false);
  const [phoneVerifyStep, setPhoneVerifyStep] = useState<'phone' | 'code'>('phone');
  const [phoneVerifyPhone, setPhoneVerifyPhone] = useState('');
  const [phoneVerifyCode, setPhoneVerifyCode] = useState('');
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  const [phoneVerifyError, setPhoneVerifyError] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [notificationPrefsBusy, setNotificationPrefsBusy] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    province: '',
    postalCode: '',
    address: '',
    direccion: '',
    numero: '',
    piso: '',
    depto: '',
    cbuCvu: '',
    bankAlias: '',
    bankName: '',
  });

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, prefs, notifPrefs] = await Promise.all([
        getProfile(),
        getUserPreferences().catch(() => null),
        getNotificationPreferences().catch(() => null),
      ]);
      setProfile(data);
      setPreferences(prefs ?? data.preferences ?? null);
      setNotificationPrefs(notifPrefs ?? data.notificationPreferences ?? null);
      setLatitude(data.latitude ?? null);
      setLongitude(data.longitude ?? null);
      setLocationAutoFilled(false);
      setForm({
        username: data.username ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        city: data.city ?? '',
        province: data.province ?? '',
        postalCode: data.postalCode ?? '',
        address: data.address ?? '',
        direccion: data.address ?? '',
        numero: '',
        piso: '',
        depto: '',
        cbuCvu: data.cbuCvu ?? '',
        bankAlias: data.bankAlias ?? '',
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

  const buildAddressLine = () => {
    const parts = [
      form.direccion?.trim(),
      form.numero?.trim(),
      form.piso?.trim() ? `Piso ${form.piso.trim()}` : '',
      form.depto?.trim() ? `Depto ${form.depto.trim()}` : '',
    ].filter(Boolean);
    return parts.join(' ').trim();
  };

  const clearGpsLocation = () => {
    setLatitude(null);
    setLongitude(null);
    if (locationAutoFilled) {
      setForm((f) => ({
        ...f,
        province: '',
        city: '',
        postalCode: '',
        direccion: '',
        numero: '',
        piso: '',
        depto: '',
        address: '',
      }));
      setLocationAutoFilled(false);
    }
  };

  const applyGpsLocation = async (coords: { latitude: number; longitude: number }) => {
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
    setLocationBusy(true);
    setError('');
    try {
      const geo = await reverseGeocodeFromApi(coords.latitude, coords.longitude);
      const fields = addressFieldsFromReverseGeocode(geo);
      const line = [fields.direccion, fields.numero].filter(Boolean).join(' ').trim();
      setForm((f) => ({
        ...f,
        province: fields.province,
        city: fields.city,
        postalCode: fields.postalCode,
        direccion: fields.direccion,
        numero: fields.numero,
        address: line,
      }));
      setLocationAutoFilled(true);
    } catch {
      setLocationAutoFilled(false);
      setError(
        'Ubicación GPS guardada. Completá provincia y ciudad manualmente si los campos quedaron vacíos.'
      );
    } finally {
      setLocationBusy(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const addressLine = buildAddressLine();
      const payload: ProfileUpdate = {
        username: form.username.trim(),
        firstName: form.firstName?.trim() || undefined,
        lastName: form.lastName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        city: form.city?.trim() || undefined,
        province: form.province?.trim() || undefined,
        postalCode: form.postalCode?.trim() || undefined,
        address: addressLine || undefined,
        ...(latitude != null && longitude != null
          ? {
              latitude,
              longitude,
              locationSource: (locationAutoFilled ? 'gps' : 'manual') as ProfileUpdate['locationSource'],
            }
          : profile?.latitude != null || profile?.longitude != null
            ? { latitude: null, longitude: null, locationSource: null }
            : {}),
        cbuCvu: form.cbuCvu?.replace(/\D/g, '').slice(0, 22) || undefined,
        bankAlias: form.bankAlias?.trim() || undefined,
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
      setLatitude(profile.latitude ?? null);
      setLongitude(profile.longitude ?? null);
      setLocationAutoFilled(false);
      setForm({
        username: profile.username ?? '',
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        city: profile.city ?? '',
        province: profile.province ?? '',
        postalCode: profile.postalCode ?? '',
        address: profile.address ?? '',
        direccion: profile.address ?? '',
        numero: '',
        piso: '',
        depto: '',
        cbuCvu: profile.cbuCvu ?? '',
        bankAlias: profile.bankAlias ?? '',
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
    biometricLockBypassPickerOpenRef.current = true;
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Permiso de cámara',
        message: 'La app necesita acceso a la cámara para tomar tu foto de perfil.',
        buttonPositive: 'Aceptar',
        buttonNegative: 'Cancelar',
      });
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        biometricLockBypassPickerOpenRef.current = false;
        setError('Se necesita permiso de cámara para tomar fotos.');
        return;
      }
    }
    setTimeout(() => {
      launchCameraSafe({ mediaType: 'photo', quality: 0.8, saveToPhotos: false }, (res) => {
        if (res.errorCode) {
          setError(res.errorMessage || 'Error al abrir la cámara');
          return;
        }
        if (res.didCancel || !res.assets?.[0]) return;
        void uploadAvatarFromAsset(res.assets[0]);
      });
    }, 300);
  };

  const handleChangeAvatar = () => {
    Alert.alert('Cambiar foto de perfil', '¿De dónde querés la foto?', [
      { text: 'Tomar foto', onPress: openCamera },
      {
        text: 'Elegir de galería',
        onPress: () =>
          launchImageLibrarySafe({ mediaType: 'photo', quality: 0.8 }, (res) => {
            if (res.errorCode) {
              setError(res.errorMessage || 'No se pudo abrir la galería');
              return;
            }
            if (res.didCancel || !res.assets?.[0]) return;
            void uploadAvatarFromAsset(res.assets[0]);
          }),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleToggleBiometrics = async () => {
    if (!biometricAvailability?.available) return;
    if (biometricEnabled) {
      await disableBiometrics();
      return;
    }
    await enableBiometrics();
  };

  const toggleNotificationPref = async (key: NotificationPreferenceKey, value: boolean) => {
    if (!notificationPrefs || notificationPrefsBusy) return;
    const prev = notificationPrefs;
    const next = { ...prev, [key]: value };
    setNotificationPrefs(next);
    setNotificationPrefsBusy(true);
    setError('');
    try {
      const saved = await updateNotificationPreferences({ [key]: value });
      setNotificationPrefs(saved);
    } catch (e) {
      setNotificationPrefs(prev);
      setError(e instanceof Error ? e.message : 'No se pudo guardar la preferencia de notificaciones');
    } finally {
      setNotificationPrefsBusy(false);
    }
  };

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
        <ScreenHeader title="Mi perfil" rightSlot={<UserMenuButton />} logoUri={brand.logoUrl} />
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

        {preferences ? (
          <View style={[styles.prefsCard, glassCard]}>
            <EventPreferencesEditor
              preferences={preferences}
              onUpdated={(p) => setPreferences(p)}
            />
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.kycQuickCard, glassCard]}
          onPress={() => navigation.navigate('Kyc')}
          activeOpacity={0.9}
        >
          <Text style={styles.kycQuickTitle}>Verificación KYC</Text>
          <Text style={styles.kycQuickSub}>Verificar identidad con DNI y selfie</Text>
        </TouchableOpacity>

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
            <ProfileField label="Alias bancario" value={profile.bankAlias || '—'} />
            <ProfileField label="Banco" value={profile.bankName || '—'} />
            <ProfileField label="Ubicación (eventos cercanos)" value={
              profile.latitude != null && profile.longitude != null
                ? `${formatCoordinates(profile.latitude, profile.longitude)}${profile.locationSource ? ` (${profile.locationSource})` : ''}`
                : 'Sin coordenadas — configurá tu ubicación al editar'
            } />
            <ProfileField label="Provincia" value={provinceDisplayLabel(profile.province)} />
            <ProfileField label="Ciudad" value={profile.city || '—'} />
            <ProfileField label="Código postal" value={profile.postalCode || '—'} />
            <ProfileField label="Domicilio" value={profile.address || '—'} />
            <ProfileField
              label="Fecha de nacimiento"
              value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'}
            />
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
            <Text style={styles.label}>Tu ubicación</Text>
            <Text style={styles.hint}>
              Detectamos tu ubicación para el filtro de eventos cercanos. Si preferís no usar GPS, completá la dirección manualmente.
            </Text>
            <LocationCaptureButton
              latitude={latitude}
              longitude={longitude}
              loading={locationBusy}
              onCapture={applyGpsLocation}
              onClear={clearGpsLocation}
              emptyHint={null}
              capturedHint={
                latitude != null && longitude != null
                  ? 'Dirección completada desde GPS. Revisá y ajustá los campos si hace falta.'
                  : null
              }
            />
            <Text style={styles.label}>Provincia</Text>
            <TextInput
              style={styles.input}
              placeholder="Provincia"
              placeholderTextColor={colors.textMuted}
              value={form.province}
              onChangeText={(t) => {
                setLocationAutoFilled(false);
                setForm((f) => ({ ...f, province: t }));
              }}
            />
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ciudad"
              placeholderTextColor={colors.textMuted}
              value={form.city}
              onChangeText={(t) => {
                setLocationAutoFilled(false);
                setForm((f) => ({ ...f, city: t }));
              }}
            />
            <Text style={styles.label}>Código postal</Text>
            <TextInput
              style={styles.input}
              placeholder="Código postal"
              placeholderTextColor={colors.textMuted}
              value={form.postalCode}
              onChangeText={(t) => {
                setLocationAutoFilled(false);
                setForm((f) => ({ ...f, postalCode: t }));
              }}
            />
            <Text style={styles.label}>Dirección (calle)</Text>
            <TextInput
              style={styles.input}
              placeholder="Calle"
              placeholderTextColor={colors.textMuted}
              value={form.direccion}
              onChangeText={(t) => {
                setLocationAutoFilled(false);
                setForm((f) => ({ ...f, direccion: t }));
              }}
            />
            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              placeholder="Número"
              placeholderTextColor={colors.textMuted}
              value={form.numero}
              onChangeText={(t) => {
                setLocationAutoFilled(false);
                setForm((f) => ({ ...f, numero: t }));
              }}
            />
            <Text style={styles.label}>Piso</Text>
            <TextInput
              style={styles.input}
              placeholder="Piso"
              placeholderTextColor={colors.textMuted}
              value={form.piso}
              onChangeText={(t) => setForm((f) => ({ ...f, piso: t }))}
            />
            <Text style={styles.label}>Depto</Text>
            <TextInput
              style={styles.input}
              placeholder="Depto"
              placeholderTextColor={colors.textMuted}
              value={form.depto}
              onChangeText={(t) => setForm((f) => ({ ...f, depto: t }))}
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
            <Text style={styles.label}>Alias bancario</Text>
            <TextInput
              style={styles.input}
              placeholder="mi.alias.mp"
              placeholderTextColor={colors.textMuted}
              value={form.bankAlias}
              onChangeText={(t) => setForm((f) => ({ ...f, bankAlias: t }))}
              autoCapitalize="none"
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

        {notificationPrefs ? (
          <View style={[styles.card, glassCard]}>
            <Text style={styles.sectionTitle}>Notificaciones push</Text>
            <Text style={styles.subvalue}>
              Elegí qué avisos querés recibir en el teléfono. Las ventas y reembolsos conviene dejarlos activos.
            </Text>
            {NOTIFICATION_PREFERENCE_KEYS.map((key) => {
              const meta = NOTIFICATION_PREFERENCE_LABELS[key];
              return (
                <View key={key} style={styles.notifRow}>
                  <View style={styles.notifTextWrap}>
                    <Text style={styles.notifTitle}>{meta.title}</Text>
                    <Text style={styles.notifDescription}>{meta.description}</Text>
                  </View>
                  <Switch
                    value={notificationPrefs[key]}
                    onValueChange={(value) => void toggleNotificationPref(key, value)}
                    disabled={notificationPrefsBusy}
                    trackColor={{ false: '#334155', true: '#3b82f6' }}
                    thumbColor="#f8fafc"
                  />
                </View>
              );
            })}
          </View>
        ) : null}

        {biometricAvailability?.available && (
          <View style={[styles.card, glassCard]}>
          <Text style={styles.label}>Inicio de sesión con {labelBiometric}</Text>
          <Text style={styles.subvalue}>
            {biometricEnabled
              ? 'Activado. Se solicitará biometría al abrir la app o al volver tras el tiempo configurado.'
              : 'Desactivado. Activá para proteger el acceso a la app.'}
          </Text>
          <TouchableOpacity style={styles.biometricBtn} onPress={handleToggleBiometrics}>
            <Text style={styles.biometricBtnText}>{biometricEnabled ? 'Desactivar' : `Activar ${labelBiometric}`}</Text>
          </TouchableOpacity>

          {biometricEnabled && (
            <View style={styles.lockDelaySection}>
              <Text style={styles.lockDelayLabel}>Bloquear después de</Text>
              <Text style={styles.lockDelayHint}>
                Si volvés antes de este tiempo, no se pedirá biometría. Al abrir la app desde cero siempre se bloquea.
              </Text>
              <View style={styles.lockDelayChips}>
                {BIOMETRIC_LOCK_DELAY_OPTIONS.map((opt) => {
                  const active = biometricLockDelaySec === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.lockDelayChip, active && styles.lockDelayChipActive]}
                      onPress={() => void setBiometricLockDelaySec(opt.value)}
                    >
                      <Text style={[styles.lockDelayChipText, active && styles.lockDelayChipTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
        )}

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
  content: tabScreenContent,
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.15)',
  },
  notifTextWrap: { flex: 1 },
  notifTitle: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  notifDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  biometricBtn: {
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius,
  },
  biometricBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  lockDelaySection: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(96, 165, 250, 0.2)' },
  lockDelayLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  lockDelayHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 17 },
  lockDelayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lockDelayChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.35)',
  },
  lockDelayChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(59, 130, 246, 0.25)' },
  lockDelayChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  lockDelayChipTextActive: { color: colors.text, fontWeight: '600' },
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
  prefsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
  },
  kycQuickCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
  },
  kycQuickTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'Cooper-Black',
  },
  kycQuickSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
