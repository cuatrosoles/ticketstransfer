/**
 * Botón reutilizable para capturar GPS y mostrar coordenadas capturadas.
 */

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { formatCoordinates } from '@tickets-transfer/shared';
import { getCurrentDeviceLocation, showLocationError } from '../lib/geolocation';
import { colors } from '../theme';

type Props = {
  label?: string;
  latitude: number | null;
  longitude: number | null;
  onCapture: (coords: { latitude: number; longitude: number }) => void;
  onClear?: () => void;
  disabled?: boolean;
};

export function LocationCaptureButton({
  label = 'Usar mi ubicación actual',
  latitude,
  longitude,
  onCapture,
  onClear,
  disabled,
}: Props) {
  const [loading, setLoading] = React.useState(false);

  const capture = async () => {
    setLoading(true);
    try {
      const loc = await getCurrentDeviceLocation();
      onCapture(loc);
    } catch (e) {
      showLocationError(e instanceof Error ? e.message : 'No se pudo obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };

  const hasCoords = latitude != null && longitude != null;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
        onPress={capture}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryLight} size="small" />
        ) : (
          <Text style={styles.btnText}>{label}</Text>
        )}
      </TouchableOpacity>
      {hasCoords ? (
        <View style={styles.coordsRow}>
          <Text style={styles.coordsText}>
            {formatCoordinates(latitude!, longitude!)}
          </Text>
          {onClear ? (
            <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearText}>Quitar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <Text style={styles.hint}>
          Opcional. Mejora el filtro de eventos cercanos y la precisión del mapa del evento.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacingMd },
  btn: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.primaryLight, fontWeight: '600', fontSize: 14 },
  coordsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  coordsText: { color: colors.textMuted, fontSize: 12, flex: 1 },
  clearText: { color: colors.accent, fontSize: 12 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});

const spacingMd = 12;
