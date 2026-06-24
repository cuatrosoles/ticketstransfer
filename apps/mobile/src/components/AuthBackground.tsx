/**
 * Contenedor transparente: el fondo fluido vive en App.tsx (una sola instancia).
 */

import * as React from 'react';
import { View } from 'react-native';
import { screenRoot } from '../theme';

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return <View style={screenRoot}>{children}</View>;
}
