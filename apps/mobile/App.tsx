/**
 * Entrada de la app móvil Tickets Transfer
 * Ubicación: apps/mobile/App.tsx
 */

import * as React from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { BrandingProvider } from './src/context/BrandingContext';
import { ProfileImageProvider } from './src/context/ProfileImageContext';
import { FcmConversationOpener } from './src/components/FcmConversationOpener';
import { FcmForegroundMessageSync } from './src/components/FcmForegroundMessageSync';
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

const BODY_FONT = 'Cooper-Regular';

if (!Text.defaultProps) {
  Text.defaultProps = {};
}
Text.defaultProps.style = [{ fontFamily: BODY_FONT }, Text.defaultProps.style];

if (!TextInput.defaultProps) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.style = [{ fontFamily: BODY_FONT }, TextInput.defaultProps.style];

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [splashFinished, setSplashFinished] = React.useState(false);
  const onSplashFinished = React.useCallback(() => {
    setSplashFinished(true);
  }, []);

  return (
    <SafeAreaProvider style={styles.flex}>
      <View style={styles.flex}>
        <BrandingProvider>
          <AuthProvider>
            <ProfileImageProvider>
              <NavigationContainer ref={navigationRef} linking={linking}>
                <FcmConversationOpener navigationRef={navigationRef} />
                <FcmForegroundMessageSync />
                <RootNavigator />
              </NavigationContainer>
            </ProfileImageProvider>
          </AuthProvider>
          {!splashFinished ? <SplashScreen onFinished={onSplashFinished} /> : null}
        </BrandingProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
