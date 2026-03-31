/**
 * Tarjeta marketplace: stub vertical (misma textura que Comprar / publicar).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TicketStubBackground } from './TicketStubBackground';
import { colors, spacing } from '../theme';
import type { MarketplacePublicItem } from '../lib/api';

type Props = {
  item: MarketplacePublicItem;
  onPress: () => void;
  /** Menos padding y tipografía para el listado compacto del inicio */
  compact?: boolean;
  formatEventDateTime: (iso: string | Date) => string;
};

export function MarketplaceTicketCard({
  item,
  onPress,
  compact,
  formatEventDateTime,
}: Props) {
  const pad = compact ? spacing.sm : spacing.md;
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
        contentStyle={{ padding: pad, paddingBottom: compact ? spacing.sm : spacing.md }}
      >
        <Text style={[styles.event, compact && styles.eventCompact]} numberOfLines={2}>
          {item.eventName}
        </Text>
        <View style={styles.perforation} />
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
  eventCompact: { fontSize: 12, marginBottom: 4 },
  perforation: {
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.4)',
    marginVertical: spacing.xs,
  },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  metaCompact: { fontSize: 11, marginBottom: 2 },
  seller: { fontSize: 12, color: colors.primaryLight, marginTop: 2, marginBottom: 2 },
  sellerCompact: { fontSize: 11 },
  qty: { fontSize: 12, fontWeight: '600', color: colors.text },
  qtyCompact: { fontSize: 11 },
});
