/**
 * Mensajes – Contenido dummy.
 * Ubicación: apps/mobile/src/screens/MensajesScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, glassCard } from '../theme';

export function MensajesScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.card, glassCard]}>
          <Text style={styles.cardTitle}></Text>
          <Text style={styles.cardText}>
            Aquí podrás ver los mensajes intercambiados con vendedores y compradores durante tus operaciones de compra o venta de tickets.
          </Text>
          <Text style={styles.dummy}>
            La bandeja de mensajes estará disponible pronto. Te permitirá comunicarte de forma segura con los demás usuarios.
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
