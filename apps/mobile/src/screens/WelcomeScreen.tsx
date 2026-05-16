/**
 * Bienvenida – mockup Nuevo Acceso (spotlight, arte hero, ACERCA con íconos, CTAs).
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
import { useBranding } from '../context/BrandingContext';

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
  const brand = useBranding();
  const { width } = useWindowDimensions();

  const spotlightSize = Math.min(width * 1.35, 520);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0c1936', '#070d18']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoRow}>
            <View style={styles.ticketBadge}>
              {brand.logoUrl ? (
                <Image source={{ uri: brand.logoUrl }} style={styles.ticketLogoImg} resizeMode="contain" />
              ) : (
                <Text style={styles.ticketLogoText}>Tickets Transfer</Text>
              )}
            </View>
          </View>

          <View style={[styles.hero, { minHeight: spotlightSize * 0.62 }]}>
            <View
              pointerEvents="none"
              style={[
                styles.ring3,
                {
                  width: spotlightSize,
                  height: spotlightSize,
                  borderRadius: spotlightSize / 2,
                  marginTop: -spotlightSize * 0.42,
                },
              ]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.ring2,
                {
                  width: spotlightSize * 0.72,
                  height: spotlightSize * 0.72,
                  borderRadius: (spotlightSize * 0.72) / 2,
                  marginTop: -spotlightSize * 0.33,
                },
              ]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(0, 120, 255, 0.55)', 'rgba(0, 80, 220, 0.12)', 'transparent']}
              style={[
                styles.spotCore,
                {
                  width: spotlightSize * 0.5,
                  height: spotlightSize * 0.5,
                  borderRadius: (spotlightSize * 0.5) / 2,
                  marginTop: -spotlightSize * 0.28,
                },
              ]}
            />
            <Image
              source={require('../assets/images/welcome-hero-ref.png')}
              style={[styles.heroArt, { width: width * 0.92, maxWidth: 380, height: width * 0.78, maxHeight: 300 }]}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['transparent', 'rgba(7, 13, 24, 0.5)', '#070d18']}
              style={styles.crowdFade}
              pointerEvents="none"
            />
          </View>

          <Text style={styles.headline}>¡BIENVENIDOS!</Text>
          <Text style={styles.subhead}>A la mejor experiencia en compra y venta de tickets</Text>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>ACERCA DE LA APP:</Text>
            <Text style={styles.aboutBody}>{ACERCA_PARAGRAPH}</Text>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <FontAwesome name={f.icon} size={20} color="#f8fafc" />
                  {f.icon === 'shield' ? (
                    <Text style={styles.shieldTick}>✓</Text>
                  ) : null}
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
  root: { flex: 1, backgroundColor: '#070d18' },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 36,
    alignItems: 'center',
  },
  logoRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    zIndex: 3,
  },
  ticketBadge: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(248, 250, 252, 0.85)',
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
  },
  ticketLogoImg: {
    width: '100%',
    height: 44,
  },
  ticketLogoText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  ring3: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.14)',
    backgroundColor: 'transparent',
  },
  ring2: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.22)',
    backgroundColor: 'transparent',
  },
  spotCore: {
    position: 'absolute',
    opacity: 0.95,
  },
  heroArt: {
    marginTop: -12,
    zIndex: 2,
  },
  crowdFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    zIndex: 2,
  },
  headline: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subhead: {
    marginTop: 10,
    fontSize: 15,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  aboutCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(13, 36, 82, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.35)',
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
    width: '100%',
    maxWidth: 360,
    gap: 14,
    flexDirection: 'column',
  },
});
