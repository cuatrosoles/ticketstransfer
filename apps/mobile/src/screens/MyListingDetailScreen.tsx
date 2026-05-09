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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { getMyListingDetail, ensureImageUrl, type MyListingDetail as Listing } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius } from '../theme';
import { formatDate } from '../lib/datetime';

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

        <TicketStubBackground
          backgroundOrientation="portrait"
          style={styles.ticketWrap}
          contentStyle={styles.ticketInner}
        >
          <Text style={styles.ticketId}>TICKET ID N°: {listing.id}</Text>
          <View style={styles.perforation} />
          <Text style={styles.row}>
            VISIBILIDAD:{' '}
            {listing.visibility === 'PUBLIC' ? 'Pública (marketplace)' : 'Privada (ID + contraseña)'}
          </Text>
          <Text style={styles.row}>EVENTO: {listing.eventName}</Text>
          <Text style={styles.row}>
            FECHA: {formatDate(listing.eventDate)}
          </Text>
          <Text style={styles.row}>LUGAR: {listing.eventPlace || '—'}</Text>
          {listing.sector ? <Text style={styles.row}>SECTOR: {listing.sector}</Text> : null}
          <Text style={styles.row}>CANTIDAD: {listing.quantityEntries || '—'}</Text>
          {listing.seat ? <Text style={styles.row}>BUTACA-ASIENTO: {listing.seat}</Text> : null}
          {listing.row ? <Text style={styles.row}>FILA: {listing.row}</Text> : null}
          <Text style={styles.row}>
            PRECIO: {listing.currency} ${Number(listing.price).toLocaleString('es-AR')}
          </Text>
          {listing.ticketera ? <Text style={styles.row}>TICKETERA: {listing.ticketera}</Text> : null}
          {listing.appBoletos ? <Text style={styles.row}>APP DE BOLETOS: {listing.appBoletos}</Text> : null}
          {listing.orderRef ? <Text style={styles.row}>CODIGO DE ORDEN: {listing.orderRef}</Text> : null}
        </TicketStubBackground>

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
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ticketWrap: { marginBottom: spacing.lg },
  ticketInner: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
    paddingBottom: 148,
    minHeight: 440,
  },
  perforation: {
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.4)',
    marginVertical: spacing.sm,
  },
  ticketId: { fontSize: 12, color: colors.primaryLight, marginBottom: spacing.xs },
  row: { fontSize: 14, color: colors.text, marginBottom: spacing.sm },
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
