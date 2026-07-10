/**
 * Política antifraude y devoluciones – Tickets Transfer.
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, glassCard, stackScreenContent } from '../theme';

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
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function PoliticaAntifraudeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Política antifraude"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={user ? <UserMenuButton /> : undefined}
        />

        <Text style={styles.title}>Política Antifraude — Tickets Transfer</Text>
        <Text style={styles.intro}>
          En Tickets Transfer trabajamos para brindar una experiencia segura, transparente y confiable para
          compradores y vendedores de entradas.
        </Text>

        <Section title="1. Verificación de operaciones">
          <Text style={styles.para}>
            Todas las operaciones realizadas dentro de la plataforma podrán ser monitoreadas y verificadas con el
            objetivo de prevenir fraudes, actividades sospechosas o incumplimientos.
          </Text>
        </Section>

        <Section title="2. Retención temporal del pago">
          <Text style={styles.para}>
            Tickets Transfer actúa como intermediario entre comprador y vendedor. El dinero permanecerá retenido
            temporalmente hasta que la transferencia de la/s entrada/s haya sido confirmada correctamente por ambas
            partes o validada por el sistema.
          </Text>
        </Section>

        <Section title="3. Validación de entradas">
          <Text style={styles.para}>
            La plataforma podrá solicitar evidencia, comprobantes, capturas, correos oficiales o cualquier información
            necesaria para validar la autenticidad de las entradas publicadas.
          </Text>
        </Section>

        <Section title="4. Actividades prohibidas">
          <Text style={styles.para}>Queda estrictamente prohibido:</Text>
          <BulletList
            items={[
              'Publicar entradas falsas, duplicadas o inválidas.',
              'Intentar manipular pagos o transferencias.',
              'Suplantar identidad.',
              'Utilizar cuentas múltiples con fines fraudulentos.',
              'Comercializar entradas robadas o adquiridas ilegalmente.',
            ]}
          />
        </Section>

        <Section title="5. Suspensión de cuentas">
          <Text style={styles.para}>
            Tickets Transfer podrá suspender o bloquear cuentas de manera preventiva o definitiva ante conductas
            sospechosas, denuncias reiteradas o incumplimientos de esta política.
          </Text>
        </Section>

        <Section title="6. Colaboración con autoridades">
          <Text style={styles.para}>
            En casos que lo requieran, Tickets Transfer podrá colaborar con autoridades competentes aportando
            información vinculada a operaciones fraudulentas o actividades ilícitas.
          </Text>
        </Section>

        <Section title="7. Responsabilidad del usuario">
          <Text style={styles.para}>
            Cada usuario es responsable de la autenticidad de la información y entradas publicadas dentro de la
            plataforma.
          </Text>
        </Section>

        <Text style={styles.subtitle}>Política de Devolución y Reembolsos — Tickets Transfer</Text>

        <Section title="1. Cancelación del evento">
          <Text style={styles.para}>
            Si un evento es cancelado oficialmente y no reprogramado, las devoluciones estarán sujetas a las políticas
            establecidas por la ticketera oficial y/o el organizador del evento.
          </Text>
        </Section>

        <Section title="2. Entradas no transferidas">
          <Text style={styles.para}>Si el vendedor no realiza correctamente la transferencia de la/s entrada/s dentro del plazo acordado:</Text>
          <BulletList items={['la operación podrá ser cancelada,', 'y el comprador recibirá el reintegro correspondiente.']} />
        </Section>

        <Section title="3. Entradas inválidas o fraudulentas">
          <Text style={styles.para}>
            Si se detecta que una entrada es falsa, inválida, duplicada o no coincide con la publicación realizada:
          </Text>
          <BulletList
            items={[
              'la operación será investigada,',
              'el pago podrá ser retenido,',
              'y el comprador podrá solicitar un reembolso.',
            ]}
          />
        </Section>

        <Section title="4. Confirmación de transferencia">
          <Text style={styles.para}>
            Una vez confirmada correctamente la transferencia de la/s entrada/s y liberado el pago al vendedor, la
            operación se considerará finalizada, salvo casos excepcionales de fraude comprobado.
          </Text>
        </Section>

        <Section title="5. Disputas">
          <Text style={styles.para}>
            Ante cualquier inconveniente, Tickets Transfer podrá actuar como mediador entre las partes para analizar
            evidencias y resolver conflictos de manera justa.
          </Text>
        </Section>

        <Section title="6. Tiempos de reembolso">
          <Text style={styles.para}>
            Los tiempos de acreditación de reintegros podrán variar según el método de pago utilizado y la entidad
            financiera correspondiente.
          </Text>
        </Section>

        <Section title="7. Aceptación de políticas">
          <Text style={styles.para}>
            Al utilizar la plataforma, todos los usuarios aceptan estas políticas y los términos y condiciones de
            Tickets Transfer.
          </Text>
        </Section>

        <View style={[styles.disclaimer, glassCard]}>
          <Text style={styles.para}>
            Tickets Transfer no emite, comercializa ni vende entradas oficiales para shows, recitales, eventos deportivos
            o espectáculos.
          </Text>
          <Text style={styles.para}>
            Nuestra plataforma funciona exclusivamente como intermediario tecnológico entre usuarios particulares
            (comprador y vendedor), facilitando una reventa o intercambio de entradas de forma más segura, transparente y
            confiable.
          </Text>
          <Text style={styles.para}>
            El objetivo de Tickets Transfer es reducir estafas y brindar mayor seguridad en cada operación, actuando
            como mediador y reteniendo temporalmente el pago hasta que la transferencia de la/s entrada/s haya sido
            completada correctamente.
          </Text>
          <Text style={styles.para}>
            Las condiciones de uso, transferibilidad, validez y cumplimiento de cada entrada o evento son determinadas
            exclusivamente por los organizadores, productoras y/o ticketeras oficiales correspondientes.
          </Text>
          <Text style={styles.para}>
            Al utilizar la plataforma, los usuarios aceptan respetar los términos y condiciones establecidos por cada
            evento y sus organizadores.
          </Text>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  subtitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  intro: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
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
  disclaimer: { padding: spacing.lg, marginBottom: spacing.lg },
});
