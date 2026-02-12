/**
 * Tarjetas adheridas – Métodos de pago asociados a tu cuenta.
 * Contenido dummy. Enlazado desde menú usuario.
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
            Acá vas a poder ver y gestionar las tarjetas de crédito o débito que tengas asociadas a tu cuenta para realizar compras de forma segura.
          </Text>
          <Text style={[styles.cardText, styles.muted]}>
            Esta funcionalidad estará disponible próximamente. Por ahora podés realizar tus compras con Mercado Pago u otros métodos disponibles al momento del checkout.
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
