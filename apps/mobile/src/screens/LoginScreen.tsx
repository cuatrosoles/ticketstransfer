/**
 * Login – Formulario con panel glass, labels, iconos. Idéntico a web.
 * Gradiente, maxWidth 420, btn-primary con gradiente y glow.
 */

import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { BiometricActivationModal } from '../components/BiometricActivationModal';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { GradientButton } from '../components/GradientButton';
import { useBranding } from '../context/BrandingContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const { login, enableBiometrics, biometricAvailability, biometricEnabled, clearPendingBiometricPrompt } = useAuth();
  const navigation = useNavigation<Nav>();
  const brand = useBranding();

  const goToMain = () => {
    setShowBiometricModal(false);
    clearPendingBiometricPrompt();
    navigation.replace('Main', {});
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (biometricAvailability?.available && !biometricEnabled) {
        setShowBiometricModal(true);
      } else {
        navigation.replace('Main', {});
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al iniciar sesión';
      const friendly =
        msg.includes('auth/invalid-credential') || msg.includes('invalid-credential')
          ? 'Email/usuario o contraseña incorrectos. Verificá que usás el mismo email con el que te registraste.'
          : msg;
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="INICIAR SESIÓN" showBack onBack={() => navigation.goBack()} logoUri={brand.logoUrl} />
        <View style={styles.glassWrap}>
          <View style={styles.glassPanel}>
            <Text style={styles.label}>Email o Usuario:</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="Email o Usuario"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.label}>Contraseña:</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Contraseña"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeBtnText}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => Alert.alert('Próximamente', 'La recuperación de contraseña estará disponible pronto.')}
            >
              <Text style={styles.forgotLinkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GradientButton title="Ingresar" onPress={handleLogin} loading={loading} style={styles.submitBtn} />

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
              <Text style={styles.registerText}>¿Aún no tienes una cuenta? </Text>
              <Text style={styles.registerLinkText}>Registrar aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BiometricActivationModal
        visible={showBiometricModal}
        biometricType={biometricAvailability?.type ?? null}
        onActivate={enableBiometrics}
        onSkip={goToMain}
        onSuccess={goToMain}
      />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48, paddingHorizontal: 24, flexGrow: 1, alignItems: 'center' },
  glassWrap: { width: '100%', maxWidth: 420 },
  glassPanel: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  label: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 12,
    marginBottom: 16,
  },
  inputIcon: { fontSize: 18, paddingLeft: 14, paddingRight: 8 },
  input: { flex: 1, paddingVertical: 14, paddingRight: 14, color: '#f8fafc', fontSize: 16 },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: 14 },
  eyeBtnText: { fontSize: 20 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: 8 },
  forgotLinkText: { color: '#60a5fa', fontSize: 14, textDecorationLine: 'underline' },
  error: { color: '#ef4444', marginBottom: 8, fontSize: 14 },
  submitBtn: { width: '100%', marginTop: 8 },
  registerLink: { marginTop: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  registerText: { color: '#94a3b8', fontSize: 15 },
  registerLinkText: { color: '#60a5fa', fontWeight: '600', fontSize: 15 },
});
