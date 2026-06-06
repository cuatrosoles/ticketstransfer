/**
 * Fondo global autenticado – degradado cósmico + partículas (Cap07).
 */

import * as React from 'react';
import { CosmicBackground } from './CosmicBackground';

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return <CosmicBackground>{children}</CosmicBackground>;
}
