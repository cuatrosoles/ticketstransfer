/**
 * Datos del vendedor: nombre, usuario, verificaciones, reputación y ventas concretadas.
 */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors, spacing } from '../theme';
import { neonGlassPanel } from '../lib/neonStyles';

export type SellerInfo = {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  reputationScore?: number | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kyc?: { status: string } | null;
  completedSalesCount?: number | null;
};

type Props = {
  seller: SellerInfo;
};

function sellerDisplayName(seller: SellerInfo): string {
  const full = [seller.firstName, seller.lastName].filter(Boolean).join(' ');
  return full || seller.username || '—';
}

function VerificationRow({ label, approved }: { label: string; approved: boolean }) {
  return (
    <View style={styles.verificationRow}>
      <Text style={styles.rowLabel}>{label}:</Text>
      {approved ? (
        <View style={styles.approvedWrap}>
          <FontAwesome name="check-circle" size={14} color="#22c55e" style={styles.checkIcon} />
          <Text style={styles.approvedText}>Aprobado</Text>
        </View>
      ) : (
        <Text style={styles.pendingText}>Sin verificar</Text>
      )}
    </View>
  );
}

export function SellerInfoBlock({ seller }: Props) {
  const kycApproved = seller.kyc?.status === 'APROBADO';

  return (
    <View style={styles.block}>
      <Text style={styles.sellerTitle}>VENDEDOR: {sellerDisplayName(seller).toUpperCase()}</Text>
      <Text style={styles.row}>USUARIO: {seller.username || '—'}</Text>
      <VerificationRow label="VERIFICACIÓN KYC" approved={kycApproved} />
      <VerificationRow label="VERIFICACIÓN EMAIL" approved={!!seller.emailVerified} />
      <VerificationRow label="VERIFICACIÓN CELULAR" approved={!!seller.phoneVerified} />
      <Text style={styles.row}>REPUTACIÓN: {seller.reputationScore ?? 0} PTS</Text>
      <Text style={styles.row}>VENTAS CONCRETADAS: {seller.completedSalesCount ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    ...neonGlassPanel,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: 6,
  },
  sellerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  row: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textMuted,
    flexShrink: 0,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  approvedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkIcon: { marginTop: 1 },
  approvedText: { fontSize: 13, color: '#22c55e', fontWeight: '600' },
  pendingText: { fontSize: 13, color: colors.textMuted },
});
