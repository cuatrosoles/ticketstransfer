/**
 * Paso 2 de Com comprar: vista completa del ticket (formato ticket) tras validar contraseña.
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { ensureImageUrl, api, recordListingInteraction } from '../lib/api';
import { ticketPreviewToMarketplaceItem } from '../lib/ticketPreviewToMarketplaceItem';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { EventDetailsPanel } from '../components/EventDetailsPanel';
import { EventCoverImage } from '../components/EventCoverImage';
import { UserMenuButton } from '../components/UserMenuButton';
import { useFavorites } from '../context/FavoritesContext';
import { colors, spacing, radius, stackScreenContent } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ComprarTicketDetalle'>;
type Route = RouteProp<RootStackParamList, 'ComprarTicketDetalle'>;

type Seller = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  reputationScore?: number | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kyc?: { status: string } | null;
  completedSalesCount?: number | null;
};

type TicketPreview = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  eventImageUrl?: string | null;
  category?: string | null;
  sector?: string | null;
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  tipoEntrada?: string;
  price: number;
  currency: string;
  ticketera?: string;
  appBoletos?: string;
  orderRef?: string | null;
  captureTicketUrl?: string | null;
  captureOwnershipUrl?: string | null;
  showFull?: boolean;
  seller?: Seller;
  availability?: {
    canPurchase: boolean;
    status: string;
    message?: string;
    reservedByCurrentUser?: boolean;
  };
};

function FavoriteHeaderActions({ preview }: { preview: TicketPreview }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  return (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.favHeaderHit}
        onPress={() => toggleFavorite(ticketPreviewToMarketplaceItem(preview))}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isFavorite(preview.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <FontAwesome name={isFavorite(preview.id) ? 'heart' : 'heart-o'} size={22} color="#f472b6" />
      </TouchableOpacity>
      <UserMenuButton />
    </View>
  );
}

export function ComprarTicketDetalleScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { listingId, password } = route.params;
  const [preview, setPreview] = useState<TicketPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<'qr' | 'factura' | null>(null);

  useEffect(() => {
    setError('');
    setLoading(true);
    const q = password ? `?password=${encodeURIComponent(password)}` : '';
    api<TicketPreview>(`/api/tickets/${encodeURIComponent(listingId)}${q}`)
      .then((res) => {
        setPreview(res);
        void recordListingInteraction(listingId, 'VIEW', res.category).catch(() => {});
        if (!res.showFull) setError('Necesitás la contraseña correcta para ver el ticket completo.');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la publicación.'))
      .finally(() => setLoading(false));
  }, [listingId, password]);

  const purchaseBlocked = preview?.availability && !preview.availability.canPurchase;
  const pendingMessage = preview?.availability?.message;

  const handleContinue = () => {
    if (!preview?.showFull) return;
    if (purchaseBlocked) {
      setError(pendingMessage || 'Este ticket está reservado por otro comprador. Volvé en unos minutos.');
      return;
    }
    void recordListingInteraction(preview.id, 'CLICK', preview.category).catch(() => {});
    navigation.navigate('OrderPurchaseDetails', { listingId: preview.id, password: password || '' });
  };

  if (loading) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AuthBackground>
    );
  }

  if (!preview) {
    return (
      <AuthBackground>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <ScreenHeader title="Comprar Ticket" showBack onBack={() => navigation.goBack()} rightSlot={<UserMenuButton />} />
          <Text style={styles.error}>{error || 'Sin datos.'}</Text>
        </ScrollView>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Comprar Ticket"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />
        {error && !preview.showFull ? <Text style={styles.error}>{error}</Text> : null}
        {pendingMessage ? (
          <Text style={[styles.error, purchaseBlocked ? styles.pendingWarn : styles.pendingInfo]}>{pendingMessage}</Text>
        ) : null}

        <EventCoverImage
          eventImageUrl={preview.eventImageUrl}
          category={preview.category}
          height={160}
          showGlyph={false}
          style={styles.eventCover}
        />

        <EventDetailsPanel
          data={{
            listingId: preview.id,
            eventName: preview.eventName,
            eventDate: preview.eventDate,
            eventPlace: preview.eventPlace,
            sector: preview.sector,
            row: preview.row,
            seat: preview.seat,
            quantityEntries: preview.quantityEntries,
            price: preview.price,
            currency: preview.currency,
            ticketera: preview.ticketera,
            appBoletos: preview.appBoletos,
            orderRef: preview.orderRef,
          }}
          showFull={preview.showFull}
        />

        {(preview.captureTicketUrl || preview.captureOwnershipUrl) && preview.showFull && (
      <View style={styles.previewButtons}>
        {preview.captureTicketUrl && (
          <TouchableOpacity style={styles.previewBtn} onPress={() => setImagePreview('qr')}>
            <Text style={styles.previewBtnText}>👁 VISTA PREVIA QR</Text>
          </TouchableOpacity>
        )}
        {preview.captureOwnershipUrl && (
          <TouchableOpacity style={styles.previewBtn} onPress={() => setImagePreview('factura')}>
            <Text style={styles.previewBtnText}>👁 VISTA PREVIA TITULARIDAD O FACTURA</Text>
          </TouchableOpacity>
        )}
      </View>
        )}

        {preview.showFull ? (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, purchaseBlocked && styles.primaryButtonDisabled]}
              onPress={handleContinue}
              disabled={purchaseBlocked}
            >
              <Text style={styles.primaryButtonText}>
                {purchaseBlocked ? 'COMPRA NO DISPONIBLE AHORA' : 'CONTINUAR CON LA COMPRA'}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>

      <Modal visible={imagePreview !== null} transparent animationType="fade">
        <Pressable style={styles.imageModalOverlay} onPress={() => setImagePreview(null)}>
          <View style={styles.imageModalContent}>
            {imagePreview === 'qr' && preview.captureTicketUrl && (
              <Image
                source={{ uri: ensureImageUrl(preview.captureTicketUrl)! }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            {imagePreview === 'factura' && preview.captureOwnershipUrl && (
              <Image
                source={{ uri: ensureImageUrl(preview.captureOwnershipUrl)! }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.closeImageBtn} onPress={() => setImagePreview(null)}>
              <Text style={styles.closeImageBtnText}>Cerrar</Text>
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
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  favHeaderHit: { marginRight: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  eventCover: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: spacing.md,
  },
  previewButtons: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  previewBtn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
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
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  error: { color: '#ef4444', marginTop: spacing.sm },
  pendingWarn: { color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)', padding: 12, borderRadius: 10 },
  pendingInfo: { color: '#93c5fd', backgroundColor: 'rgba(59,130,246,0.15)', padding: 12, borderRadius: 10 },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageModalContent: { width: '100%', maxHeight: '80%', alignItems: 'center' },
  previewImage: { width: '100%', height: 400, borderRadius: 12 },
  closeImageBtn: {
    marginTop: spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: radius,
  },
  closeImageBtnText: { color: colors.white, fontWeight: '600' },
});
