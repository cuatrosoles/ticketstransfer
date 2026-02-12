/**
 * Fondo idéntico a web. Web: bg-pattern + bg-pattern-auth::after.
 * Gradiente visible: azul brillante arriba → oscuro abajo.
 */

import * as React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export function AuthBackground({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const authH = height * 0.42;

  return (
    <View style={styles.container}>
      {/* Base: linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%) */}
      <LinearGradient
        colors={['#0f172a', '#1e3a5f', '#0f172a']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.34, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* ::after: gradiente superior azul brillante, 40vh, bordes redondeados */}
      <View
        style={[
          styles.authTop,
          {
            height: authH,
            borderBottomLeftRadius: width * 0.5,
            borderBottomRightRadius: width * 0.5,
            overflow: 'hidden',
          },
        ]}
      >
        <LinearGradient
          colors={['#1e3a8a', '#2563eb', '#3b82f6', 'rgba(59, 130, 246, 0.25)']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.27, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  authTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
