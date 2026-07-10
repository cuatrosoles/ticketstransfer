/**
 * Tarjeta horizontal para listados de compras/ventas (sin stub de ticket).
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { formatEventLocationDisplay } from '@tickets-transfer/shared';
import { EventCoverImage } from './EventCoverImage';
import { GradientButton } from './GradientButton';
import { colors, spacing } from '../theme';
import { neonGlow } from '../lib/neonStyles';

const COVER_SIZE = { width: 108, height: 96 };

type LocationLike = {
  eventPlace?: string | null;
  eventCity?: string | null;
  eventProvince?: string | null;
  eventCountry?: string | null;
};

type Props = {
  eventName: string;
  eventDate?: string | null;
  eventPlace?: string | null;
  eventImageUrl?: string | null;
  category?: string | null;
  subtitle?: string;
  extraLine?: string;
  buttonTitle: string;
  onPress: () => void;
  secondaryButton?: { title: string; onPress: () => void };
  formatEventDateTime: (iso: string | Date) => string;
};

export function OrderListCard({
  eventName,
  eventDate,
  eventPlace,
  eventImageUrl,
  category,
  subtitle,
  extraLine,
  buttonTitle,
  onPress,
  secondaryButton,
  formatEventDateTime,
}: Props) {
  const location: LocationLike = { eventPlace };

  return (
    <View style={[styles.card, neonGlow('#38bdf8', 'soft')]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.coverWrap} onPress={onPress} activeOpacity={0.9}>
          <EventCoverImage
            eventImageUrl={eventImageUrl}
            category={category}
            height={COVER_SIZE.height}
            showGlyph={false}
            style={styles.cover}
          />
        </TouchableOpacity>

        <View style={styles.body}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Text style={styles.title} numberOfLines={2}>
              {eventName}
            </Text>
            {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
            {eventDate ? (
              <View style={styles.metaRow}>
                <FontAwesome name="calendar" size={12} color="#93c5fd" style={styles.metaIcon} />
                <Text style={styles.meta} numberOfLines={1}>
                  {formatEventDateTime(eventDate)}
                </Text>
              </View>
            ) : null}
            {eventPlace ? (
              <View style={styles.metaRow}>
                <FontAwesome name="map-marker" size={13} color="#93c5fd" style={styles.metaIcon} />
                <Text style={styles.meta} numberOfLines={2}>
                  {formatEventLocationDisplay(location)}
                </Text>
              </View>
            ) : null}
            {extraLine ? <Text style={styles.extraLine} numberOfLines={1}>{extraLine}</Text> : null}
          </TouchableOpacity>

          <View style={styles.actions}>
            <GradientButton title={buttonTitle} onPress={onPress} size="compact" style={styles.cta} />
            {secondaryButton ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={secondaryButton.onPress} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>{secondaryButton.title}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
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
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#93c5fd',
    marginBottom: 4,
    fontWeight: '600',
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
  extraLine: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  cta: {
    minWidth: 128,
  },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
