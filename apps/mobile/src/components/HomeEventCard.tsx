/**
 * Tarjetas estilo portada Home (imagen degradada + datos + chip precio).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { MarketplacePublicItem } from '../lib/api';
import { colors, spacing } from '../theme';

export function formatListingPrice(price?: number | null): string {
  if (price == null || Number.isNaN(price)) return 'Consultar';
  return `$${Math.round(price).toLocaleString('es-AR')}`;
}

type Props = {
  item: MarketplacePublicItem;
  formatEventDateTime: (iso: string | Date) => string;
  onPress: () => void;
  variant: 'featured' | 'carousel';
  /** Ancho fijo para carrusel */
  carouselWidth?: number;
  /** Muestra corazón sobre la zona gráfica (no dispara `onPress` de la tarjeta) */
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
  const imgH = variant === 'featured' ? 118 : 92;
  const containerStyle =
    variant === 'carousel' && carouselWidth != null ? [styles.card, { width: carouselWidth }] : [styles.card, styles.cardFeaturedFlex];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${item.eventName}, comprar`}
    >
      <View style={[styles.imageZone, { height: imgH }]}>
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.55)', 'rgba(15, 23, 42, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.glyph}>♪</Text>
        {showFavoriteToggle && onFavoritePress ? (
          <TouchableOpacity
            style={styles.favBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onFavoritePress}
            accessibilityRole="button"
            accessibilityLabel={favoriteActive ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <FontAwesome name={favoriteActive ? 'heart' : 'heart-o'} size={18} color={favoriteActive ? '#f472b6' : '#f1f5f9'} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.eventName}
        </Text>
        <Text style={styles.meta} numberOfLines={2}>
          {formatEventDateTime(item.eventDate)}
        </Text>
        <Text style={styles.meta} numberOfLines={2}>
          {item.eventPlace || '—'}
        </Text>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>{formatListingPrice(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    marginBottom: spacing.sm,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  cardFeaturedFlex: {
    flex: 1,
    minWidth: 0,
  },
  imageZone: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glyph: { fontSize: 42, color: 'rgba(248, 250, 252, 0.35)', fontWeight: '700' },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    zIndex: 4,
  },
  body: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 18,
  },
  meta: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 14,
  },
  pricePill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
  },
  priceText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
});
