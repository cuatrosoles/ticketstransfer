/**
 * Editor de preferencias de eventos (perfil).
 */

import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PREFERENCIAS_EVENTO, labelForPreferencia } from '@tickets-transfer/shared';
import { updateUserPreferences, type UserPreferences } from '../lib/api';
import { GradientButton } from './GradientButton';
import { useBranding } from '../context/BrandingContext';
import { colors, spacing, radius } from '../theme';

type Props = {
  preferences: UserPreferences;
  onUpdated: (prefs: UserPreferences) => void;
};

export function EventPreferencesEditor({ preferences, onUpdated }: Props) {
  const brand = useBranding();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(preferences.eventPreferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = async () => {
    if (selected.length === 0) {
      setError('Elegí al menos un tipo de evento');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateUserPreferences(selected);
      onUpdated(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <View style={styles.block}>
        <View style={styles.head}>
          <Text style={styles.title}>Eventos que te gustan</Text>
          <TouchableOpacity onPress={() => { setSelected(preferences.eventPreferences); setEditing(true); }}>
            <Text style={[styles.link, { color: brand.primaryLight }]}>Editar</Text>
          </TouchableOpacity>
        </View>
        {preferences.eventPreferences.length === 0 ? (
          <Text style={styles.muted}>Aún no configuraste tus gustos. Tocá Editar para personalizar recomendaciones.</Text>
        ) : (
          <View style={styles.tags}>
            {preferences.eventPreferences.map((id) => (
              <View key={id} style={styles.tag}>
                <Text style={styles.tagText}>{labelForPreferencia(id)}</Text>
              </View>
            ))}
          </View>
        )}
        {preferences.topCategories.length > 0 ? (
          <Text style={styles.hint}>
            También aprendemos de lo que ves y guardás:{' '}
            {preferences.topCategories.map((t) => t.label).join(', ')}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <Text style={styles.title}>Editar gustos</Text>
      <View style={styles.grid}>
        {PREFERENCIAS_EVENTO.map((pref) => {
          const active = selected.includes(pref.id);
          return (
            <TouchableOpacity
              key={pref.id}
              style={[styles.chip, active && { borderColor: brand.primaryLight, backgroundColor: 'rgba(37, 99, 235, 0.35)' }]}
              onPress={() => toggle(pref.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{pref.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <View style={styles.actions}>
        {saving ? (
          <ActivityIndicator color={brand.primaryLight} />
        ) : (
          <>
            <GradientButton title="Guardar" onPress={save} style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.lg, gap: spacing.sm },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: colors.white },
  link: { fontSize: 14, fontWeight: '700' },
  muted: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  hint: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic', marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderRadius: radius,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  tagText: { color: '#bfdbfe', fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius,
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: colors.white, fontWeight: '800' },
  err: { color: '#f87171', fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  cancel: { padding: spacing.sm },
  cancelText: { color: '#93c5fd', fontWeight: '600' },
});
