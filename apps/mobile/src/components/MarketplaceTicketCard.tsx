/**
 * Tarjeta marketplace: stub vertical (misma textura que Comprar / publicar).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TicketStubBackground } from './TicketStubBackground';
import { colors, spacing } from '../theme';
import type { MarketplacePublicItem } from '../lib/api';

/** Espacio reservado sobre la franja decorativa del PNG (código de barras) para que el texto no se solape. */
const BARCODE_SAFE_INSET = 52;

type Props = {
  item: MarketplacePublicItem;
  onPress: () => void;
  /** Menos padding y tipografía para el listado compacto del inicio */
  compact?: boolean;
  /** Altura mínima del stub (inicio: más alto que ancho ⇒ orientación vertical leg) */
  minFrameHeight?: number;
  formatEventDateTime: (iso: string | Date) => string;
};

export function MarketplaceTicketCard({
  item,
  onPress,
  compact,
  minFrameHeight,
  formatEventDateTime,
}: Props) {
  const isPortraitStub = minFrameHeight != null && minFrameHeight > 0;
  const padH = compact ? spacing.lg : spacing.xl;
  const padTop = compact ? spacing.lg : spacing.lg;
  const padBottom = isPortraitStub
    ? BARCODE_SAFE_INSET + (compact ? spacing.sm : spacing.md)
    : compact
      ? spacing.lg
      : spacing.lg;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${item.eventName}, comprar ticket`}
    >
      <TicketStubBackground
        backgroundOrientation="portrait"
        style={styles.stub}
        minFrameHeight={minFrameHeight}
        contentStyle={{
          paddingHorizontal: padH,
          paddingTop: padTop,
          paddingBottom: padBottom,
        }}
      >
        <Text style={[styles.event, compact && styles.eventCompact]} numberOfLines={2}>
          {item.eventName}
        </Text>
        <View style={[styles.perforation, compact && styles.perforationCompact]} />
        <Text style={[styles.meta, compact && styles.metaCompact]} numberOfLines={2}>
          {formatEventDateTime(item.eventDate)}
        </Text>
        <Text style={[styles.meta, compact && styles.metaCompact]} numberOfLines={2}>
          {item.eventPlace || '—'}
        </Text>
        <Text style={[styles.seller, compact && styles.sellerCompact]} numberOfLines={2}>
          {item.seller.displayName} ({item.seller.reputationScore} pts)
        </Text>
        <Text style={[styles.qty, compact && styles.qtyCompact]}>Cant.: {item.quantityEntries || '—'}</Text>
      </TicketStubBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  stub: { width: '100%' },
  event: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventCompact: { fontSize: 12, marginBottom: spacing.sm },
  perforation: {
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.4)',
    marginVertical: spacing.xs,
  },
  perforationCompact: { marginVertical: spacing.sm },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  metaCompact: { fontSize: 11, marginBottom: 5 },
  seller: { fontSize: 12, color: colors.primaryLight, marginTop: 4, marginBottom: 0 },
  sellerCompact: { fontSize: 11, marginTop: 2, marginBottom: 0 },
  qty: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  qtyCompact: { fontSize: 11 },
});
