/**
 * Acerca de – Mismo contenido que web (ACERCA DE LA APP).
 * Ubicación: apps/mobile/src/screens/AcercaScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

const ACERCA_DE_LA_APP =
  'TICKETS TRANSFER ES UNA APP PARA LA REVENTA O INTERCAMBIO DE ENTRADAS-BOLETOS DIGITALES CON LA NUEVA METODOLOGÍA DE QR MEDIANTE APPS TERCIARIZADAS AL SER DESCARGADAS DE SUS TICKETERAS DE ORIGEN PARA SHOWS Y EVENTOS EN ARGENTINA DE FORMA SEGURA Y CONFIABLE, PARA EVITAR POSIBLES ESTAFAS O FRAUDES. FUNCIONAMOS COMO MEDIADORES ENTRE EL VENDEDOR Y COMPRADOR. ESPERAMOS QUE TU VENTA O INTERCAMBIO SEA EXITOSA. ¡GRACIAS POR CONFIAR EN TICKETS TRANSFER!';

export function AcercaScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}></Text>
        <View style={[styles.card, glassCard]}>
        <Text style={styles.cardTitle}>ACERCA DE LA APP:</Text>
        <Text style={styles.cardText}>{ACERCA_DE_LA_APP}</Text>
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  cardText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
});
