/**
 * Login – Email, Contraseña, Ingresar, Registrar aquí
 * Ubicación: apps/mobile/src/screens/LoginScreen.tsx
 */

import * as React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<Nav>();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Import Image component and define logoImage style */}
      <Image
        source={require('../assets/images/LogoTT-v01.png')}
        style={{ width: 360, height: 108, alignSelf: 'flex-start', marginBottom: 32 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>INICIO</Text>
      <TextInput
        style={styles.input}
        placeholder="Email o Usuario"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Ingresar</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>¿Aún no tienes una cuenta? Registrar aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.white, marginBottom: spacing.lg },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius, padding: 14, color: colors.text, marginBottom: spacing.md },
  error: { color: '#ef4444', marginBottom: spacing.sm },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center', marginTop: spacing.sm },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.primaryLight },
});
