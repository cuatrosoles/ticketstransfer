/**
 * Modal con mapa para confirmar o ajustar la ubicación con un pin arrastrable.
 */

import * as React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { getAddressMapHtml } from '../lib/addressMapHtml';
import { reverseGeocodeFromApi } from '../lib/addressGeocode';
import { GradientButton } from './GradientButton';
import { colors } from '../theme';

type Coords = { latitude: number; longitude: number };

type Props = {
  visible: boolean;
  initialLatitude: number;
  initialLongitude: number;
  onConfirm: (coords: Coords) => void | Promise<void>;
  onCancel: () => void;
  confirming?: boolean;
};

export function AddressMapConfirmModal({
  visible,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onCancel,
  confirming,
}: Props) {
  const { height } = useWindowDimensions();
  const mapHeight = Math.min(360, Math.max(260, height * 0.42));
  const [coords, setCoords] = React.useState<Coords>({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [preview, setPreview] = React.useState('');
  const [previewBusy, setPreviewBusy] = React.useState(false);
  const previewTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setCoords({ latitude: initialLatitude, longitude: initialLongitude });
    setPreview('');
  }, [visible, initialLatitude, initialLongitude]);

  React.useEffect(
    () => () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    },
    []
  );

  const schedulePreview = (lat: number, lng: number) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      setPreviewBusy(true);
      try {
        const geo = await reverseGeocodeFromApi(lat, lng);
        setPreview(geo.displayName);
      } catch {
        setPreview('');
      } finally {
        setPreviewBusy(false);
      }
    }, 450);
  };

  const onWebMessage = (raw: string) => {
    try {
      const data = JSON.parse(raw) as { type?: string; latitude?: number; longitude?: number };
      if (data.type !== 'coords' || data.latitude == null || data.longitude == null) return;
      setCoords({ latitude: data.latitude, longitude: data.longitude });
      schedulePreview(data.latitude, data.longitude);
    } catch {
      /* ignore */
    }
  };

  React.useEffect(() => {
    if (!visible) return;
    schedulePreview(initialLatitude, initialLongitude);
  }, [visible, initialLatitude, initialLongitude]);

  const html = React.useMemo(
    () => getAddressMapHtml(initialLatitude, initialLongitude),
    [initialLatitude, initialLongitude]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Cerrar mapa" />
        <View style={styles.sheet}>
          <Text style={styles.title}>Confirmá tu dirección</Text>
          <Text style={styles.subtitle}>
            Mové el pin en el mapa para mayor precisión. Completamos calle, número, ciudad y código postal.
            Piso y depto los cargás manualmente.
          </Text>
          <View style={[styles.mapWrap, { height: mapHeight }]}>
            <WebView
              key={`${initialLatitude}-${initialLongitude}`}
              source={{ html }}
              originWhitelist={['*']}
              onMessage={(e) => onWebMessage(e.nativeEvent.data)}
              style={styles.map}
              scrollEnabled={false}
              javaScriptEnabled
              domStorageEnabled
            />
          </View>
          <View style={styles.previewWrap}>
            {previewBusy ? (
              <ActivityIndicator color={colors.primaryLight} size="small" />
            ) : preview ? (
              <Text style={styles.previewText} numberOfLines={2}>
                {preview}
              </Text>
            ) : (
              <Text style={styles.previewHint}>Tocá el mapa o arrastrá el pin para ajustar la ubicación.</Text>
            )}
          </View>
          <View style={styles.actions}>
            <GradientButton
              title="CANCELAR"
              variant="secondary"
              onPress={onCancel}
              disabled={confirming}
              style={styles.actionBtn}
              textStyle={styles.actionBtnText}
            />
            <GradientButton
              title="CONFIRMAR"
              onPress={() => onConfirm(coords)}
              loading={confirming}
              disabled={confirming}
              style={styles.actionBtn}
              textStyle={styles.actionBtnText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 12, textAlign: 'center' },
  mapWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    backgroundColor: '#1e293b',
  },
  map: { flex: 1, backgroundColor: 'transparent' },
  previewWrap: { minHeight: 44, justifyContent: 'center', marginTop: 10, marginBottom: 12 },
  previewText: { color: '#e2e8f0', fontSize: 13, lineHeight: 18 },
  previewHint: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
  actionBtnText: { fontSize: 13 },
});
