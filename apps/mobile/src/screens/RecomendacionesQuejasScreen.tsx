import * as React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { SupportChannelsBlock } from '../components/SupportChannelsBlock';
import { SocialIcons } from '../components/SocialIcons';
import { useBranding } from '../context/BrandingContext';
import { colors, glassCard, stackScreenContent, spacing, radius } from '../theme';

const RECOMMENDATIONS_EMAIL = 'RECOMENDACIONES@TICKETSTRANSFER.NET';
const COMPLAINTS_EMAIL = 'QUEJAS@TICKETSTRANSFER.NET';

function ContactEmailRow({ label, email }: { label: string; email: string }) {
  const openMail = () => {
    void Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  return (
    <TouchableOpacity style={styles.emailRow} onPress={openMail} activeOpacity={0.85}>
      <FontAwesome name="envelope" size={14} color="#93c5fd" style={styles.emailIcon} />
      <View style={styles.emailTextWrap}>
        <Text style={styles.emailLabel}>{label}</Text>
        <Text style={styles.emailValue}>{email}</Text>
      </View>
    </TouchableOpacity>
  );
}

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

          <Text style={styles.emailsTitle}>Emails de recomendaciones y quejas</Text>
          <ContactEmailRow label="Recomendaciones" email={RECOMMENDATIONS_EMAIL} />
          <ContactEmailRow label="Quejas" email={COMPLAINTS_EMAIL} />
        </View>

        <View style={[styles.socialCard, glassCard]}>
          <Text style={styles.socialTitle}>Seguinos en nuestras redes</Text>
          <SocialIcons />
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  card: { padding: spacing.lg, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginBottom: spacing.lg },
  emailsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.25)',
    marginBottom: spacing.sm,
  },
  emailIcon: { marginTop: 2 },
  emailTextWrap: { flex: 1, minWidth: 0 },
  emailLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  emailValue: { fontSize: 13, fontWeight: '700', color: '#93c5fd' },
  socialCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  socialTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
