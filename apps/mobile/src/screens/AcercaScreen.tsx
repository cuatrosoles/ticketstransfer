/**
 * Acerca de – Mismo contenido que web (ACERCA DE LA APP).
 * Ubicación: apps/mobile/src/screens/AcercaScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

const ACERCA_DE_LA_APP =
  'Tickets Transfer es una plataforma tecnológica especializada en la gestión segura de reventa e intercambio de entradas digitales entre usuarios particulares. Nuestro objetivo es brindar un entorno confiable, transparente y eficiente, garantizando que cada operación se realice con los más altos estándares de seguridad. La aplicación actúa como intermediaria neutral, verificando la autenticidad del ticket digital provisto por el vendedor y gestionando un proceso de transferencia protegido, asegurando que el comprador reciba un acceso válido y utilizable. De esta manera, contribuimos a reducir significativamente los riesgos asociados a la reventa informal, especialmente en un contexto donde las estafas vinculadas a códigos QR de un solo uso son cada vez más frecuentes. En Tickets Transfer promovemos un ecosistema donde la confianza y la seguridad son pilares fundamentales. Nuestro sistema de validación, sumado a un flujo de operación claro y auditado, garantiza que cada parte involucrada pueda completar su transacción con total tranquilidad. Tickets Transfer protege la autenticidad del ticket y resguarda el dinero del comprador, asegurando operaciones justas, seguras y confiables en todo momento. Tickets Transfer: la manera más segura y confiable de revender o intercambiar tus entradas digitales.';

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
