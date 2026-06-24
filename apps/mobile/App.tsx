/**
 * Entrada de la app móvil Tickets Transfer
 * Ubicación: apps/mobile/App.tsx
 */

import * as React from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { BrandingProvider } from './src/context/BrandingContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ProfileImageProvider } from './src/context/ProfileImageContext';
import { PostPublishLoadingProvider } from './src/context/PostPublishLoadingContext';
import { FcmConversationOpener } from './src/components/FcmConversationOpener';
import { FcmForegroundMessageSync } from './src/components/FcmForegroundMessageSync';
import { VideoBackground } from './src/components/VideoBackground';
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
const TRANSPARENT_BG = { backgroundColor: 'transparent' as const };

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

type ComponentWithDefaultProps = {
  defaultProps?: { style?: object | object[] | undefined };
};

function applyTransparentBackground<T extends ComponentWithDefaultProps>(Component: T): T {
  Component.defaultProps = Component.defaultProps ?? {};
  Component.defaultProps.style = [TRANSPARENT_BG, Component.defaultProps.style];
  return Component;
}

const TextWithDefaults = Text as typeof Text & ComponentWithDefaultProps;
const TextInputWithDefaults = TextInput as typeof TextInput & ComponentWithDefaultProps;
const ScrollViewWithDefaults = ScrollView as typeof ScrollView & ComponentWithDefaultProps;
const FlatListWithDefaults = FlatList as typeof FlatList & ComponentWithDefaultProps;
const SafeAreaViewWithDefaults = SafeAreaView as typeof SafeAreaView & ComponentWithDefaultProps;

TextWithDefaults.defaultProps = TextWithDefaults.defaultProps ?? {};
TextWithDefaults.defaultProps.style = [{ fontFamily: BODY_FONT }, TextWithDefaults.defaultProps.style];

TextInputWithDefaults.defaultProps = TextInputWithDefaults.defaultProps ?? {};
TextInputWithDefaults.defaultProps.style = [{ fontFamily: BODY_FONT }, TextInputWithDefaults.defaultProps.style];

applyTransparentBackground(ScrollViewWithDefaults);
applyTransparentBackground(FlatListWithDefaults);
applyTransparentBackground(SafeAreaViewWithDefaults);

export default function App() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [splashFinished, setSplashFinished] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState<string | undefined>();

  const onSplashFinished = React.useCallback(() => {
    setSplashFinished(true);
  }, []);

  const syncRoute = React.useCallback(() => {
    setCurrentRoute(navigationRef.getCurrentRoute()?.name);
  }, [navigationRef]);

  const showVideoBackground =
    splashFinished && currentRoute !== undefined && currentRoute !== 'Welcome';

  return (
    <SafeAreaProvider style={styles.flex}>
      <View style={styles.flex}>
        <BrandingProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ProfileImageProvider>
                {showVideoBackground ? (
                  <View style={styles.backgroundLayer} pointerEvents="none">
                    <VideoBackground />
                  </View>
                ) : null}
                <View style={styles.navLayer}>
                  <NavigationContainer
                    ref={navigationRef}
                    linking={linking}
                    theme={navigationTheme}
                    onReady={syncRoute}
                    onStateChange={syncRoute}
                  >
                    <PostPublishLoadingProvider>
                      <FcmConversationOpener navigationRef={navigationRef} />
                      <FcmForegroundMessageSync />
                      <RootNavigator />
                    </PostPublishLoadingProvider>
                  </NavigationContainer>
                </View>
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
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  navLayer: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
