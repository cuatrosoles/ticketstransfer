/**
 * Chat Soporte – Contenido dummy.
 * Ubicación: apps/mobile/src/screens/ChatSoporteScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, glassCard } from '../theme';

export function ChatSoporteScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={[styles.card, glassCard]}>
          <Text style={styles.cardTitle}></Text>
          <Text style={styles.cardText}>
            Conectate con nuestro equipo de soporte para resolver dudas, reportar problemas o solicitar ayuda con tus operaciones.
          </Text>
          <Text style={styles.dummy}>
            El chat de soporte estará disponible próximamente. Mientras tanto, podés contactarnos por los canales indicados en Acerca de.
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
