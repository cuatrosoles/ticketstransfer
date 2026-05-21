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
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ProfileImageProvider } from './src/context/ProfileImageContext';
import { PostPublishLoadingProvider } from './src/context/PostPublishLoadingContext';
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
      OrderPaymentResult: {
        path: 'orden/:orderId/pago/resultado',
        parse: {
          status: (value: string) =>
            value === 'failure' || value === 'pending' ? value : 'success',
        },
      },
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
            <FavoritesProvider>
              <ProfileImageProvider>
                <NavigationContainer ref={navigationRef} linking={linking}>
                  <PostPublishLoadingProvider>
                    <FcmConversationOpener navigationRef={navigationRef} />
                    <FcmForegroundMessageSync />
                    <RootNavigator />
                  </PostPublishLoadingProvider>
                </NavigationContainer>
              </ProfileImageProvider>
            </FavoritesProvider>
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
