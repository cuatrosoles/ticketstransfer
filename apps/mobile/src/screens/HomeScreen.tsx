/**
 * Home – Publicar ticket, KYC, Mis compras, Mis ventas
 * Ubicación: apps/mobile/src/screens/HomeScreen.tsx
 */

import * as React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export function HomeScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image source={require('../assets/images/LogoTT-v01.png')} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.subtitle}>{user?.email}</Text>
        <TouchableOpacity onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Kyc')}>
        <Text style={styles.cardTitle}>Verificación KYC</Text>
        <Text style={styles.cardSubtitle}>Verificar identidad con DNI y selfie</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Publish')}>
        <Text style={styles.cardTitle}>Publicar ticket</Text>
        <Text style={styles.cardSubtitle}>Vender o intercambiar tu entrada</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyPurchases')}>
        <Text style={styles.cardTitle}>Mis compras</Text>
        <Text style={styles.cardSubtitle}>Órdenes como comprador</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MySales')}>
        <Text style={styles.cardTitle}>Mis ventas</Text>
        <Text style={styles.cardSubtitle}>Órdenes como vendedor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  header: { marginBottom: spacing.lg },
  logoImage: { width: 400, height: 120 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  logout: { marginTop: 8 },
  logoutText: { color: colors.primaryLight },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontWeight: '600', fontSize: 16 },
  cardSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
