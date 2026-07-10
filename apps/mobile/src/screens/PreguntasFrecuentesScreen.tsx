import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { SupportChannelsBlock } from '../components/SupportChannelsBlock';
import { colors, glassCard, stackScreenContent, spacing } from '../theme';

type FaqItem = {
  question: string;
  answer?: string;
  bullets?: string[];
  footer?: string;
};

const FAQ: FaqItem[] = [
  {
    question: '¿Qué es Tickets Transfer?',
    answer:
      'Tickets Transfer es una plataforma especializada en la compra, venta e intercambio de entradas digitales entre usuarios. Nuestro objetivo es ofrecer un entorno más seguro para realizar este tipo de operaciones mediante herramientas de verificación, gestión de pagos y asistencia durante todo el proceso.',
  },
  {
    question: '¿Tickets Transfer vende entradas oficiales?',
    answer:
      'No. Tickets Transfer no es una ticketera ni organiza eventos. La plataforma únicamente facilita el contacto entre usuarios que desean vender, comprar o intercambiar entradas digitales adquiridas previamente a través de canales oficiales.',
  },
  {
    question: '¿Cómo funciona el proceso de compra?',
    answer: 'Cuando un comprador adquiere una entrada a través de Tickets Transfer:',
    bullets: [
      'El comprador realiza el pago mediante la plataforma.',
      'El importe queda retenido temporalmente.',
      'El vendedor transfiere la entrada al comprador.',
      'El comprador confirma la recepción.',
      'Finalmente, el pago se libera al vendedor.',
    ],
    footer: 'Este sistema busca brindar mayor seguridad para ambas partes durante la operación.',
  },
  {
    question: '¿Por qué el dinero permanece retenido hasta finalizar la operación?',
    answer:
      'La retención temporal del pago permite verificar que ambas partes hayan cumplido con la transacción. De esta manera, se protege tanto al comprador como al vendedor frente a posibles inconvenientes.',
  },
  {
    question: '¿Cómo protege Tickets Transfer a sus usuarios?',
    answer: 'La plataforma incorpora diferentes medidas de seguridad, entre ellas:',
    bullets: [
      'Verificación de identidad de los usuarios.',
      'Sistemas de prevención de fraude.',
      'Retención temporal de los fondos durante la operación.',
      'Registro de las transacciones.',
      'Equipo de soporte para resolver incidencias.',
    ],
    footer: 'Estas herramientas contribuyen a generar una experiencia más segura y transparente.',
  },
  {
    question: '¿Cómo sé si la entrada publicada es válida?',
    answer:
      'Las publicaciones corresponden a entradas cargadas por los propios usuarios. Aunque Tickets Transfer implementa mecanismos para reducir riesgos y prevenir fraudes, la validez definitiva de una entrada depende de las condiciones establecidas por el organizador del evento y la ticketera emisora.',
  },
  {
    question: '¿Qué sucede si el vendedor no entrega la entrada?',
    answer:
      'Si el vendedor incumple con la entrega dentro del plazo establecido, la operación podrá cancelarse y el comprador recibirá el correspondiente reintegro, conforme a nuestras políticas y luego de la revisión del caso.',
  },
  {
    question: '¿Qué ocurre si el comprador informa un problema con la entrada?',
    answer:
      'Nuestro equipo analizará cada situación de forma individual. Se solicitará la documentación o evidencia necesaria a ambas partes antes de adoptar una resolución.',
  },
  {
    question: '¿Debo verificar mi identidad para utilizar la plataforma?',
    answer:
      'Sí. Algunas funciones requieren completar un proceso de verificación de identidad (KYC). Esta medida ayuda a prevenir fraudes, fortalecer la seguridad y generar mayor confianza entre los usuarios.',
  },
  {
    question: '¿Qué tipo de entradas puedo publicar?',
    answer:
      'Podrán publicarse únicamente entradas digitales cuya transferencia o reventa esté permitida por la legislación aplicable y por las condiciones establecidas por el organizador del evento o la plataforma emisora.',
  },
  {
    question: '¿Qué sucede si un evento es cancelado o reprogramado?',
    answer:
      'Las decisiones relacionadas con cancelaciones, reprogramaciones o devoluciones son responsabilidad exclusiva del organizador del evento o de la ticketera oficial. Tickets Transfer no interviene en dichas políticas.',
  },
  {
    question: '¿Cuáles son las comisiones por utilizar Tickets Transfer?',
    answer:
      'Las comisiones aplicables, en caso de corresponder, serán informadas de manera clara antes de confirmar cualquier operación. El usuario conocerá el importe total antes de finalizar la transacción.',
  },
  {
    question: '¿Cuándo recibe el vendedor el dinero de la venta?',
    answer:
      'El pago será liberado una vez que la operación haya finalizado correctamente y se hayan cumplido las condiciones previstas por la plataforma para garantizar una transacción segura.',
  },
  {
    question: '¿Puedo cancelar una compra o una venta?',
    answer:
      'Las posibilidades de cancelación dependerán del estado de la operación. Una vez iniciada una transacción, podrán aplicarse las condiciones establecidas en los Términos y Condiciones de Tickets Transfer.',
  },
  {
    question: '¿Qué métodos de pago están disponibles?',
    answer:
      'Los métodos de pago habilitados podrán variar según la región y serán informados al momento de realizar la operación dentro de la aplicación.',
  },
  {
    question: '¿Cómo protege Tickets Transfer mi información personal?',
    answer:
      'Toda la información personal es tratada conforme a nuestra Política de Privacidad. Implementamos medidas técnicas y organizativas destinadas a proteger los datos de nuestros usuarios y prevenir accesos no autorizados.',
  },
  {
    question: '¿Cómo puedo comunicarme con el soporte?',
    answer:
      'Nuestro equipo de atención al usuario se encuentra disponible a través del Centro de Ayuda de la aplicación. También podrás contactarnos mediante nuestros canales oficiales para recibir asistencia sobre compras, ventas, verificaciones o cualquier otra consulta.',
  },
  {
    question: '¿Qué debo hacer si detecto una actividad sospechosa?',
    answer:
      'Si observás una publicación fraudulenta, recibís mensajes sospechosos o detectás cualquier comportamiento inusual, comunicate inmediatamente con nuestro equipo de soporte. Analizaremos el caso y, si corresponde, tomaremos las medidas necesarias para proteger a la comunidad.',
  },
  {
    question: '¿Puedo transferir una entrada comprada en Tickets Transfer a otra persona?',
    answer:
      'Sí, siempre que la ticketera emisora y el organizador del evento permitan la transferencia de esa entrada. Algunas entradas pueden estar sujetas a restricciones específicas.',
  },
  {
    question: '¿Qué diferencia a Tickets Transfer de una compra realizada por redes sociales?',
    answer:
      'En Tickets Transfer las operaciones se realizan dentro de una plataforma diseñada para brindar mayor seguridad, incorporando procesos de verificación de identidad, gestión protegida de pagos, seguimiento de la operación y asistencia del equipo de soporte. Esto reduce significativamente los riesgos asociados a transacciones informales realizadas por redes sociales o aplicaciones de mensajería.',
  },
];

function FaqEntry({ index, item }: { index: number; item: FaqItem }) {
  return (
    <View style={styles.item}>
      <Text style={styles.q}>
        {index + 1}. {item.question}
      </Text>
      {item.answer ? <Text style={styles.a}>{item.answer}</Text> : null}
      {item.bullets?.map((bullet) => (
        <View key={bullet} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
      {item.footer ? <Text style={styles.footer}>{item.footer}</Text> : null}
    </View>
  );
}

export function PreguntasFrecuentesScreen() {
  const navigation = useNavigation();
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Preguntas frecuentes"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <SupportChannelsBlock />
        <View style={[styles.card, glassCard]}>
          {FAQ.map((item, index) => (
            <FaqEntry key={item.question} index={index} item={item} />
          ))}
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  card: { padding: spacing.lg },
  item: { marginBottom: spacing.lg },
  q: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 6, lineHeight: 21 },
  a: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, paddingLeft: 4 },
  bulletDot: { color: colors.primaryLight, fontSize: 14, lineHeight: 21, width: 14 },
  bulletText: { flex: 1, color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  footer: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 6 },
});
