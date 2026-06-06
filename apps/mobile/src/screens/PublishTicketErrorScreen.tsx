/**
 * Pantalla de error tras fallar la publicación – mascot y card neón (Cap12).
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { RootStackParamList } from '../navigation/types';
import { AuthBackground } from '../components/AuthBackground';
import { GradientButton } from '../components/GradientButton';
import { neonGlow } from '../lib/neonStyles';
import { colors, spacing } from '../theme';

const MASCOT_IMAGE = require('../assets/images/TicketNoPublicado-5922x6191.png');

type Nav = NativeStackNavigationProp<RootStackParamList, 'PublishError'>;
type Route = RouteProp<RootStackParamList, 'PublishError'>;

export function PublishTicketErrorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { message } = route.params;
  const { width } = useWindowDimensions();

  const mascotScale = useRef(new Animated.Value(0.6)).current;
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(mascotScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(mascotOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardTranslate, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [mascotScale, mascotOpacity, cardTranslate, cardOpacity]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.5, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowPulse]);

  const mascotSize = Math.min(width * 0.52, 240);

  const retry = () => {
    navigation.goBack();
  };

  const goToMisTickets = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'MisTickets' } }],
    });
  };

  const goToSupport = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Main', params: { screen: 'MisTickets' } },
        { name: 'ChatSoporte' },
      ],
    });
  };

  return (
    <AuthBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.wrap}>
          <Animated.View
            style={[
              styles.glowRing,
              neonGlow('#f87171', 'soft'),
              {
                width: mascotSize + 48,
                height: mascotSize + 48,
                borderRadius: (mascotSize + 48) / 2,
                opacity: glowPulse,
              },
            ]}
          />
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
              neonGlow('#f87171', 'soft'),
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslate }],
              },
            ]}
          >
            <View style={styles.errorCircle}>
              <FontAwesome name="times" size={22} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>No se pudo publicar</Text>
            <Text style={styles.cardBody}>
              {message || 'Ocurrió un error al publicar tu ticket. Revisá los datos e intentá de nuevo.'}
            </Text>
            <Text style={styles.cardHint}>
              Si el problema persiste, contactá a soporte desde el menú o el botón de abajo.
            </Text>

            <View style={styles.actions}>
              <GradientButton title="REINTENTAR" variant="secondary" onPress={retry} style={styles.actionBtn} />
              <GradientButton title="VOLVER" onPress={goToMisTickets} style={styles.actionBtn} />
            </View>

            <GradientButton
              title="Chat soporte"
              variant="secondary"
              onPress={goToSupport}
              style={styles.supportBtn}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  glowRing: {
    position: 'absolute',
    top: spacing.xl + 20,
    borderWidth: 2,
    borderColor: 'rgba(248, 113, 113, 0.65)',
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
  },
  mascot: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    zIndex: 2,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginTop: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.45)',
    backgroundColor: 'rgba(13, 36, 82, 0.78)',
  },
  errorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.55)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardBody: {
    fontSize: 15,
    color: '#fecaca',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  cardHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  supportBtn: {
    width: '100%',
    height: 46,
  },
});
