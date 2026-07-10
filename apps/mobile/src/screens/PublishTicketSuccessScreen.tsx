/**
 * Pantalla de éxito tras publicar ticket – barra de carga, mascot y card neón (Cap11–Cap12).
 */

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Clipboard from '@react-native-clipboard/clipboard';
import type { RootStackParamList } from '../navigation/types';
import { AuthBackground } from '../components/AuthBackground';
import { GradientButton } from '../components/GradientButton';
import { neonCardStrong, neonGlow } from '../lib/neonStyles';
import { colors, spacing } from '../theme';

const MASCOT_IMAGE = require('../assets/images/TicketPublicado-6054x6055.png');

type Nav = NativeStackNavigationProp<RootStackParamList, 'PublishSuccess'>;
type Route = RouteProp<RootStackParamList, 'PublishSuccess'>;

export function PublishTicketSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listingId } = route.params;
  const { width } = useWindowDimensions();

  const [phase, setPhase] = useState<'loading' | 'success'>('loading');
  const progress = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(0.6)).current;
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.sequence([
      Animated.timing(progress, { toValue: 0.72, duration: 1200, useNativeDriver: false }),
      Animated.timing(progress, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setPhase('success');
      Animated.parallel([
        Animated.spring(mascotScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(mascotOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]).start();
    });
  }, [progress, mascotScale, mascotOpacity, cardTranslate, cardOpacity]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  /** El PNG ya incluye el círculo neón; se muestra grande, sin anillo exterior adicional. */
  const mascotSize = Math.min(width * 0.78, 300);

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home', params: { refreshListings: true } } }],
    });
  };

  const copyCode = () => {
    if (listingId) Clipboard.setString(listingId);
  };

  if (phase === 'loading') {
    return (
      <AuthBackground>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingTitle}>Publicando ticket…</Text>
            <View style={[styles.progressTrack, neonGlow('#38bdf8', 'soft')]}>
              <Animated.View style={[styles.progressBar, { width: barWidth }]} />
            </View>
          </View>
        </SafeAreaView>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.successWrap}>
          <Animated.Image
            source={MASCOT_IMAGE}
            style={[
              styles.mascot,
              {
                width: mascotSize,
                height: mascotSize,
                opacity: mascotOpacity,
                transform: [{ scale: mascotScale }],
              },
            ]}
            resizeMode="contain"
          />

          <Animated.View
            style={[
              styles.card,
              neonCardStrong,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslate }],
              },
            ]}
          >
            <View style={styles.checkCircle}>
              <FontAwesome name="check" size={22} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Listo</Text>
            <Text style={styles.cardBody}>Tu ticket fue publicado y ya está disponible.</Text>
            {listingId ? (
              <>
                <Text style={styles.codeLabel}>
                  Código: <Text style={styles.codeValue}>{listingId}</Text>
                </Text>
                <Text style={styles.codeHint}>Podés copiarlo para compartirlo.</Text>
              </>
            ) : null}

            <View style={styles.actionsBar}>
              {listingId ? (
                <TouchableOpacity style={styles.copyBtn} onPress={copyCode} activeOpacity={0.85}>
                  <FontAwesome name="copy" size={14} color="#ffffff" style={styles.copyIcon} />
                  <Text style={styles.copyBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                    COPIAR CÓDIGO
                  </Text>
                </TouchableOpacity>
              ) : null}
              <GradientButton title="OK" onPress={goHome} size="compact" style={styles.okBtn} />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  loadingTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#60a5fa',
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  mascot: {
    marginBottom: spacing.md,
    zIndex: 2,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.55)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  codeLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 4,
  },
  codeValue: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: 15,
  },
  codeHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    width: '100%',
    alignSelf: 'stretch',
  },
  copyBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  copyIcon: { flexShrink: 0 },
  copyBtnText: {
    flexShrink: 1,
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  okBtn: {
    width: 96,
    minHeight: 46,
    flexShrink: 0,
  },
});
