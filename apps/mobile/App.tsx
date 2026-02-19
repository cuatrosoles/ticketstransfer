/**
 * Entrada de la app móvil Tickets Transfer
 * Ubicación: apps/mobile/App.tsx
 */

import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ProfileImageProvider } from './src/context/ProfileImageContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileImageProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ProfileImageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
