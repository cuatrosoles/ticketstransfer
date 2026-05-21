/**
 * Onboarding de gustos – tipos de eventos que le interesan al usuario.
 */

import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { PREFERENCIAS_EVENTO } from '@tickets-transfer/shared';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { completeTasteOnboarding } from '../lib/api';
import { useBranding } from '../context/BrandingContext';
import { colors, spacing, radius } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PreferencesOnboarding'>;

export function PreferencesOnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const brand = useBranding();
  const { clearPostRegisterRedirectToPreferences } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onContinue = async () => {
    if (selected.length === 0) {
      setError('Elegí al menos un tipo de evento');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await completeTasteOnboarding(selected);
      clearPostRegisterRedirectToPreferences();
      navigation.replace('Main', { screen: 'Home' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar tus preferencias');
    } finally {
      setLoading(false);
    }
  };

  const onSkip = () => {
    clearPostRegisterRedirectToPreferences();
    navigation.replace('Main', { screen: 'Home' });
  };

  return (
    <AuthBackground>
      <ScreenHeader title="¿Qué te gusta?" showBack={false} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Elegí los tipos de eventos que más te interesan. Usaremos esto para recomendarte entradas en Inicio.
        </Text>

        <View style={styles.grid}>
          {PREFERENCIAS_EVENTO.map((pref) => {
            const active = selected.includes(pref.id);
            return (
              <TouchableOpacity
                key={pref.id}
                style={[
                  styles.chip,
                  active && { borderColor: brand.primaryLight, backgroundColor: 'rgba(37, 99, 235, 0.35)' },
                ]}
                onPress={() => toggle(pref.id)}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{pref.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <GradientButton title="Continuar" onPress={onContinue} loading={loading} disabled={loading} />
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip} disabled={loading}>
          <Text style={styles.skipText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '800',
  },
  error: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    color: '#93c5fd',
    fontSize: 15,
    fontWeight: '600',
  },
});
