/**
 * Detalle de una publicación propia (vendedor): ver datos y capturas; editar desde aquí.
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { getMyListingDetail, ensureImageUrl, type MyListingDetail as Listing } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { EventDetailsPanel } from '../components/EventDetailsPanel';
import { EventCoverImage } from '../components/EventCoverImage';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, stackScreenContent } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MyListingDetail'>;
type Route = RouteProp<RootStackParamList, 'MyListingDetail'>;

export function MyListingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<'qr' | 'factura' | null>(null);

  useEffect(() => {
    getMyListingDetail(listingId)
      .then(setListing)
      .catch(() => setError('No se pudo cargar la publicación.'))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AuthBackground>
    );
  }

  if (!listing) {
    return (
      <AuthBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Mi publicación" showBack onBack={() => navigation.goBack()} rightSlot={<UserMenuButton />} />
          <Text style={styles.error}>{error || 'No encontrado.'}</Text>
        </ScrollView>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="Mi publicación" showBack onBack={() => navigation.goBack()} rightSlot={<UserMenuButton />} />

        <EventCoverImage
          eventImageUrl={listing.eventImageUrl}
          category={listing.category}
          height={160}
          showGlyph={false}
          style={styles.eventCover}
        />

        <EventDetailsPanel
          data={{
            listingId: listing.id,
            eventName: listing.eventName,
            eventDate: listing.eventDate,
            eventPlace: listing.eventPlace,
            sector: listing.sector,
            row: listing.row,
            seat: listing.seat,
            quantityEntries: listing.quantityEntries,
            price: listing.price,
            currency: listing.currency,
            ticketera: listing.ticketera,
            appBoletos: listing.appBoletos,
            orderRef: listing.orderRef,
          }}
        />

        <View style={styles.visibilityBox}>
          <Text style={styles.visibilityText}>
            VISIBILIDAD: {listing.visibility === 'PUBLIC' ? 'Pública (marketplace)' : 'Privada (ID + contraseña)'}
          </Text>
        </View>

        <View style={styles.previewButtons}>
          {listing.captureTicketUrl && (
            <TouchableOpacity style={styles.previewBtn} onPress={() => setImagePreview('qr')}>
              <Text style={styles.previewBtnText}>👁 VISTA PREVIA QR</Text>
            </TouchableOpacity>
          )}
          {listing.captureOwnershipUrl && (
            <TouchableOpacity style={styles.previewBtn} onPress={() => setImagePreview('factura')}>
              <Text style={styles.previewBtnText}>👁 VISTA PREVIA TITULARIDAD O FACTURA</Text>
            </TouchableOpacity>
          )}
        </View>

        {(listing.captureTicketOriginalUrl || listing.captureOwnershipOriginalUrl) ? (
          <View style={styles.originalBlock}>
            <Text style={styles.originalTitle}>Archivo original (solo vos)</Text>
            <Text style={styles.originalHint}>No se comparte con compradores del marketplace.</Text>
            <View style={styles.originalRow}>
              {listing.captureTicketOriginalUrl ? (
                <TouchableOpacity
                  style={styles.originalBtn}
                  onPress={() => {
                    const u = ensureImageUrl(listing.captureTicketOriginalUrl);
                    if (u) void Linking.openURL(u);
                  }}
                >
                  <Text style={styles.originalBtnText}>Abrir original — ticket</Text>
                </TouchableOpacity>
              ) : null}
              {listing.captureOwnershipOriginalUrl ? (
                <TouchableOpacity
                  style={styles.originalBtn}
                  onPress={() => {
                    const u = ensureImageUrl(listing.captureOwnershipOriginalUrl);
                    if (u) void Linking.openURL(u);
                  }}
                >
                  <Text style={styles.originalBtnText}>Abrir original — titularidad</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Publish', { editListingId: listing.id })}
        >
          <Text style={styles.primaryButtonText}>Editar publicación</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={imagePreview !== null} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setImagePreview(null)}>
          <View style={styles.modalInner}>
            {imagePreview === 'qr' && listing.captureTicketUrl && (
              <Image
                source={{ uri: ensureImageUrl(listing.captureTicketUrl)! }}
                style={styles.bigImage}
                resizeMode="contain"
              />
            )}
            {imagePreview === 'factura' && listing.captureOwnershipUrl && (
              <Image
                source={{ uri: ensureImageUrl(listing.captureOwnershipUrl)! }}
                style={styles.bigImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setImagePreview(null)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: stackScreenContent,
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  eventCover: { borderRadius: 14, marginBottom: spacing.md },
  visibilityBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
  },
  visibilityText: { fontSize: 13, color: colors.textMuted },
  previewButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  previewBtn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: radius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  previewBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  originalBlock: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  originalTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  originalHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  originalRow: { gap: spacing.sm },
  originalBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  originalBtnText: { color: colors.text, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  error: { color: '#ef4444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalInner: { width: '100%', alignItems: 'center' },
  bigImage: { width: '100%', height: 400, borderRadius: 12 },
  closeBtn: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: radius,
  },
  closeBtnText: { color: colors.white, fontWeight: '600' },
});
