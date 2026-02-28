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

const linking = {
  prefixes: ['ticketTransfer://'],
  config: {
    screens: {
      OrderPago: 'orden/:orderId/pago',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileImageProvider>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </ProfileImageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
