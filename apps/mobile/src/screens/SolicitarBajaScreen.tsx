/**
 * Solicitar baja de cuenta – Mismo contenido mockup que web.
 * Ubicación: apps/mobile/src/screens/SolicitarBajaScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

export function SolicitarBajaScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}></Text>
        <View style={[styles.card, glassCard]}>
        <Text style={styles.cardTitle}>BAJA DE CUENTA</Text>
        <Text style={styles.cardText}>
          Si deseas dar de baja tu cuenta en Tickets Transfer, tené en cuenta que se eliminarán tus datos personales y el historial de operaciones asociado, según lo establecido en nuestra Política de privacidad. Las operaciones en curso deberán estar finalizadas o canceladas antes de solicitar la baja.
        </Text>
        <Text style={styles.cardText}>
          Para solicitar la baja podés enviar un correo a baja@ticketstransfer.com indicando tu email registrado y el motivo (opcional). También podés usar el botón siguiente para registrar la solicitud desde la app. Nos pondremos en contacto para confirmar el proceso.
        </Text>
        <Text style={[styles.cardText, styles.muted]}>
          Esta es una pantalla de ejemplo. La funcionalidad de baja estará disponible próximamente.
        </Text>
        <TouchableOpacity style={[styles.button, styles.buttonDisabled]} disabled>
          <Text style={styles.buttonText}>Solicitar baja (próximamente)</Text>
        </TouchableOpacity>
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  cardText: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm },
  muted: { marginTop: spacing.md, fontSize: 13 },
  button: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
