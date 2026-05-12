import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { SupportChannelsBlock } from '../components/SupportChannelsBlock';
import { colors, glassCard, spacing } from '../theme';

const FAQ = [
  ['Como compro un ticket?', 'Podés comprar desde Inicio/Tienda o ingresando un ID privado en Comprar Ticket.'],
  ['Cuando se libera el dinero?', 'El pago queda retenido hasta que el comprador confirma la recepción correcta.'],
  ['Puedo cancelar una operación?', 'Si hay inconvenientes, abrí disputa desde el detalle de la operación.'],
  ['Cómo contacto soporte?', 'Usá el acceso Chat Soporte desde el menú o desde detalles del ticket. Si el equipo configuró email o centro de ayuda, aparecen arriba en esta pantalla.'],
];

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
          {FAQ.map(([q, a]) => (
            <View key={q} style={styles.item}>
              <Text style={styles.q}>{q}</Text>
              <Text style={styles.a}>{a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  card: { padding: spacing.lg },
  item: { marginBottom: spacing.md },
  q: { color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  a: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});
