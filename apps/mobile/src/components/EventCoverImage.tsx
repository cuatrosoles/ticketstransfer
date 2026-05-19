/**
 * Portada de evento con fallback visual por categoría.
 */

import * as React from 'react';
import { View, Image, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ensureImageUrl } from '../lib/api';
import { colors } from '../theme';

const CATEGORY_FALLBACKS: Record<string, string> = {
  MUSICA: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
  DEPORTES: 'https://images.unsplash.com/photo-1461896836934-ffe607be7d0e?auto=format&fit=crop&w=800&q=80',
  TEATRO: 'https://images.unsplash.com/photo-1503090549741-5a710f340b0b?auto=format&fit=crop&w=800&q=80',
  FESTIVALES: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
  OTRO: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
};

function categoryFallback(category?: string | null): string {
  return CATEGORY_FALLBACKS[category || ''] || CATEGORY_FALLBACKS.OTRO;
}

type Props = {
  eventImageUrl?: string | null;
  category?: string | null;
  height: number;
  style?: StyleProp<ViewStyle>;
  /** Muestra ícono decorativo si no hay imagen */
  showGlyph?: boolean;
};

export function EventCoverImage({ eventImageUrl, category, height, style, showGlyph = true }: Props) {
  const [failed, setFailed] = React.useState(false);
  const remote = ensureImageUrl(eventImageUrl);
  const fallback = categoryFallback(category);
  const uri = !failed && remote ? remote : fallback;

  return (
    <View style={[styles.zone, { height }, style]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        onError={() => setFailed(true)}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.05)', 'rgba(15, 23, 42, 0.55)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {showGlyph && !remote ? <View style={styles.glyphWrap} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.card,
  },
  glyphWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
