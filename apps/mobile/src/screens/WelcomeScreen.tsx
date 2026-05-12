/**
 * Bienvenida – ACERCA DE LA APP, Iniciar sesión, Registrarme.
 * Layout idéntico a web: maxWidth 420 card, 320 botones, gradiente, glass.
 */

import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { GradientButton } from '../components/GradientButton';
import { useBranding } from '../context/BrandingContext';

const ACERCA_DE_LA_APP =
  'TICKETS TRANSFER ES UNA APP PARA LA REVENTA O INTERCAMBIO DE ENTRADAS-BOLETOS DIGITALES CON LA NUEVA METODOLOGÍA DE QR MEDIANTE APPS TERCIARIZADAS AL SER DESCARGADAS DE SUS TICKETERAS DE ORIGEN PARA SHOWS Y EVENTOS EN ARGENTINA DE FORMA SEGURA Y CONFIABLE, PARA EVITAR POSIBLES ESTAFAS O FRAUDES. FUNCIONAMOS COMO MEDIADORES ENTRE EL VENDEDOR Y COMPRADOR. ESPERAMOS QUE TU VENTA O INTERCAMBIO SEA EXITOSA. ¡GRACIAS POR CONFIAR EN TICKETS TRANSFER!';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const brand = useBranding();

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="¡BIENVENIDOS!" logoUri={brand.logoUrl} />
        {brand.tagline ? (
          <Text style={[styles.tagline, { color: brand.primaryLight }]}>{brand.tagline}</Text>
        ) : null}
        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ACERCA DE LA APP:</Text>
            <Text style={styles.cardText}>{ACERCA_DE_LA_APP}</Text>
          </View>
        </View>
        <View style={styles.buttonsWrap}>
          <GradientButton title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
          <GradientButton title="Registrarme" variant="secondary" onPress={() => navigation.navigate('Register')} />
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingBottom: 48, paddingHorizontal: 24, flexGrow: 1, alignItems: 'center' },
  tagline: { fontSize: 14, textAlign: 'center', marginBottom: 12, marginTop: -8, paddingHorizontal: 8 },
  cardWrap: { width: '100%', maxWidth: 420, marginBottom: 32 },
  card: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 8, letterSpacing: 0.02 * 16 },
  cardText: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  buttonsWrap: { width: '100%', maxWidth: 320, gap: 12, flexDirection: 'column' as const },
});
