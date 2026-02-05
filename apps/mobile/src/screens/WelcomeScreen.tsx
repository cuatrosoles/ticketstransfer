/**
 * Bienvenida – ACERCA DE, VENTA/INTERCAMBIO, ticketeras, apps
 * Ubicación: apps/mobile/src/screens/WelcomeScreen.tsx
 */

import * as React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, radius } from '../theme';

const ACERCA_DE =
  'TICKETS TRANSFER ES UNA APP PARA LA REVENTA O INTERCAMBIO DE ENTRADAS-BOLETOS DIGITALES EN ARGENTINA DE FORMA SEGURA. FUNCIONAMOS COMO MEDIADORES ENTRE VENDEDOR Y COMPRADOR. ¡GRACIAS POR CONFIAR EN TICKETS TRANSFER!';

const TICKETERAS = ['TICKETEK', 'allaccess', 'Ticketerà', 'TICKETERA'];
const APPS_BOLETOS = ['Quentro', 'ENIGMA', 'T TICKET360', 'TICKETMAKER'];

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ACERCA DE LA APP:</Text>
        <Text style={styles.cardText}>{ACERCA_DE}</Text>
      </View>
      <Text style={styles.label}>Indicanos qué acción querés realizar:</Text>
      <View style={styles.chips}>
        <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>VENTA</Text></TouchableOpacity>
        <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>INTERCAMBIO</Text></TouchableOpacity>
      </View>
      <Text style={styles.label}>Ticketera de compra:</Text>
      <View style={styles.chips}>
        {TICKETERAS.map((t) => (
          <TouchableOpacity key={t} style={styles.chip}><Text style={styles.chipText}>{t}</Text></TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>App de boletos digitales:</Text>
      <View style={styles.chips}>
        {APPS_BOLETOS.map((a) => (
          <TouchableOpacity key={a} style={styles.chip}><Text style={styles.chipText}>{a}</Text></TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.secondaryButtonText}>Registrarme</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 48 },
  logoImage: { width: 200, height: 52, marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.white, marginBottom: spacing.sm },
  cardText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: { backgroundColor: colors.card, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.text, fontWeight: '600' },
  primaryButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius, alignItems: 'center', marginBottom: spacing.sm },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  secondaryButton: { paddingVertical: 14, borderRadius: radius, alignItems: 'center', borderWidth: 2, borderColor: colors.primaryLight },
  secondaryButtonText: { color: colors.primaryLight, fontWeight: '600', fontSize: 16 },
});
