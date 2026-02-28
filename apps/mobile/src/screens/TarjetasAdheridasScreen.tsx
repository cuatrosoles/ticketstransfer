/**
 * Tarjetas adheridas – Listar, agregar y eliminar tarjetas (Checkout API).
 * Los pagos pueden hacerse con tarjetas guardadas o con Checkout Pro.
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import {
  getUserCards,
  removeUserCard,
  type CardItem,
} from '../lib/api';
import { colors, spacing, radius, glassCard } from '../theme';

const CARD_BRAND_NAMES: Record<string, string> = {
  visa: 'Visa',
  master: 'Mastercard',
  amex: 'American Express',
  naranja: 'Naranja',
  cabal: 'Cabal',
  debvisa: 'Visa Débito',
  debmaster: 'Mastercard Débito',
};

function getCardLabel(card: CardItem): string {
  const brand = CARD_BRAND_NAMES[card.payment_method?.id] || card.payment_method?.name || 'Tarjeta';
  return `${brand} •••• ${card.last_four_digits}`;
}

export function TarjetasAdheridasScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const { cards: list } = await getUserCards();
      setCards(list);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCards();
    }, [fetchCards])
  );

  const handleAddCard = () => {
    navigation.navigate('CardFormWebView' as never);
  };

  const handleDelete = (card: CardItem) => {
    Alert.alert(
      'Eliminar tarjeta',
      `¿Eliminar ${getCardLabel(card)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(card.id);
            try {
              await removeUserCard(card.id);
              setCards((prev) => prev.filter((c) => c.id !== card.id));
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Tarjetas adheridas"
          showBack
          onBack={() => navigation.goBack()}
          rightSlot={<UserMenuButton />}
        />

        <Text style={styles.intro}>
          Agregá tarjetas para pagar más rápido al comprar tickets. También podés pagar con Mercado Pago al momento de la compra.
        </Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {cards.length === 0 ? (
              <View style={[styles.emptyCard, glassCard]}>
                <Text style={styles.emptyText}>No tenés tarjetas guardadas</Text>
                <Text style={styles.emptyHint}>Agregá una para pagar más rápido</Text>
              </View>
            ) : (
              <View style={styles.cardList}>
                {cards.map((card) => (
                  <View key={card.id} style={[styles.cardItem, glassCard]}>
                    <Text style={styles.cardLabel}>{getCardLabel(card)}</Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(card)}
                      disabled={deletingId === card.id}
                    >
                      {deletingId === card.id ? (
                        <ActivityIndicator size="small" color={colors.textMuted} />
                      ) : (
                        <Text style={styles.deleteBtnText}>Eliminar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={handleAddCard}>
              <Text style={styles.addBtnText}>+ Agregar tarjeta</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  intro: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  emptyHint: { fontSize: 14, color: colors.textMuted },
  cardList: { gap: spacing.md, marginBottom: spacing.lg },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  cardLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  deleteBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  deleteBtnText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },
  addBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius,
    alignItems: 'center',
  },
  addBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
});
