/**
 * Tarjetas adheridas – Agregar tarjetas de débito/crédito, listar y eliminar.
 * La integración con procesador de pagos (Mercado Pago, Stripe) se realiza en el backend.
 */

import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius } from '../theme';

type CardType = 'VISA' | 'MASTER' | 'AMERICAN' | 'OTRA';
type CardItem = { id: string; type: CardType; last4: string; isDebit: boolean };

const CARD_LOGOS: Record<CardType, string> = {
  VISA: '💳',
  MASTER: '💳',
  AMERICAN: '💳',
  OTRA: '💳',
};

export function TarjetasAdheridasScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [adding, setAdding] = useState<'debito' | 'credito' | null>(null);

  const handleAddDebit = () => {
    setAdding('debito');
    Alert.alert(
      'Agregar tarjeta de débito',
      'Esta funcionalidad requiere integración con Mercado Pago o Stripe. Por ahora se agrega una tarjeta de ejemplo.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setAdding(null) },
        {
          text: 'Agregar ejemplo',
          onPress: () => {
            setCards((prev) => [
              ...prev,
              { id: `d-${Date.now()}`, type: 'VISA', last4: '0000', isDebit: true },
            ]);
            setAdding(null);
          },
        },
      ]
    );
  };

  const handleAddCredit = () => {
    setAdding('credito');
    Alert.alert(
      'Agregar tarjeta de crédito',
      'Esta funcionalidad requiere integración con Mercado Pago o Stripe. Por ahora se agrega una tarjeta de ejemplo.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setAdding(null) },
        {
          text: 'Agregar ejemplo',
          onPress: () => {
            setCards((prev) => [
              ...prev,
              { id: `c-${Date.now()}`, type: 'MASTER', last4: '0000', isDebit: false },
            ]);
            setAdding(null);
          },
        },
      ]
    );
  };

  const handleDelete = (card: CardItem) => {
    Alert.alert('Eliminar tarjeta', `¿Eliminar ${card.type} terminada en ${card.last4}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => setCards((prev) => prev.filter((c) => c.id !== card.id)),
      },
    ]);
  };

  const cardLabel = (c: CardItem) => {
    const type = c.type === 'AMERICAN' ? 'AMERICAN' : c.type;
    return `${type} TERMINADA EN ${c.last4}`;
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

        <TouchableOpacity
          style={[styles.addBtn, adding === 'debito' && styles.addBtnDisabled]}
          onPress={handleAddDebit}
          disabled={!!adding}
        >
          {adding === 'debito' ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.addBtnIcon}>+</Text>}
          <Text style={styles.addBtnText}>AGREGAR TARJ. DEBITO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, adding === 'credito' && styles.addBtnDisabled]}
          onPress={handleAddCredit}
          disabled={!!adding}
        >
          {adding === 'credito' ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.addBtnIcon}>+</Text>}
          <Text style={styles.addBtnText}>AGREGAR TARJ. CREDITO</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Tarjetas adheridas</Text>
        {cards.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tenés tarjetas adheridas. Agregá una para realizar pagos.</Text>
          </View>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={styles.cardRow}>
              <Text style={styles.cardIcon}>{CARD_LOGOS[card.type]}</Text>
              <Text style={styles.cardLabel}>{cardLabel(card)}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(card)}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={styles.hint}>
          Para agregar tarjetas reales, configurá la integración con Mercado Pago o Stripe en el backend.
        </Text>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius,
    gap: 10,
  },
  addBtnDisabled: { opacity: 0.7 },
  addBtnIcon: { fontSize: 20, color: colors.white, fontWeight: '700' },
  addBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  empty: { padding: spacing.lg, backgroundColor: 'rgba(30, 58, 138, 0.3)', borderRadius: radius, marginBottom: spacing.md },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    gap: spacing.md,
  },
  cardIcon: { fontSize: 24 },
  cardLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.lg },
});
