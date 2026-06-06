/**
 * Tarjetas estilo portada Home – variantes featured / nearby / recommended (Cap16).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { MarketplacePublicItem } from '../lib/api';
import { formatEventLocationDisplay } from '@tickets-transfer/shared';
import { EventCoverImage } from './EventCoverImage';
import { colors, spacing } from '../theme';
import { neonGlow } from '../lib/neonStyles';

export function formatListingPrice(price?: number | null): string {
  if (price == null || Number.isNaN(price)) return 'Consultar';
  return `$${Math.round(price).toLocaleString('es-AR')}`;
}

/** Alturas fijas por sección para uniformidad (Cap16) */
export const HOME_CARD_HEIGHTS = {
  featured: 268,
  nearby: 220,
  recommended: 188,
} as const;

export const HOME_CARD_WIDTHS = {
  featured: 0,
  nearby: 196,
  recommended: 148,
} as const;

type Variant = 'featured' | 'nearby' | 'recommended';

type Props = {
  item: MarketplacePublicItem;
  formatEventDateTime: (iso: string | Date) => string;
  onPress: () => void;
  variant: Variant;
  carouselWidth?: number;
  showFavoriteToggle?: boolean;
  favoriteActive?: boolean;
  onFavoritePress?: () => void;
};

export function HomeEventCard({
  item,
  formatEventDateTime,
  onPress,
  variant,
  carouselWidth,
  showFavoriteToggle,
  favoriteActive,
  onFavoritePress,
}: Props) {
  const cardHeight = HOME_CARD_HEIGHTS[variant];
  const fixedWidth =
    variant === 'featured'
      ? undefined
      : carouselWidth ?? HOME_CARD_WIDTHS[variant];

  const imgH =
    variant === 'featured' ? 132 : variant === 'nearby' ? 88 : 72;

  const containerStyle = [
    styles.card,
    neonGlow('#38bdf8', variant === 'featured' ? 'strong' : 'soft'),
    { height: cardHeight },
    fixedWidth != null ? { width: fixedWidth } : styles.cardFeaturedFlex,
  ];

  const priceBadge = (
    <View style={styles.pricePill}>
      <Text style={styles.priceText}>{formatListingPrice(item.price)}</Text>
    </View>
  );

  const favBtn =
    showFavoriteToggle && onFavoritePress ? (
      <TouchableOpacity
        style={styles.favBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={onFavoritePress}
        accessibilityRole="button"
        accessibilityLabel={favoriteActive ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <FontAwesome name={favoriteActive ? 'heart' : 'heart-o'} size={16} color={favoriteActive ? '#f472b6' : '#f1f5f9'} />
      </TouchableOpacity>
    ) : null;

  const metaBlock = (
    <>
      <Text style={[styles.title, variant === 'recommended' && styles.titleSm]} numberOfLines={2}>
        {item.eventName}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {formatEventDateTime(item.eventDate)}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {formatEventLocationDisplay(item)}
      </Text>
    </>
  );

  if (variant === 'nearby') {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.92}>
        {favBtn}
        <View style={[styles.body, styles.nearbyBodyTop]}>
          {metaBlock}
        </View>
        <View style={styles.nearbyImageWrap}>
          <EventCoverImage eventImageUrl={item.eventImageUrl} category={item.category} height={imgH} showGlyph />
          <View style={styles.priceOverlay}>{priceBadge}</View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.coverWrap}>
        <EventCoverImage eventImageUrl={item.eventImageUrl} category={item.category} height={imgH} showGlyph />
        {favBtn}
      </View>
      <View style={styles.body}>
        {metaBlock}
        {priceBadge}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.65)',
    backgroundColor: 'rgba(13, 36, 82, 0.78)',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  cardFeaturedFlex: {
    flex: 1,
    minWidth: 0,
  },
  coverWrap: {
    position: 'relative',
    width: '100%',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 3,
    justifyContent: 'flex-start',
  },
  nearbyBodyTop: {
    flex: 0,
    paddingBottom: 6,
    paddingTop: spacing.sm,
  },
  nearbyImageWrap: {
    flex: 1,
    position: 'relative',
    marginTop: 'auto',
  },
  priceOverlay: {
    position: 'absolute',
    left: 8,
    bottom: 8,
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    zIndex: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 18,
  },
  titleSm: {
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 14,
  },
  pricePill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.55)',
  },
  priceText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
});
