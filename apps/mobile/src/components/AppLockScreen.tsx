import * as React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthBackground } from './AuthBackground';
import { colors, radius, spacing } from '../theme';

type Props = {
  unlocking: boolean;
  onUnlock: () => void;
  onLogout: () => void;
};

export function AppLockScreen({ unlocking, onUnlock, onLogout }: Props) {
  return (
    <AuthBackground>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Aplicación bloqueada</Text>
          <Text style={styles.subtitle}>Validá tu identidad para continuar.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onUnlock} disabled={unlocking}>
            {unlocking ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryText}>Desbloquear con biometría</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onLogout} disabled={unlocking}>
            <Text style={styles.secondaryText}>Ingresar con contraseña</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  primaryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryText: {
    color: colors.primaryLight,
    fontWeight: '600',
    fontSize: 15,
  },
});
