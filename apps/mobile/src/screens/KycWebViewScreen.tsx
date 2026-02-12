/**
 * WebView para flujo Didit KYC – captura de documento y liveness check.
 * Detecta redirect al callback (ticketTransfer://kyc/callback) para cerrar.
 */

import * as React from 'react';
import { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { WebView } from 'react-native-webview';
import { AuthBackground } from '../components/AuthBackground';
import { colors } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'KycWebView'>;
type KycWebViewRoute = RouteProp<RootStackParamList, 'KycWebView'>;

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export function KycWebViewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<KycWebViewRoute>();
  const { sessionUrl } = route.params;

  useEffect(() => {
    const handler = (event: { url: string }) => {
      if (
        event.url.startsWith('ticketTransfer://') ||
        event.url.includes('/kyc/callback')
      ) {
        navigation.goBack();
      }
    };
    const sub = Linking.addEventListener('url', handler);
    return () => sub.remove();
  }, [navigation]);

  const handleShouldStartLoad = (request: { url: string }) => {
    const url = request.url || '';
    if (url.startsWith('ticketTransfer://') || url.includes('/kyc/callback')) {
      navigation.goBack();
      return false;
    }
    return true;
  };

  return (
    <AuthBackground>
      <View style={styles.container}>
        <WebView
          source={{ uri: sessionUrl }}
          userAgent={USER_AGENT}
          originWhitelist={['https://*', 'http://*', 'ticketTransfer://*']}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          domStorageEnabled={true}
          androidHardwareAccelerationDisabled={false}
          androidLayerType="hardware"
          onNavigationStateChange={(nav) => {
            const u = nav.url || '';
            if (u.startsWith('ticketTransfer://') || u.includes('/kyc/callback')) {
              navigation.goBack();
            }
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando verificación...</Text>
            </View>
          )}
          style={styles.webview}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    gap: 12,
  },
  loadingText: { color: colors.primaryLight, fontSize: 16 },
  closeBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
  },
  closeBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
});
