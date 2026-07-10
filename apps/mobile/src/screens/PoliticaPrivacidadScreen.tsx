/**
 * Política de privacidad y uso de datos – Mismo contenido que web.
 * Ubicación: apps/mobile/src/screens/PoliticaPrivacidadScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, glassCard, stackScreenContent } from '../theme';

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

export function PoliticaPrivacidadScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Política de privacidad"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={user ? <UserMenuButton /> : undefined}
        />
      <Text style={styles.title}>Política de Privacidad y Uso de Datos - Tickets Transfer</Text>
      <Text style={styles.updated}>Última actualización: febrero 2026</Text>

      <Section title="1. Introducción">
        <Text style={styles.para}>
          La presente Política de Privacidad y Protección de Datos («Política») regula el tratamiento de la información personal de los usuarios que utilizan la aplicación Tickets Transfer («la Aplicación»). Al registrarse, acceder o utilizar cualquiera de las funciones, el usuario declara conocer, comprender y aceptar esta Política y los Términos y Condiciones que rigen el servicio.
        </Text>
        <Text style={styles.para}>
          Tickets Transfer se compromete a garantizar el más alto estándar de seguridad, confidencialidad y protección respecto de los datos personales proporcionados por el usuario.
        </Text>
      </Section>

      <Section title="2. Datos que recopilamos">
        <Text style={styles.para}>
          Para la correcta verificación, funcionamiento y seguridad del servicio, podremos solicitar, recopilar y almacenar los siguientes datos personales:
        </Text>
        <BulletList
          items={[
            'Nombre y apellido',
            'País',
            'Número de teléfono',
            'Tipo y número de documento',
            'Sexo (M/F/X)',
            'Datos técnicos del dispositivo',
            'Imágenes del documento de identidad (frente y dorso)',
            'Selfie de reconocimiento facial para validación biométrica',
            'Información de uso de la aplicación y actividad dentro de la plataforma',
            'Registros de transacciones, transferencias y verificaciones de tickets',
          ]}
        />
        <Text style={styles.para}>
          Estos datos se recopilan con el único fin de garantizar la legitimidad de las transacciones y la seguridad de todos los usuarios.
        </Text>
      </Section>

      <Section title="3. Finalidad del tratamiento de datos">
        <Text style={styles.para}>Los datos se utilizan estrictamente para:</Text>
        <BulletList
          items={[
            'Crear, mantener y verificar la identidad del usuario',
            'Permitir la compra, venta, transferencia y validación de boletos digitales',
            'Prevenir actividades fraudulentas o ilícitas',
            'Autenticar la identidad mediante sistemas de reconocimiento facial y documentación',
            'Generar un entorno seguro para operaciones entre usuarios',
            'Cumplir con normas legales, regulatorias y de prevención de delitos',
            'Mejorar la calidad, funcionamiento y estabilidad del servicio',
          ]}
        />
      </Section>

      <Section title="4. Seguridad y resguardo de la información">
        <Text style={styles.para}>
          Tickets Transfer aplica protocolos de seguridad avanzados, cifrado de datos, control de accesos y almacenamiento en servidores protegidos bajo estándares internacionales.
        </Text>
        <Text style={styles.para}>Garantizamos que:</Text>
        <BulletList
          items={[
            'Los datos NO serán vendidos, cedidos, filtrados ni compartidos con terceros sin consentimiento.',
            'Las imágenes y datos biométricos se almacenan en repositorios seguros con acceso restringido.',
            'Implementamos monitoreo permanente contra intentos de intrusión o filtración.',
          ]}
        />
        <Text style={styles.para}>
          El usuario reconoce que ningún sistema es 100% infalible, pero Tickets Transfer adopta todas las medidas razonables y exigidas por la normativa vigente para asegurar los datos.
        </Text>
      </Section>

      <Section title="5. Bases legales del tratamiento">
        <Text style={styles.para}>
          El tratamiento de datos se realiza conforme a las leyes de protección de datos vigentes en la jurisdicción del usuario, normativas de identificación digital y antifraude, y al consentimiento del usuario otorgado al registrarse.
        </Text>
      </Section>

      <Section title="6. Derechos del usuario">
        <Text style={styles.para}>El usuario podrá solicitar:</Text>
        <BulletList
          items={[
            'Acceso a su información personal',
            'Rectificación o actualización',
            'Eliminación de datos cuando corresponda legalmente',
            'Información sobre cómo se procesa su información',
          ]}
        />
      </Section>

      <Section title="7. Aceptación">
        <Text style={styles.para}>
          Al utilizar la App, el usuario acepta plenamente esta Política, los Términos y Condiciones, y cualquier modificación futura debidamente comunicada.
        </Text>
      </Section>

      <Section title="8. Modificaciones">
        <Text style={styles.para}>
          Tickets Transfer podrá actualizar esta Política para reflejar cambios normativos, técnicos o funcionales.
        </Text>
      </Section>

      <Section title="9. Contacto">
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
  content: stackScreenContent,
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
