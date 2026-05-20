/**
 * Tarjeta marketplace: stub vertical (misma textura que Comprar / publicar).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { TicketStubBackground } from './TicketStubBackground';
import { EventCoverImage } from './EventCoverImage';
import { colors, spacing } from '../theme';
import type { MarketplacePublicItem } from '../lib/api';
import { formatEventLocationDisplay } from '@tickets-transfer/shared';

/** Espacio reservado sobre la franja decorativa del PNG (código de barras) para que el texto no se solape. */
const BARCODE_SAFE_INSET = 52;

const TITLE_LINE_HEIGHT = 20;

type Props = {
  item: MarketplacePublicItem;
  onPress: () => void;
  /** Menos padding y tipografía para el listado compacto del inicio */
  compact?: boolean;
  /** Altura mínima del stub (inicio: más alto que ancho ⇒ orientación vertical leg) */
  minFrameHeight?: number;
  /** Altura fija del stub (Tienda). */
  frameHeight?: number;
  /** Reserva exactamente N líneas para el título (min y max). Usado en Tienda. */
  fixedTitleLines?: number;
  formatEventDateTime: (iso: string | Date) => string;
  /** Favoritos: corazón flotante; no dispara la tarjeta */
  favoriteActive?: boolean;
  onFavoritePress?: () => void;
};

export function MarketplaceTicketCard({
  item,
  onPress,
  compact,
  minFrameHeight,
  frameHeight,
  fixedTitleLines,
  formatEventDateTime,
  favoriteActive,
  onFavoritePress,
}: Props) {
  const isPortraitStub =
    (frameHeight != null && frameHeight > 0) || (minFrameHeight != null && minFrameHeight > 0);
  const fillCell = frameHeight != null && frameHeight > 0;
  const padH = compact ? spacing.lg : spacing.xl;
  const padTop = compact ? spacing.lg : spacing.lg;
  const padBottom = isPortraitStub
    ? BARCODE_SAFE_INSET + (compact ? spacing.sm : spacing.md)
    : compact
      ? spacing.lg
      : spacing.lg;
  return (
    <View style={[styles.wrap, fillCell && styles.wrapFill]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={fillCell ? styles.pressableFill : undefined}
        accessibilityRole="button"
        accessibilityLabel={`${item.eventName}, comprar ticket`}
      >
        <TicketStubBackground
          backgroundOrientation="portrait"
          style={styles.stub}
          minFrameHeight={fillCell ? undefined : minFrameHeight}
          frameHeight={frameHeight}
          contentStyle={{
            paddingHorizontal: padH,
            paddingTop: padTop,
            paddingBottom: padBottom,
          }}
        >
          <EventCoverImage
            eventImageUrl={item.eventImageUrl}
            category={item.category}
            height={compact ? 64 : 78}
            showGlyph={false}
            style={styles.cover}
          />
          {fixedTitleLines != null && fixedTitleLines > 0 ? (
            <View
              style={[
                styles.eventTitleBox,
                { height: TITLE_LINE_HEIGHT * fixedTitleLines },
                compact && styles.eventTitleBoxCompact,
              ]}
            >
              <Text
                style={[
                  styles.event,
                  compact && styles.eventCompact,
                  { lineHeight: TITLE_LINE_HEIGHT },
                ]}
                numberOfLines={fixedTitleLines}
              >
                {item.eventName}
              </Text>
            </View>
          ) : (
            <Text style={[styles.event, compact && styles.eventCompact]} numberOfLines={2}>
              {item.eventName}
            </Text>
          )}
          <View style={[styles.perforation, compact && styles.perforationCompact]} />
          <Text style={[styles.meta, compact && styles.metaCompact]} numberOfLines={2}>
            {formatEventDateTime(item.eventDate)}
          </Text>
          <Text style={[styles.meta, compact && styles.metaCompact]} numberOfLines={2}>
            {formatEventLocationDisplay(item)}
          </Text>
          <Text style={[styles.seller, compact && styles.sellerCompact]} numberOfLines={2}>
            {item.seller.displayName} ({item.seller.reputationScore} pts)
          </Text>
          <Text style={[styles.qty, compact && styles.qtyCompact]}>Cant.: {item.quantityEntries || '—'}</Text>
        </TicketStubBackground>
      </TouchableOpacity>
      {onFavoritePress ? (
        <TouchableOpacity
          style={styles.fabFav}
          onPress={onFavoritePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={favoriteActive ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <FontAwesome name={favoriteActive ? 'heart' : 'heart-o'} size={18} color={favoriteActive ? '#f472b6' : '#f1f5f9'} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative' },
  wrapFill: { flex: 1, height: '100%', overflow: 'hidden' },
  pressableFill: { flex: 1, height: '100%' },
  stub: { width: '100%', flex: 1 },
  cover: { borderRadius: 10, marginBottom: spacing.sm },
  fabFav: {
    position: 'absolute',
    top: 10,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    zIndex: 20,
    elevation: 8,
  },
  event: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    lineHeight: TITLE_LINE_HEIGHT,
  },
  eventTitleBox: {
    width: '100%',
    marginBottom: spacing.xs,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  eventTitleBoxCompact: { marginBottom: spacing.sm },
  eventCompact: { fontSize: 12 },
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
