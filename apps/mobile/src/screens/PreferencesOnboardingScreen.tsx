/**
 * Onboarding de gustos – checkboxes con íconos, ubicación y card neón (Cap15).
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { RootStackParamList } from '../navigation/types';
import { PREFERENCIAS_EVENTO } from '@tickets-transfer/shared';
import { AuthBackground } from '../components/AuthBackground';
import { GradientButton } from '../components/GradientButton';
import { LocationCaptureButton } from '../components/LocationCaptureButton';
import { useAuth } from '../context/AuthContext';
import { completeTasteOnboarding, updateUserLocation } from '../lib/api';
import { addressFieldsFromReverseGeocode, reverseGeocodeFromApi } from '../lib/addressGeocode';
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA } from '../data/provinciasArgentina';
import { colors, spacing } from '../theme';
import { neonCardStrong, neonGlow } from '../lib/neonStyles';

const PREF_ICONS: Record<string, string> = {
  MUSICA: 'music',
  DEPORTES: 'futbol-o',
  TEATRO: 'ticket',
  STAND_UP: 'microphone',
  FESTIVALES: 'star',
  OTRO: 'ellipsis-h',
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'PreferencesOnboarding'>;

export function PreferencesOnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { clearPostRegisterRedirectToPreferences } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [pickerModal, setPickerModal] = useState<'province' | 'city' | null>(null);

  const cities = province ? (CIUDADES_POR_PROVINCIA[province] ?? []) : [];

  useEffect(() => {
    if (!province) setCity('');
  }, [province]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onContinue = async () => {
    if (selected.length < 2) {
      setError('Tildá al menos 2 casillas');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await completeTasteOnboarding(selected);
      if (latitude != null && longitude != null) {
        await updateUserLocation({ latitude, longitude, locationSource: 'gps' }).catch(() => {});
      }
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

  const handleGpsCapture = async ({ latitude: lat, longitude: lng }: { latitude: number; longitude: number }) => {
    setLocationBusy(true);
    try {
      setLatitude(lat);
      setLongitude(lng);
      const geo = await reverseGeocodeFromApi(lat, lng);
      const fields = addressFieldsFromReverseGeocode(geo);
      if (fields.province) {
        const match = PROVINCIAS_ARGENTINA.find(
          (p) => p.nombre === fields.province || p.id === fields.province
        );
        if (match) setProvince(match.id);
      }
      if (fields.city) setCity(fields.city);
      await updateUserLocation({ latitude: lat, longitude: lng, locationSource: 'gps' });
    } finally {
      setLocationBusy(false);
    }
  };

  const pickerItems =
    pickerModal === 'province'
      ? PROVINCIAS_ARGENTINA.map((p) => ({ id: p.id, label: p.nombre }))
      : cities.map((c) => ({ id: c, label: c }));

  return (
    <AuthBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, neonCardStrong]}>
          <Text style={styles.title}>Eventos que te interesan</Text>
          <Text style={styles.subtitle}>
            Seleccioná los tipos de eventos que te interesan para recomendarte más en base a tus gustos. (Tildá al
            menos 2 casillas)
          </Text>

          {PREFERENCIAS_EVENTO.map((pref) => {
            const active = selected.includes(pref.id);
            return (
              <TouchableOpacity
                key={pref.id}
                style={styles.row}
                onPress={() => toggle(pref.id)}
                activeOpacity={0.85}
              >
                <View style={styles.rowIcon}>
                  <FontAwesome name={PREF_ICONS[pref.id] ?? 'circle'} size={20} color="#60a5fa" />
                </View>
                <Text style={styles.rowLabel}>{pref.label}</Text>
                <View style={[styles.checkbox, active && styles.checkboxActive, active && neonGlow('#38bdf8', 'soft')]}>
                  {active ? <FontAwesome name="check" size={14} color="#ffffff" /> : null}
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={styles.locationSection}>
            <Text style={styles.locationTitle}>Tu ubicación</Text>
            <Text style={styles.locationHint}>Para mostrarte eventos cerca tuyo en el feed.</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setPickerModal('province')}>
              <Text style={styles.pickerLabel}>Provincia</Text>
              <Text style={styles.pickerValue}>
                {province ? PROVINCIAS_ARGENTINA.find((p) => p.id === province)?.nombre ?? province : 'Seleccionar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerBtn, !province && styles.pickerDisabled]}
              onPress={() => province && setPickerModal('city')}
              disabled={!province}
            >
              <Text style={styles.pickerLabel}>Ciudad</Text>
              <Text style={styles.pickerValue}>{city || 'Seleccionar'}</Text>
            </TouchableOpacity>
            <LocationCaptureButton
              label="Usar mi ubicación actual"
              latitude={latitude}
              longitude={longitude}
              onCapture={handleGpsCapture}
              loading={locationBusy}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.skipHint}>
            Podés omitir este paso (se recomendarán eventos al azar o por localización)
          </Text>

          <View style={styles.actions}>
            <GradientButton title="OMITIR" variant="secondary" onPress={onSkip} disabled={loading} style={styles.actionBtn} />
            <GradientButton
              title="SIGUIENTE"
              onPress={onContinue}
              loading={loading}
              disabled={loading}
              style={[styles.actionBtn, neonGlow('#3b82f6', 'strong')]}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={pickerModal != null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setPickerModal(null)}>
          <View style={[styles.modalBox, neonCardStrong]}>
            <ScrollView style={{ maxHeight: 360 }}>
              {pickerItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.modalItem}
                  onPress={() => {
                    if (pickerModal === 'province') {
                      setProvince(item.id);
                      setCity('');
                    } else {
                      setCity(item.label);
                    }
                    setPickerModal(null);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 2,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.15)',
  },
  rowIcon: {
    width: 32,
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#93c5fd',
  },
  locationSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(96, 165, 250, 0.2)',
    gap: spacing.sm,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#93c5fd',
  },
  locationHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pickerBtn: {
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  pickerDisabled: { opacity: 0.45 },
  pickerLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  pickerValue: { fontSize: 15, color: colors.white, fontWeight: '600' },
  error: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  skipHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    paddingVertical: 8,
    maxHeight: '70%',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.12)',
  },
  modalItemText: {
    color: colors.white,
    fontSize: 15,
  },
});
