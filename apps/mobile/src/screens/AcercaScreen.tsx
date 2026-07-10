/**
 * Acerca de – Mismo contenido que web (ACERCA DE LA APP).
 * Ubicación: apps/mobile/src/screens/AcercaScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, glassCard, stackScreenContent } from '../theme';

const ACERCA_DE_LA_APP =
  'Tickets Transfer es una plataforma tecnológica especializada en la gestión segura de reventa e intercambio de entradas digitales entre usuarios particulares. Nuestro objetivo es brindar un entorno confiable, transparente y eficiente, garantizando que cada operación se realice con los más altos estándares de seguridad. La aplicación actúa como intermediaria neutral, verificando la autenticidad del ticket digital provisto por el vendedor y gestionando un proceso de transferencia protegido, asegurando que el comprador reciba un acceso válido y utilizable. De esta manera, contribuimos a reducir significativamente los riesgos asociados a la reventa informal, especialmente en un contexto donde las estafas vinculadas a códigos QR de un solo uso son cada vez más frecuentes. En Tickets Transfer promovemos un ecosistema donde la confianza y la seguridad son pilares fundamentales. Nuestro sistema de validación, sumado a un flujo de operación claro y auditado, garantiza que cada parte involucrada pueda completar su transacción con total tranquilidad. Tickets Transfer protege la autenticidad del ticket y resguarda el dinero del comprador, asegurando operaciones justas, seguras y confiables en todo momento. Tickets Transfer: la manera más segura y confiable de revender o intercambiar tus entradas digitales.';

export function AcercaScreen() {
  const navigation = useNavigation();
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Acerca de"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <View style={[styles.card, glassCard]}>
        <Text style={styles.cardTitle}>ACERCA DE LA APP:</Text>
        <Text style={styles.cardText}>{ACERCA_DE_LA_APP}</Text>
        </View>
        <View style={styles.legalWrap}>
          <Text style={styles.legalText}>TICKETS TRANSFER®</Text>
          <Text style={styles.legalText}>TODOS LOS DERECHOS RESERVADOS.</Text>
          {/*
          <Text style={styles.legalText}>DE VALENTIN PITTALUGA</Text>
          <Text style={styles.legalText}>IVA RESP.MONOTRIBUTO</Text>
          <Text style={styles.legalText}>CUIT 20-40387579-2</Text>
          <Text style={styles.legalText}>CP9400. RIO GALLEGOS</Text>
          <Text style={styles.legalText}>SANTA CRUZ</Text>
          */}
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  card: {
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  cardText: { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  legalWrap: { marginTop: spacing.xl, alignItems: 'center', gap: 2 },
  legalText: { color: colors.text, fontWeight: '700', fontSize: 16, letterSpacing: 0.4, textAlign: 'center' },
});
