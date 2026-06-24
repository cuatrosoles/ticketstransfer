/**
 * Tarjeta horizontal para el listado de Tienda (sin stub de ticket).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { MarketplacePublicItem } from '../lib/api';
import { formatEventLocationDisplay } from '@tickets-transfer/shared';
import { EventCoverImage } from './EventCoverImage';
import { GradientButton } from './GradientButton';
import { colors, spacing } from '../theme';
import { neonGlow } from '../lib/neonStyles';

const COVER_SIZE = { width: 108, height: 96 };

type Props = {
  item: MarketplacePublicItem;
  formatEventDateTime: (iso: string | Date) => string;
  onPress: () => void;
  favoriteActive?: boolean;
  onFavoritePress?: () => void;
};

export function StoreEventListCard({
  item,
  formatEventDateTime,
  onPress,
  favoriteActive,
  onFavoritePress,
}: Props) {
  return (
    <View style={[styles.card, neonGlow('#38bdf8', 'soft')]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.coverWrap} onPress={onPress} activeOpacity={0.9}>
          <EventCoverImage
            eventImageUrl={item.eventImageUrl}
            category={item.category}
            height={COVER_SIZE.height}
            showGlyph={false}
            style={styles.cover}
          />
        </TouchableOpacity>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.titlePress} onPress={onPress} activeOpacity={0.9}>
              <Text style={styles.title} numberOfLines={2}>
                {item.eventName}
              </Text>
            </TouchableOpacity>
            {onFavoritePress ? (
              <TouchableOpacity
                style={styles.favBtn}
                onPress={onFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={favoriteActive ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <FontAwesome
                  name={favoriteActive ? 'heart' : 'heart-o'}
                  size={16}
                  color={favoriteActive ? '#f472b6' : '#e2e8f0'}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <View style={styles.metaRow}>
              <FontAwesome name="calendar" size={12} color="#93c5fd" style={styles.metaIcon} />
              <Text style={styles.meta} numberOfLines={1}>
                {formatEventDateTime(item.eventDate)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <FontAwesome name="map-marker" size={13} color="#93c5fd" style={styles.metaIcon} />
              <Text style={styles.meta} numberOfLines={2}>
                {formatEventLocationDisplay(item)}
              </Text>
            </View>
          </TouchableOpacity>

          <GradientButton title="Ver entradas" onPress={onPress} size="compact" style={styles.cta} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.55)',
    backgroundColor: 'rgba(13, 36, 82, 0.78)',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  coverWrap: {
    width: COVER_SIZE.width,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cover: {
    width: COVER_SIZE.width,
    borderRadius: 12,
    marginBottom: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  titlePress: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 18,
  },
  favBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 3,
  },
  metaIcon: {
    marginTop: 1,
    width: 14,
    textAlign: 'center',
  },
  meta: {
    flex: 1,
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 15,
  },
  cta: {
    alignSelf: 'flex-end',
    marginTop: 4,
    minWidth: 128,
  },
});
