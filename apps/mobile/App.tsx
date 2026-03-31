/**
 * Entrada de la app móvil Tickets Transfer
 * Ubicación: apps/mobile/App.tsx
 */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ProfileImageProvider } from './src/context/ProfileImageContext';
import { FcmConversationOpener } from './src/components/FcmConversationOpener';
import { SplashScreen } from './src/components/SplashScreen';
import type { RootStackParamList } from './src/navigation/types';
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
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [splashFinished, setSplashFinished] = React.useState(false);
  const onSplashFinished = React.useCallback(() => {
    setSplashFinished(true);
  }, []);

  return (
    <SafeAreaProvider style={styles.flex}>
      <View style={styles.flex}>
        <AuthProvider>
          <ProfileImageProvider>
            <NavigationContainer ref={navigationRef} linking={linking}>
              <FcmConversationOpener navigationRef={navigationRef} />
              <RootNavigator />
            </NavigationContainer>
          </ProfileImageProvider>
        </AuthProvider>
        {!splashFinished ? <SplashScreen onFinished={onSplashFinished} /> : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
