/**
 * Términos y condiciones de uso – Tickets Transfer.
 * Ubicación: apps/mobile/src/screens/TerminosYCondicionesScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, glassCard } from '../theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <View key={i} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function TerminosYCondicionesScreen() {
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Términos y Condiciones - Tickets Transfer</Text>
        <Text style={styles.updated}>Última actualización: febrero 2026</Text>

        <Section title="1. Obligaciones del usuario">
          <Text style={styles.para}>El usuario se compromete a:</Text>
          <BulletList
            items={[
              'Brindar información veraz y actualizada.',
              'Utilizar la App de forma legal y conforme a los Términos y Condiciones.',
              'No manipular, falsificar o alterar documentación, imágenes o tickets.',
              'No realizar conductas engañosas, fraudulentas o que dañen a otros usuarios.',
            ]}
          />
        </Section>

        <Section title="2. Política antifraude y sanciones">
          <Text style={styles.para}>Se considerará fraude, entre otras conductas:</Text>
          <BulletList
            items={[
              'Presentar documentos de identidad falsos o adulterados.',
              'Manipular imágenes de tickets o códigos QR.',
              'Intercambiar entradas falsas o duplicadas.',
              'Suplantación de identidad.',
              'Cualquier acción que busque engañar al sistema o a otros usuarios.',
            ]}
          />
          <Text style={styles.para}>En caso de intento o ejecución de fraude:</Text>
          <BulletList
            items={[
              'La cuenta será dada de baja de forma permanente.',
              'No habrá reintegro de dinero.',
              'No se devolverán ni restaurarán las entradas.',
              'El caso podrá ser reportado a las autoridades correspondientes.',
            ]}
          />
        </Section>

        <Section title="3. Aceptación">
          <Text style={styles.para}>
            Al utilizar la App, el usuario acepta plenamente la Política de Privacidad, estos Términos y Condiciones, y cualquier modificación futura debidamente comunicada.
          </Text>
        </Section>

        <Section title="4. Modificaciones">
          <Text style={styles.para}>
            Tickets Transfer podrá actualizar estos Términos para reflejar cambios normativos, técnicos o funcionales.
          </Text>
        </Section>

        <Section title="5. Contacto">
          <Text style={styles.para}>
            Las consultas o solicitudes podrán enviarse a los canales oficiales de soporte dentro de la aplicación.
          </Text>
        </Section>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 160, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  updated: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  section: {
    ...glassCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  para: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.sm },
  list: { marginBottom: spacing.sm },
  listItem: { flexDirection: 'row', marginBottom: 4 },
  bullet: { color: colors.textMuted, marginRight: 8, fontSize: 14 },
  listText: { flex: 1, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
