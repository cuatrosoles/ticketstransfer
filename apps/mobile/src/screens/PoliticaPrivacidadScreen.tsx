/**
 * Política de privacidad y uso de datos – Mismo contenido que web.
 * Ubicación: apps/mobile/src/screens/PoliticaPrivacidadScreen.tsx
 */

import * as React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthBackground } from '../components/AuthBackground';
import { colors, spacing, radius, glassCard } from '../theme';

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
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}></Text>
      <Text style={styles.updated}>Última actualización: febrero 2026</Text>

      <Section title="1. Introducción">
        <Text style={styles.para}>
          La presente Política de Privacidad y Protección de Datos (en adelante, «Política») regula el tratamiento de la información personal de los usuarios de la aplicación «Tickets Transfer». Al registrarte, acceder o utilizar cualquier funcionalidad del servicio, reconocés, entendés y aceptás esta Política y los Términos y Condiciones del servicio. Tickets Transfer se compromete a garantizar el más alto estándar de seguridad, confidencialidad y protección de los datos personales que proporciones.
        </Text>
      </Section>

      <Section title="2. Datos que recopilamos">
        <Text style={styles.para}>
          Tickets Transfer podrá recopilar, solicitar y almacenar los siguientes datos personales para la verificación, funcionamiento y seguridad del servicio:
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
          Estos datos se recopilan únicamente para asegurar la legitimidad de las transacciones y la seguridad de todos los usuarios.
        </Text>
      </Section>

      <Section title="3. Finalidad del tratamiento de datos">
        <Text style={styles.para}>Los datos recopilados se utilizan exclusivamente para las siguientes finalidades:</Text>
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
          Tickets Transfer aplica protocolos de seguridad avanzados, cifrado de datos, control de accesos y almacenamiento en servidores protegidos según estándares internacionales. Garantizamos que:
        </Text>
        <BulletList
          items={[
            'Los datos NO serán vendidos, cedidos, filtrados ni compartidos con terceros sin consentimiento',
            'Las imágenes y datos biométricos se almacenan en repositorios seguros con acceso restringido',
            'Implementamos monitoreo permanente contra intentos de intrusión o filtración',
          ]}
        />
        <Text style={styles.para}>
          Ningún sistema es 100% infalible, pero Tickets Transfer adopta todas las medidas razonables que exigen las normativas vigentes para resguardar los datos.
        </Text>
      </Section>

      <Section title="5. Obligaciones del usuario">
        <Text style={styles.para}>El usuario se compromete a:</Text>
        <BulletList
          items={[
            'Brindar información veraz y actualizada',
            'Utilizar la App de forma legal y conforme a Términos y Condiciones',
            'No manipular, falsificar o alterar documentación, imágenes o entradas',
            'No realizar conductas engañosas, fraudulentas o que dañen a otros usuarios',
          ]}
        />
      </Section>

      <Section title="6. Política antifraude y sanciones">
        <Text style={styles.para}>Se considerará fraude, entre otras conductas:</Text>
        <BulletList
          items={[
            'Presentar documentos de identidad falsos o adulterados',
            'Manipular imágenes de tickets o códigos QR',
            'Intercambiar entradas falsas o duplicadas',
            'Suplantación de identidad',
            'Cualquier acción que busque engañar al sistema o a otros usuarios',
          ]}
        />
        <Text style={styles.para}>Consecuencias ante fraude:</Text>
        <BulletList
          items={[
            'La cuenta será dada de baja de forma permanente',
            'No habrá reintegro de dinero',
            'No se devolverán ni restaurarán entradas',
            'El caso podrá ser reportado a autoridades correspondientes',
          ]}
        />
      </Section>

      <Section title="7. Bases legales del tratamiento">
        <Text style={styles.para}>
          El tratamiento de datos se realiza conforme a las leyes de protección de datos vigentes en la jurisdicción del usuario, normativas de identificación digital y antifraude, y al consentimiento del usuario otorgado al registrarse.
        </Text>
      </Section>

      <Section title="8. Derechos del usuario">
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

      <Section title="9. Aceptación">
        <Text style={styles.para}>
          Al utilizar la App, el usuario acepta plenamente esta Política, los Términos y Condiciones, y cualquier modificación futura debidamente comunicada.
        </Text>
      </Section>

      <Section title="10. Modificaciones">
        <Text style={styles.para}>
          Tickets Transfer podrá actualizar esta Política para reflejar cambios normativos, técnicos o funcionales.
        </Text>
      </Section>

      <Section title="11. Contacto">
        <Text style={styles.para}>
          Consultas o solicitudes podrán enviarse a los canales oficiales de soporte dentro de la aplicación.
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
