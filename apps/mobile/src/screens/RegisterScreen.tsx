/**
 * Registro – 2 pasos como web: paso 1 (email, repetir email, contraseña, términos);
 * paso 2 (nombre, apellido, tipo DNI, sexo, fecha, país, teléfono, provincia, ciudad, dirección, etc.).
 * Validación: no se puede pasar al paso 2 ni enviar sin completar correctamente.
 * Tras registro navega a Kyc (igual que web).
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { registerSchema, SEXO_OPCIONES, TIPO_DOCUMENTO, PREFIJO_TELEFONO_DEFAULT } from '../lib/registerConstants';
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { AuthBackground } from '../components/AuthBackground';
import { GradientButton } from '../components/GradientButton';
import { colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [sexo, setSexo] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerModal, setPickerModal] = useState<'province' | 'city' | 'date' | null>(null);
  const [tempDate, setTempDate] = useState({ day: '', month: '', year: '' });
  const { register } = useAuth();
  const navigation = useNavigation<Nav>();

  const cities = province ? (CIUDADES_POR_PROVINCIA[province] ?? []) : [];
  useEffect(() => {
    if (!province) setCity('');
  }, [province]);

  const handleNextStep = () => {
    const err = validateStep1(email, repeatEmail, password, confirmPassword, agreeTerms);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(2);
  };

  const step2RequiredOk = !!firstName.trim() && !!lastName.trim() && !!username.trim();

  const handleRegister = async () => {
    setError('');
    const payload = {
      email,
      repeatEmail,
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
      direccion: direccion || undefined,
      numero: numero || undefined,
      piso: piso || undefined,
      depto: depto || undefined,
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
        (first.agreeTerms && first.agreeTerms[0]) ||
        result.error.message;
      setError(msg ?? 'Revisá los datos');
      return;
    }
    setLoading(true);
    try {
      await register(payload as Record<string, unknown>);
      // La app pasa al stack autenticado; HomeScreen redirige a Kyc (igual que web).
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
      <Text style={styles.label}>Repetir Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
        secureTextEntry
      />
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
        <GradientButton title="SIGUIENTE >" onPress={handleNextStep} style={styles.actionBtn} />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textMuted} value={firstName} onChangeText={setFirstName} />
      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} placeholder="Apellido" placeholderTextColor={colors.textMuted} value={lastName} onChangeText={setLastName} />
      <Text style={styles.label}>Nombre de Usuario</Text>
      <TextInput style={styles.input} placeholder="Valentin02" placeholderTextColor={colors.textMuted} value={username} onChangeText={setUsername} />
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
          <Text style={styles.label}>N°</Text>
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
      <Text style={styles.label}>Sexo (según tu documento)</Text>
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
      <Text style={styles.hint}>Completá los campos obligatorios (Nombre, Apellido y los del paso anterior) para registrar.</Text>
      <View style={styles.actions}>
        <GradientButton title="VOLVER" variant="secondary" onPress={() => setStep(1)} style={styles.actionBtn} />
        <GradientButton
          title="Crear cuenta"
          onPress={handleRegister}
          disabled={!step2RequiredOk}
          loading={loading}
          style={StyleSheet.flatten([styles.actionBtn, !step2RequiredOk && styles.actionBtnDisabled])}
        />
      </View>
    </>
  );

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.glassWrap}>
          <View style={styles.glassPanel}>
          {step === 1 ? renderStep1() : renderStep2()}
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
  content: { paddingHorizontal: 24, paddingTop: 200, paddingBottom: 48, flexGrow: 1, alignItems: 'center' },
  glassWrap: { width: '100%', maxWidth: 420 },
  glassPanel: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    marginBottom: 8,
  },
  inputDisabled: { opacity: 0.6 },
  pickerValue: { color: '#f8fafc' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96, 165, 250, 0.3)' },
  chipSelected: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  chipText: { color: '#f8fafc', fontSize: 14 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  phoneLabel: { fontSize: 12, color: '#94a3b8', width: 60 },
  phoneAreaInput: { width: 70, marginBottom: 0 },
  phoneInput: { flex: 1, minWidth: 100, marginBottom: 0 },
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
