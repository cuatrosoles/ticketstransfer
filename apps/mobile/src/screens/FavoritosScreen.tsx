/**
 * Favoritos – listings guardados en el dispositivo (AsyncStorage) por cuenta.
 */

import { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { HomeEventCard } from '../components/HomeEventCard';
import { UserMenuButton } from '../components/UserMenuButton';
import { useBranding } from '../context/BrandingContext';
import { useFavorites } from '../context/FavoritesContext';
import type { TabCompositeNavigationProp } from '../navigation/types';
import { formatDateTime } from '../lib/datetime';
import { colors, spacing, tabScreenContent } from '../theme';

type Nav = TabCompositeNavigationProp<'Favoritos'>;

export function FavoritosScreen() {
  const brand = useBranding();
  const navigation = useNavigation<Nav>();
  const { ready, entries, syncFavoritesWithMarketplace, toggleFavorite, isFavorite } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      void syncFavoritesWithMarketplace();
    }, [syncFavoritesWithMarketplace])
  );

  const goDetail = (id: string) => {
    navigation.navigate('ComprarTicketDetalle', { listingId: id, password: '' });
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="Favoritos" rightSlot={<UserMenuButton />} logoUri={brand.logoUrl} />

        {!ready ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={brand.primaryLight} />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome name="heart-o" size={56} color="rgba(148, 163, 184, 0.55)" />
            <Text style={styles.title}>Todavía no tenés favoritos</Text>
            <Text style={styles.sub}>
              Tocá el corazón en Inicio o Tienda para guardar eventos. Se guardan en este teléfono asociados a tu cuenta.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.hint}>
              Tus favoritos se guardan en este dispositivo. Si cambiás de celular, tendrías que volver a marcarlos.
            </Text>
            <View style={styles.list}>
              {entries.map((e) => (
                <View key={e.listingId} style={styles.cell}>
                  <HomeEventCard
                    item={e.cached}
                    variant="featured"
                    formatEventDateTime={formatDateTime}
                    onPress={() => goDetail(e.listingId)}
                    showFavoriteToggle
                    favoriteActive={isFavorite(e.listingId)}
                    onFavoritePress={() => toggleFavorite(e.cached)}
                  />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: tabScreenContent,
  loader: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  list: {},
  cell: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  empty: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
