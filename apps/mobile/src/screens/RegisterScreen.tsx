/**
 * Registro – Crear cuenta (campos principales)
 * Ubicación: apps/mobile/src/screens/RegisterScreen.tsx
 */

import * as React from 'react';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation<Nav>();

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone: phone ? `+549 ${phone}` : undefined,
        phonePrefix: '+549',
      });
      navigation.replace('Main');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>
      <Image
        source={require('../assets/images/LogoTT-v01.png')}
        style={{ width: 360, height: 108, alignSelf: 'flex-start', marginBottom: 32 }}
        resizeMode="contain"
      />
      <Text style={styles.title}>CREAR CUENTA</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor={colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.textMuted} value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Apellido" placeholderTextColor={colors.textMuted} value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Teléfono (+549)" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Crear cuenta</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  back: { marginBottom: spacing.md },
  backText: { color: colors.primaryLight },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: spacing.lg },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius, padding: 14, color: colors.text, marginBottom: spacing.md },
  error: { color: '#ef4444', marginBottom: spacing.sm },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center', marginTop: spacing.sm },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
