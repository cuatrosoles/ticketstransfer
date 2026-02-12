/**
 * Chat Soporte – Atención al cliente en tiempo real.
 * Contenido dummy. Enlazado desde menú usuario.
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
            Escribinos por acá si tenés dudas sobre una compra, una venta o el funcionamiento de la app. Nuestro equipo te responde en horario comercial.
          </Text>
          <Text style={[styles.cardText, styles.muted]}>
            El chat estará disponible próximamente. Mientras tanto, podés contactarnos por email a soporte@ticketstransfer.com o por nuestras redes sociales.
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
