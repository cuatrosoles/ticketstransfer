/**
 * Registro – 3 pasos: paso 1 (email, repetir email, contraseña, términos);
 * paso 2 (verificación de email con código);
 * paso 3 (nombre, apellido, tipo doc, documento, sexo, fecha nacimiento, administrador, país).
 * Tras registro navega a Kyc (igual que web).
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerificationCode, verifyEmailCode, checkUsername } from '../lib/api';
import { registerSchema, SEXO_OPCIONES, TIPO_DOCUMENTO, PREFIJO_TELEFONO_DEFAULT } from '../lib/registerConstants';
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { LocationCaptureButton } from '../components/LocationCaptureButton';
import { addressFieldsFromReverseGeocode, reverseGeocodeFromApi } from '../lib/addressGeocode';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { GradientButton } from '../components/GradientButton';
import { useBranding } from '../context/BrandingContext';
import { colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_HINT = 'Mínimo 8 caracteres, con mayúsculas, minúsculas y números.';
const RESEND_COOLDOWN_SEC = 30;

function validateStep1(
  email: string,
  repeatEmail: string,
  password: string,
  confirmPassword: string,
  agreeTerms: boolean
): string | null {
  if (!email.trim()) return 'Email requerido';
  if (!EMAIL_REGEX.test(email)) return 'Email inválido';
  if (email !== repeatEmail) return 'Los emails no coinciden';
  if (password.length < PASSWORD_MIN) return 'Mínimo 8 caracteres';
  if (!/[a-z]/.test(password)) return 'Al menos una minúscula';
  if (!/[A-Z]/.test(password)) return 'Al menos una mayúscula';
  if (!/[0-9]/.test(password)) return 'Al menos un número';
  if (password !== confirmPassword) return 'Las contraseñas no coinciden';
  if (!agreeTerms) return 'Debes aceptar los términos y condiciones';
  return null;
}

export function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [repeatEmail, setRepeatEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [sexo, setSexo] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [country, setCountry] = useState('AR');
  const [phoneAreaCode, setPhoneAreaCode] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numero, setNumero] = useState('');
  const [piso, setPiso] = useState('');
  const [depto, setDepto] = useState('');
  const [cbuCvu, setCbuCvu] = useState('');
  const [bankAlias, setBankAlias] = useState('');
  const [bankName, setBankName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerModal, setPickerModal] = useState<'province' | 'city' | 'date' | null>(null);
  const [tempDate, setTempDate] = useState({ day: '', month: '', year: '' });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const { register } = useAuth();
  const navigation = useNavigation<Nav>();
  const brand = useBranding();

  const cities = province ? (CIUDADES_POR_PROVINCIA[province] ?? []) : [];
  useEffect(() => {
    if (!province) setCity('');
  }, [province]);

  useEffect(() => {
    if (!username.trim() || username.length < 2) {
      setUsernameStatus('idle');
      setUsernameSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const res = await checkUsername(username.trim());
        setUsernameStatus(res.available ? 'available' : 'taken');
        setUsernameSuggestions(res.suggestions ?? []);
      } catch {
        setUsernameStatus('idle');
        setUsernameSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [username]);

  const step1Valid = !validateStep1(email, repeatEmail, password, confirmPassword, agreeTerms);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SEC);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleNextStep = async () => {
    const err = validateStep1(email, repeatEmail, password, confirmPassword, agreeTerms);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendEmailVerificationCode(email.trim());
      startResendCooldown();
      setStep(2);
      setVerificationCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendEmailVerificationCode(email.trim());
      startResendCooldown();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al reenviar');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    const code = verificationCode.trim();
    if (!code || code.length !== 6) {
      setError('Ingresá el código de 6 dígitos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyEmailCode(email.trim(), code);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  const clearGpsLocation = () => {
    setLatitude(null);
    setLongitude(null);
    if (locationAutoFilled) {
      setProvince('');
      setCity('');
      setPostalCode('');
      setDireccion('');
      setNumero('');
      setPiso('');
      setDepto('');
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
      setProvince(fields.province);
      setCity(fields.city);
      setPostalCode(fields.postalCode);
      setDireccion(fields.direccion);
      setNumero(fields.numero);
      setLocationAutoFilled(true);
    } catch {
      setLocationAutoFilled(false);
      setError(
        'Ubicación GPS obtenida. Completá provincia y ciudad manualmente si los campos quedaron vacíos.'
      );
    } finally {
      setLocationBusy(false);
    }
  };

  const bankOk =
    cbuCvu.replace(/\D/g, '').length === 22 ||
    (bankAlias.trim().length >= 3 && bankAlias.trim().length <= 20);
  const step3RequiredOk =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!username.trim() &&
    bankOk &&
    (username.length < 2 || usernameStatus === 'available');

  const handleRegister = async () => {
    setError('');
    const payload = {
      email: email.trim(),
      repeatEmail: repeatEmail.trim(),
      password,
      confirmPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim() || undefined,
      agreeTerms,
      country: country || undefined,
      tipoDocumento: tipoDocumento || undefined,
      documentNumber: documentNumber.trim() || undefined,
      sexo: (sexo === 'MASC' || sexo === 'FEM' || sexo === 'X' ? sexo : undefined) as 'MASC' | 'FEM' | 'X' | undefined,
      phone: phone.trim() || undefined,
      phoneAreaCode: phoneAreaCode.trim() || undefined,
      phonePrefix: PREFIJO_TELEFONO_DEFAULT,
      dateOfBirth: dateOfBirth || undefined,
      city: city || undefined,
      province: province || undefined,
      postalCode: postalCode || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      locationSource: latitude != null && longitude != null ? 'gps' : undefined,
      direccion: direccion || undefined,
      numero: numero || undefined,
      piso: piso || undefined,
      depto: depto || undefined,
      cbuCvu: cbuCvu.trim() || undefined,
      bankAlias: bankAlias.trim() || undefined,
      bankName: bankName.trim() || undefined,
      isAdmin,
      role: isAdmin ? 'admin' : 'user',
    };
    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const first = result.error.flatten().fieldErrors;
      const msg =
        (first.email && first.email[0]) ||
        (first.repeatEmail && first.repeatEmail[0]) ||
        (first.password && first.password[0]) ||
        (first.confirmPassword && first.confirmPassword[0]) ||
        (first.firstName && first.firstName[0]) ||
        (first.lastName && first.lastName[0]) ||
        (first.username && first.username[0]) ||
        (first.cbuCvu && first.cbuCvu[0]) ||
        (first.agreeTerms && first.agreeTerms[0]) ||
        result.error.message;
      setError(msg ?? 'Revisá los datos');
      return;
    }
    setLoading(true);
    try {
      await register(payload as Record<string, unknown>);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="tu@email.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={(t) => { setEmail(t); setError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.label}>Repetir Email</Text>
      <TextInput
        style={styles.input}
        placeholder="repetir@email.com"
        placeholderTextColor={colors.textMuted}
        value={repeatEmail}
        onChangeText={(t) => { setRepeatEmail(t); setError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={(t) => { setPassword(t); setError(''); }}
        secureTextEntry
      />
      <Text style={styles.fieldHint}>{PASSWORD_HINT}</Text>
      <Text style={styles.label}>Repetir Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
        secureTextEntry
      />
      <Text style={styles.fieldHint}>{PASSWORD_HINT}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('PoliticaPrivacidad')}>
        <Text style={styles.legalLink}>Política de Privacidad y uso de datos</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('TerminosYCondiciones')}>
        <Text style={styles.legalLink}>Términos y condiciones de uso</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkRow} onPress={() => setAgreeTerms(!agreeTerms)}>
        <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]} />
        <Text style={styles.checkLabel}>He leído y acepto los términos y condiciones. Estoy de Acuerdo.</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Completá todos los campos correctamente para continuar.</Text>
      <View style={styles.actions}>
        <GradientButton title="VOLVER" variant="secondary" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <GradientButton
          title={step1Valid ? 'SIGUIENTE >' : 'Completá todos los campos correctamente para continuar.'}
          onPress={handleNextStep}
          disabled={!step1Valid}
          loading={loading}
          style={StyleSheet.flatten([styles.actionBtn, !step1Valid && styles.actionBtnDisabled])}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.verifyTitle}>CONFIRMA TU DIRECCIÓN DE CORREO</Text>
      <Text style={styles.verifySubtitle}>ESCRIBI EL CODIGO QUE TE ENVIAMOS</Text>
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="000000"
        placeholderTextColor={colors.textMuted}
        value={verificationCode}
        onChangeText={(t) => { setVerificationCode(t.replace(/\D/g, '').slice(0, 6)); setError(''); }}
        keyboardType="number-pad"
        maxLength={6}
      />
      <TouchableOpacity
        onPress={handleResendCode}
        disabled={resendCooldown > 0}
        style={styles.resendRow}
      >
        <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
          {resendCooldown > 0
            ? `REENVIAR CODIGO EN ${String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:${String(resendCooldown % 60).padStart(2, '0')}`
            : 'REENVIAR CODIGO'}
        </Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <GradientButton title="VOLVER" variant="secondary" onPress={() => setStep(1)} style={styles.actionBtn} />
        <GradientButton title="CONFIRMAR" onPress={handleConfirmCode} loading={loading} style={styles.actionBtn} />
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.label}>Nombre/s</Text>
      <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textMuted} value={firstName} onChangeText={setFirstName} />
      <Text style={styles.label}>Apellido/s</Text>
      <TextInput style={styles.input} placeholder="Apellido" placeholderTextColor={colors.textMuted} value={lastName} onChangeText={setLastName} />
      <Text style={styles.label}>Usuario</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        placeholderTextColor={colors.textMuted}
        value={username}
        onChangeText={(t) => { setUsername(t); setError(''); }}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {usernameStatus === 'checking' && <Text style={styles.hint}>Verificando...</Text>}
      {usernameStatus === 'taken' && <Text style={styles.usernameError}>Usuario en uso</Text>}
      {usernameStatus === 'taken' && usernameSuggestions.length > 0 && (
        <Text style={styles.hint}>Usuarios recomendados: {usernameSuggestions.join(', ')}</Text>
      )}
      {usernameStatus === 'available' && <Text style={styles.usernameOk}>✓ Usuario disponible</Text>}
      <Text style={styles.label}>Tipo de DNI</Text>
      <View style={styles.pickerRow}>
        {TIPO_DOCUMENTO.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, tipoDocumento === t && styles.chipSelected]}
            onPress={() => setTipoDocumento(t)}
          >
            <Text style={styles.chipText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tipoDocumento ? (
        <>
          <Text style={styles.label}>Texto (según tu documento ID)</Text>
          <TextInput
            style={styles.input}
            placeholder={`Número de ${tipoDocumento}`}
            placeholderTextColor={colors.textMuted}
            value={documentNumber}
            onChangeText={setDocumentNumber}
            keyboardType="numeric"
          />
        </>
      ) : null}
      <Text style={styles.label}>Sexo (según tu documento ID)</Text>
      <View style={styles.sexoRow}>
        {SEXO_OPCIONES.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[styles.sexoBtn, sexo === s.value && styles.sexoBtnSelected]}
            onPress={() => setSexo(s.value)}
          >
            <Text style={styles.sexoBtnText}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Fecha de Nacimiento</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => {
          const parts = dateOfBirth.split('/');
          setTempDate({
            day: parts[0] || '',
            month: parts[1] || '',
            year: parts[2] || '',
          });
          setPickerModal('date');
        }}
      >
        <Text style={styles.pickerValue}>{dateOfBirth || 'dd/mm/aaaa'}</Text>
      </TouchableOpacity>
      {/*
      <View style={styles.adminRow}>
        <Text style={styles.label}>Administrador</Text>
        <Switch value={isAdmin} onValueChange={setIsAdmin} trackColor={{ false: '#334155', true: '#3b82f6' }} thumbColor="#f8fafc" />
      </View>
      */}
      
      <Text style={styles.label}>País</Text>
      <View style={styles.pickerRow}>
        <TouchableOpacity style={[styles.chip, styles.chipSelected]}>
          <Text style={styles.chipText}>Argentina (+549)</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Nro de Teléfono</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.phoneLabel}>Cod Area</Text>
        <TextInput
          style={[styles.input, styles.phoneAreaInput]}
          placeholder="011"
          placeholderTextColor={colors.textMuted}
          value={phoneAreaCode}
          onChangeText={setPhoneAreaCode}
          keyboardType="phone-pad"
        />
        <Text style={styles.phoneLabel}>Num</Text>
        <TextInput
          style={[styles.input, styles.phoneInput]}
          placeholder="1234 5678"
          placeholderTextColor={colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
      <Text style={styles.label}>Tu ubicación</Text>
      <Text style={styles.fieldHint}>
        Detectamos tu ubicación para mostrarte eventos cercanos. Si preferís no usar GPS, completá la dirección manualmente.
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
      <TouchableOpacity style={styles.input} onPress={() => setPickerModal('province')}>
        <Text style={styles.pickerValue}>{province ? PROVINCIAS_ARGENTINA.find((p) => p.id === province)?.nombre ?? province : 'Seleccionar provincia'}</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Ciudad</Text>
      <TouchableOpacity
        style={[styles.input, !province && styles.inputDisabled]}
        onPress={() => province && setPickerModal('city')}
        disabled={!province}
      >
        <Text style={styles.pickerValue}>{city || (province ? 'Seleccionar ciudad' : 'Primero elegí una provincia')}</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Cod. Postal</Text>
      <TextInput style={styles.input} placeholder="Código postal" placeholderTextColor={colors.textMuted} value={postalCode} onChangeText={setPostalCode} />
      <Text style={styles.label}>Dirección (calle)</Text>
      <TextInput style={styles.input} placeholder="Calle" placeholderTextColor={colors.textMuted} value={direccion} onChangeText={setDireccion} />
      <Text style={styles.label}>Número</Text>
      <TextInput style={styles.input} placeholder="Número" placeholderTextColor={colors.textMuted} value={numero} onChangeText={setNumero} />
      <Text style={styles.label}>Piso</Text>
      <TextInput style={styles.input} placeholder="Piso" placeholderTextColor={colors.textMuted} value={piso} onChangeText={setPiso} />
      <Text style={styles.label}>Depto</Text>
      <TextInput style={styles.input} placeholder="Depto" placeholderTextColor={colors.textMuted} value={depto} onChangeText={setDepto} />
      <Text style={styles.sectionTitle}>Datos bancarios para recibir pagos</Text>
      <Text style={styles.fieldHint}>Indicá CBU/CVU (22 dígitos) o alias bancario. Podés editarlos después desde tu perfil.</Text>
      <Text style={styles.label}>CBU/CVU</Text>
      <TextInput
        style={styles.input}
        placeholder="0000000000000000000000"
        placeholderTextColor={colors.textMuted}
        value={cbuCvu}
        onChangeText={(t) => setCbuCvu(t.replace(/\D/g, '').slice(0, 22))}
        keyboardType="number-pad"
      />
      <Text style={styles.label}>Alias bancario</Text>
      <TextInput
        style={styles.input}
        placeholder="mi.alias.mp"
        placeholderTextColor={colors.textMuted}
        value={bankAlias}
        onChangeText={setBankAlias}
        autoCapitalize="none"
      />
      <Text style={styles.label}>Banco (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del banco"
        placeholderTextColor={colors.textMuted}
        value={bankName}
        onChangeText={setBankName}
      />
      <Text style={styles.hint}>Completá los campos obligatorios (Nombre, Apellido, Usuario, datos bancarios y los del paso anterior) para registrar.</Text>
      <View style={styles.actions}>
        <GradientButton title="VOLVER" variant="secondary" onPress={() => setStep(2)} style={styles.actionBtn} />
        <GradientButton
          title="Crear cuenta"
          onPress={handleRegister}
          disabled={!step3RequiredOk}
          loading={loading}
          style={StyleSheet.flatten([styles.actionBtn, !step3RequiredOk && styles.actionBtnDisabled])}
        />
      </View>
    </>
  );

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="CREAR CUENTA" showBack onBack={() => (step === 1 ? navigation.goBack() : setStep(step - 1))} logoUri={brand.logoUrl} />
        <View style={styles.glassWrap}>
          <View style={styles.glassPanel}>
            {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>
      </ScrollView>

      <Modal visible={pickerModal === 'date'} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerModal(null)}>
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <View style={styles.dateModalContent}>
              <Text style={styles.dateModalTitle}>Seleccionar fecha</Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Día"
                  placeholderTextColor={colors.textMuted}
                  value={tempDate.day}
                  onChangeText={(t) => setTempDate((d) => ({ ...d, day: t.replace(/\D/g, '').slice(0, 2) }))}
                  keyboardType="numeric"
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Mes"
                  placeholderTextColor={colors.textMuted}
                  value={tempDate.month}
                  onChangeText={(t) => setTempDate((d) => ({ ...d, month: t.replace(/\D/g, '').slice(0, 2) }))}
                  keyboardType="numeric"
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Año"
                  placeholderTextColor={colors.textMuted}
                  value={tempDate.year}
                  onChangeText={(t) => setTempDate((d) => ({ ...d, year: t.replace(/\D/g, '').slice(0, 4) }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.dateModalActions}>
                <TouchableOpacity style={styles.dateModalBtn} onPress={() => setPickerModal(null)}>
                  <Text style={styles.dateModalBtnText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dateModalBtn}
                  onPress={() => {
                    const { day, month, year } = tempDate;
                    if (day && month && year) {
                      const d = day.padStart(2, '0');
                      const m = month.padStart(2, '0');
                      setDateOfBirth(`${d}/${m}/${year}`);
                    }
                    setPickerModal(null);
                    setTempDate({ day: '', month: '', year: '' });
                  }}
                >
                  <Text style={styles.dateModalBtnText}>ACEPTAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={pickerModal !== null && pickerModal !== 'date'} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerModal(null)}>
          <View style={styles.modalBox}>
            <ScrollView style={styles.modalScroll}>
              {pickerModal === 'province' &&
                PROVINCIAS_ARGENTINA.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setProvince(p.id);
                      setPickerModal(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{p.nombre}</Text>
                  </TouchableOpacity>
                ))}
              {pickerModal === 'city' &&
                cities.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalItem}
                    onPress={() => {
                      setCity(c);
                      setPickerModal(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, flexGrow: 1, alignItems: 'center' },
  glassWrap: { width: '100%', maxWidth: 420 },
  glassPanel: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  fieldHint: { fontSize: 11, color: '#64748b', marginBottom: 4, marginTop: -4, lineHeight: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    marginBottom: 8,
  },
  pickerValue: { color: '#f8fafc' },
  inputDisabled: { opacity: 0.6 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  phoneLabel: { fontSize: 12, color: '#94a3b8', width: 60 },
  phoneAreaInput: { width: 70, marginBottom: 0 },
  phoneInput: { flex: 1, minWidth: 100, marginBottom: 0 },
  usernameError: { color: '#ef4444', fontSize: 13, marginTop: -4, marginBottom: 4 },
  usernameOk: { color: '#22c55e', fontSize: 13, marginTop: -4, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)' },
  chipSelected: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  chipText: { color: '#f8fafc', fontSize: 14 },
  sexoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  sexoBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)', alignItems: 'center' },
  sexoBtnSelected: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  sexoBtnText: { color: '#f8fafc', fontWeight: '600' },
  legalLink: { fontSize: 13, color: '#60a5fa', marginBottom: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: 'rgba(96, 165, 250, 0.3)', borderRadius: 4, marginRight: 8 },
  checkboxChecked: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkLabel: { flex: 1, fontSize: 13, color: '#94a3b8' },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  error: { color: '#ef4444', marginTop: 8, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionBtn: { flex: 1 },
  actionBtnDisabled: { opacity: 0.6 },
  verifyTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', textAlign: 'center', marginBottom: 8 },
  verifySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  codeInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  resendRow: { marginTop: 12, marginBottom: 8 },
  resendText: { fontSize: 14, color: '#ef4444', textAlign: 'center' },
  resendDisabled: { color: '#64748b', opacity: 0.7 },
  adminRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
  modalScroll: { maxHeight: 400 },
  modalItem: { paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalItemText: { color: '#f8fafc', fontSize: 16 },
  dateModalContent: { padding: 24 },
  dateModalTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  dateInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateInput: { flex: 1, marginBottom: 0, textAlign: 'center' },
  dateSeparator: { color: '#94a3b8', fontSize: 18, marginHorizontal: 4 },
  dateModalActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  dateModalBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  dateModalBtnText: { color: '#60a5fa', fontWeight: '600', fontSize: 14 },
});
