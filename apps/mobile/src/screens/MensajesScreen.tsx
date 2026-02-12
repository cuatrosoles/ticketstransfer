/**
 * Mensajes – Conversaciones con vendedores o compradores.
 * Contenido dummy. Enlazado desde menú usuario.
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
            Acá vas a ver las conversaciones con otros usuarios de la plataforma: vendedores cuando comprás, o compradores cuando vendés. Podés coordinar la entrega del ticket y resolver dudas.
          </Text>
          <Text style={[styles.cardText, styles.muted]}>
            La bandeja de mensajes estará disponible próximamente. Por ahora, podés usar el chat que aparece al momento de comprar un ticket para contactar al vendedor.
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  cardText: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm },
  muted: { marginTop: spacing.md, fontSize: 13 },
});
