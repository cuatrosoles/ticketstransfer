/**
 * Modal de activación biométrica – se muestra tras login/register exitoso.
 * Pregunta si el usuario quiere activar FaceID/TouchID para inicio de sesión rápido.
 * Ubicación: apps/mobile/src/components/BiometricActivationModal.tsx
 */

import * as React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius } from '../theme';

interface BiometricActivationModalProps {
  visible: boolean;
  biometricType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
  onActivate: () => Promise<boolean>;
  onSkip: () => void;
  /** Llamado cuando la activación fue exitosa (para cerrar y navegar) */
  onSuccess?: () => void;
}

export function BiometricActivationModal({ visible, biometricType, onActivate, onSkip, onSuccess }: BiometricActivationModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const ok = await onActivate();
      if (ok) onSuccess?.();
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const label = biometricType === 'FaceID' ? 'Face ID' : biometricType === 'TouchID' ? 'Touch ID' : 'huella dactilar';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>¿Activar {label}?</Text>
          <Text style={styles.subtitle}>
            Podés usar {label} para iniciar sesión más rápido la próxima vez que abras la app.
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleActivate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Sí, activar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onSkip} disabled={loading}>
              <Text style={styles.secondaryButtonText}>No, gracias</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius * 2,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  buttons: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
