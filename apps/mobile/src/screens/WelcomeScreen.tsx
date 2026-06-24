/**
 * Bienvenida – imagen INICIO con transición suave, card ACERCA y CTAs (Cap01).
 */

import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { RootStackParamList } from '../navigation/types';
import { GradientButton } from '../components/GradientButton';
import { ImageEdgeFade } from '../components/ImageEdgeFade';
import { neonGlassPanel } from '../lib/neonStyles';
import {
  WELCOME_BACKGROUND_COLOR,
  IMAGE_EDGE_FADE_BOTTOM_SIZE,
  IMAGE_EDGE_FADE_TOP_SIZE,
} from '../lib/imageEdgeFade';

const HERO_IMAGE = require('../assets/images/INICIO-1080x1920.png');

const ACERCA_PARAGRAPH =
  'Tickets Transfer es una app para comprar, vender e intercambiar entradas digitales en Argentina de forma segura y confiable. Mediamos entre comprador y vendedor para evitar estafas y fraudes. Apostamos al QR verificado y a tickets emitidos por ticketeras oficiales.';

const FEATURES: Array<{ icon: string; title: string; description: string }> = [
  {
    icon: 'shield',
    title: '100% Segura y confiable',
    description: 'Operamos como intermediarios verificados para proteger cada transacción.',
  },
  {
    icon: 'qrcode',
    title: 'QR y tickets digitales',
    description: 'Flujo pensado para entradas descargadas desde apps y ticketeras de origen.',
  },
  {
    icon: 'users',
    title: 'Comunidad transparente',
    description: 'Perfiles con reputación para que sepás con quién estás operando.',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { width, height } = useWindowDimensions();
  const heroHeight = Math.min(height * 1.00, width * 1.60);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#020617', '#020617']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { height: heroHeight }]}>
            <ImageEdgeFade
              top={{ size: IMAGE_EDGE_FADE_TOP_SIZE, color: WELCOME_BACKGROUND_COLOR }}
              bottom={{ size: IMAGE_EDGE_FADE_BOTTOM_SIZE, color: WELCOME_BACKGROUND_COLOR }}
              style={{ width, height: heroHeight }}
            >
              <Image
                source={HERO_IMAGE}
                style={{ width, height: heroHeight }}
                resizeMode="cover"
              />
            </ImageEdgeFade>
          </View>

          <View style={[styles.aboutCard, neonGlassPanel]}>
            <Text style={styles.aboutTitle}>ACERCA DE LA APP:</Text>
            <Text style={styles.aboutBody}>{ACERCA_PARAGRAPH}</Text>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <FontAwesome name={f.icon} size={28} color="#f8fafc" />
                  {f.icon === 'shield' ? <Text style={styles.shieldTick}>✓</Text> : null}
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.buttonsWrap}>
            <GradientButton title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
            <GradientButton title="Registrarme" variant="secondary" onPress={() => navigation.navigate('Register')} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 0,
    paddingBottom: 36,
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  aboutCard: {
    width: '86%',
    maxWidth: 440,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: -38,
    marginBottom: 28,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#93c5fd',
    letterSpacing: 1,
    marginBottom: 12,
  },
  aboutBody: {
    fontSize: 13,
    color: '#f1f5f9',
    lineHeight: 21,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 34, 72, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldTick: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    fontSize: 11,
    fontWeight: '900',
    color: '#bfdbfe',
  },
  featureText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#93c5fd',
  },
  featureDesc: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 17,
  },
  buttonsWrap: {
    width: '86%',
    maxWidth: 360,
    gap: 14,
    flexDirection: 'column',
  },
});
