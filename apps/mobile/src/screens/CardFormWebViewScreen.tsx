/**
 * WebView para agregar tarjeta – tokenización con Mercado Pago Checkout Bricks.
 * Recibe token vía postMessage y lo envía al backend.
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { getApiBase, addUserCard, getPayerEmail } from '../lib/api';
import { getCardFormHtml } from '../lib/cardFormHtml';
import { colors, spacing } from '../theme';

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export function CardFormWebViewScreen() {
  const navigation = useNavigation();
  const { height } = useWindowDimensions();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payerEmail, setPayerEmail] = useState<string>('test_payer_1@testuser.com');

  useEffect(() => {
    getPayerEmail().then(setPayerEmail).catch(() => {});
  }, []);

  const handleMessage = async (event: { nativeEvent: { data?: string } }) => {
    const data = event.nativeEvent.data;
    if (!data || submitting) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'CARD_TOKEN' && parsed.token) {
        setSubmitting(true);
        setError(null);
        try {
          await addUserCard(parsed.token);
          navigation.goBack();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Error al guardar la tarjeta');
          setSubmitting(false);
        }
      }
    } catch {
      // Ignorar mensajes que no son JSON o no tienen token
    }
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          title="Agregar tarjeta"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={[styles.webviewWrap, { minHeight: height - 160 }]}>
          <WebView
            source={{
              html: getCardFormHtml(getApiBase(), payerEmail),
              baseUrl: getApiBase(),
            }}
            userAgent={USER_AGENT}
            originWhitelist={['https://*', 'http://*']}
            onMessage={handleMessage}
            onHttpError={(e) => setError('Error al cargar el formulario')}
            javaScriptEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled={true}
            mixedContentMode="compatibility"
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando formulario...</Text>
              </View>
            )}
            style={styles.webview}
          />
        </View>
        {submitting && (
          <View style={styles.submitting}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.submittingText}>Guardando tarjeta...</Text>
          </View>
        )}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  errorWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  errorText: { color: '#ef4444', fontSize: 14 },
  webviewWrap: { width: '100%' },
  webview: { width: '100%', height: 500, backgroundColor: 'transparent' },
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
  submitting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  submittingText: { color: colors.primaryLight, fontSize: 14 },
  closeBtn: {
    marginTop: spacing.md,
    marginBottom: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 12,
  },
  closeBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
});
