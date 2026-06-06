/**
 * Fondo cósmico con degradado y partículas en movimiento lento (Cap07).
 * Fijo respecto al viewport; el contenido scrollea encima.
 */

import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Particle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
};

function buildParticles(count: number, w: number, h: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: 1 + Math.random() * 2.2,
      opacity: 0.15 + Math.random() * 0.65,
      driftX: (Math.random() - 0.5) * 28,
      driftY: (Math.random() - 0.5) * 22,
      duration: 12000 + Math.random() * 18000,
    });
  }
  return out;
}

function ParticleLayer({ particles }: { particles: Particle[] }) {
  const anims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((anim, i) => {
      const p = particles[i];
      anim.setValue(0);
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: p.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: p.duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    });
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims, particles]);

  return (
    <>
      {particles.map((p, i) => {
        const translateX = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.driftX],
        });
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.driftY],
        });
        return (
          <Animated.View
            key={`star-${i}`}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                opacity: p.opacity,
                transform: [{ translateX }, { translateY }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

export function CosmicBackground({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const particles = useMemo(() => buildParticles(72, width, height), [width, height]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0a1628', '#0c2347', '#0a1628', '#020617']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(37, 99, 235, 0.18)', 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.sideGlow, { height }]}
        pointerEvents="none"
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ParticleLayer particles={particles} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  sideGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#e0f2fe',
  },
});
