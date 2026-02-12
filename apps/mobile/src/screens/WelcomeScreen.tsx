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
import { GradientButton } from '../components/GradientButton';

const ACERCA_DE_LA_APP =
  'TICKETS TRANSFER ES UNA APP PARA LA REVENTA O INTERCAMBIO DE ENTRADAS-BOLETOS DIGITALES EN ARGENTINA DE FORMA SEGURA. FUNCIONAMOS COMO MEDIADORES ENTRE VENDEDOR Y COMPRADOR. ¡GRACIAS POR CONFIAR EN TICKETS TRANSFER!';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
  content: { paddingTop: 260, paddingBottom: 48, paddingHorizontal: 24, flexGrow: 1, alignItems: 'center' },
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
