/**
 * Enlaces de soporte desde branding (admin → Firestore).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useBranding } from '../context/BrandingContext';
import { colors, spacing, radius, glassCard } from '../theme';

function normalizeUrl(url: string): string {
  const t = url.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function SupportChannelsBlock() {
  const { supportEmail, helpCenterUrl, registrationDisclaimer } = useBranding();
  const hasChannels = !!(supportEmail || helpCenterUrl);

  return (
    <View style={[styles.wrap, glassCard]}>
      {hasChannels ? (
        <>
          <Text style={styles.title}>Contacto humano</Text>
          <Text style={styles.sub}>Además del asistente, podés usar estos canales:</Text>
          <View style={styles.row}>
            {supportEmail ? (
              <TouchableOpacity
                style={styles.btn}
                onPress={() => void Linking.openURL(`mailto:${supportEmail}`)}
                accessibilityRole="link"
                accessibilityLabel={`Enviar email a ${supportEmail}`}
              >
                <FontAwesome name="envelope" size={16} color={colors.white} />
                <Text style={styles.btnText}>{supportEmail}</Text>
              </TouchableOpacity>
            ) : null}
            {helpCenterUrl ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnOutline]}
                onPress={() => void Linking.openURL(normalizeUrl(helpCenterUrl))}
                accessibilityRole="link"
                accessibilityLabel="Abrir centro de ayuda"
              >
                <FontAwesome name="external-link" size={16} color={colors.primaryLight} />
                <Text style={[styles.btnText, styles.btnTextOutline]}>Centro de ayuda</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      ) : (
        <Text style={styles.hint}>
          El administrador puede configurar email y centro de ayuda en Admin → Configuración → Ajustes de usuarios.
        </Text>
      )}
      {registrationDisclaimer ? (
        <Text style={[styles.disclaimer, hasChannels && styles.disclaimerSpaced]}>{registrationDisclaimer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 4,
  },
  sub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  btnText: { color: colors.white, fontWeight: '600', fontSize: 14, flexShrink: 1 },
  btnTextOutline: { color: colors.primaryLight },
  disclaimer: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  disclaimerSpaced: { marginTop: spacing.md },
});
