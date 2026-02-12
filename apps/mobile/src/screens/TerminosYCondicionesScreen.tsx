/**
 * Términos y condiciones de uso – Mismo contenido mockup que web.
 * Ubicación: apps/mobile/src/screens/TerminosYCondicionesScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

export function TerminosYCondicionesScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}></Text>
        <View style={[styles.card, glassCard]}>
        <Text style={styles.cardTitle}>ACEPTACIÓN</Text>
        <Text style={styles.cardText}>
          Al registrarte y usar Tickets Transfer aceptás estos términos. La plataforma permite la reventa e intercambio de entradas digitales para eventos en Argentina, actuando como mediador entre vendedor y comprador. El usuario debe ser mayor de edad y proporcionar información veraz.
        </Text>
        <Text style={styles.cardTitle}>OBLIGACIONES</Text>
        <Text style={styles.cardText}>
          Está prohibido usar la app para fines fraudulentos, vender entradas que no poseas o falsear datos. Las transacciones se rigen por nuestras reglas de escrow y transferencia. Nos reservamos el derecho de suspender o dar de baja cuentas que incumplan estos términos. Para solicitar la baja de cuenta utilizá la opción correspondiente en el menú de usuario.
        </Text>
        <Text style={styles.cardTitle}>MODIFICACIONES</Text>
        <Text style={styles.cardText}>
          Podemos actualizar estos términos; el uso continuado de la app implica la aceptación de los cambios. Ante dudas, contactanos por los canales indicados en la app.
        </Text>
        <Text style={[styles.cardText, styles.muted]}>
          Última actualización: enero 2025. Contenido de ejemplo.
        </Text>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  card: {
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  cardText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  muted: { marginTop: spacing.md, fontSize: 13 },
});
