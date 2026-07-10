/**
 * Detalle de evento en formato texto (sin forma de ticket).
 */

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { neonGlassPanel } from '../lib/neonStyles';
import { formatDate } from '../lib/datetime';

export type EventDetailsData = {
  eventName: string;
  eventDate?: string | null;
  eventPlace?: string | null;
  sector?: string | null;
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  price?: number | null;
  currency?: string | null;
  ticketera?: string | null;
  appBoletos?: string | null;
  orderRef?: string | null;
  listingId?: string | null;
};

type Props = {
  data: EventDetailsData;
  showFull?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function EventDetailsPanel({ data, showFull = true }: Props) {
  return (
    <View style={styles.panel}>
      {data.listingId ? <DetailRow label="ID" value={data.listingId} /> : null}
      <DetailRow label="EVENTO" value={data.eventName} />
      {data.eventDate ? <DetailRow label="FECHA" value={formatDate(data.eventDate)} /> : null}
      <DetailRow label="LUGAR" value={data.eventPlace || '—'} />
      {data.sector ? <DetailRow label="SECTOR" value={data.sector} /> : null}
      {data.quantityEntries ? <DetailRow label="CANTIDAD DE ENTRADAS" value={data.quantityEntries} /> : null}
      {showFull ? (
        <>
          {data.seat ? <DetailRow label="BUTACA-ASIENTO" value={data.seat} /> : null}
          {data.row ? <DetailRow label="FILA" value={data.row} /> : null}
          {data.price != null && data.currency ? (
            <DetailRow
              label="PRECIO"
              value={`${data.currency} $${Number(data.price).toLocaleString('es-AR')}`}
            />
          ) : null}
          {data.ticketera ? <DetailRow label="TICKETERA" value={data.ticketera} /> : null}
          {data.appBoletos ? <DetailRow label="APP DE BOLETOS" value={data.appBoletos} /> : null}
          {data.orderRef ? <DetailRow label="CÓDIGO DE ORDEN" value={data.orderRef} /> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    ...neonGlassPanel,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: 8,
  },
  row: {
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
