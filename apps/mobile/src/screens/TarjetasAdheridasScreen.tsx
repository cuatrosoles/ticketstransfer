/**
 * Tarjetas adheridas – Contenido dummy.
 * Ubicación: apps/mobile/src/screens/TarjetasAdheridasScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, glassCard } from '../theme';

export function TarjetasAdheridasScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.card, glassCard]}>
          <Text style={styles.cardTitle}></Text>
          <Text style={styles.cardText}>
            Aquí podrás gestionar las tarjetas de crédito y débito asociadas a tu cuenta para realizar pagos de forma segura.
          </Text>
          <Text style={styles.dummy}>
            Esta funcionalidad estará disponible pronto. Podrás agregar, eliminar y administrar tus métodos de pago.
          </Text>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  card: { padding: spacing.lg },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  cardText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  dummy: { fontSize: 13, color: colors.textMuted, marginTop: spacing.md, fontStyle: 'italic' },
});
