import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { SupportChannelsBlock } from '../components/SupportChannelsBlock';
import { useBranding } from '../context/BrandingContext';
import { colors, glassCard, spacing } from '../theme';

export function RecomendacionesQuejasScreen() {
  const navigation = useNavigation();
  const { supportEmail } = useBranding();
  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Recomendaciones y quejas"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        <SupportChannelsBlock />
        <View style={[styles.card, glassCard]}>
          <Text style={styles.title}>Canal de sugerencias</Text>
          <Text style={styles.body}>
            Si querés dejarnos una recomendación o reportar una queja, escribinos por Chat Soporte (asistente) o, si
            figura arriba, por email al equipo{supportEmail ? ` (${supportEmail})` : ''}, indicando: número de orden,
            fecha y una breve descripción. Nuestro equipo revisa cada caso.
          </Text>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  card: { padding: spacing.lg },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
});
