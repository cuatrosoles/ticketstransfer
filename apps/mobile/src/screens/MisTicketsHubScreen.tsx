/**
 * Hub Mis Tickets – accesos a compras, ventas y publicar (mockup no define interior).
 */

import * as React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { useBranding } from '../context/BrandingContext';
import type { TabCompositeNavigationProp } from '../navigation/types';
import { colors, spacing, radius, glassCard, tabScreenContent } from '../theme';

type Nav = TabCompositeNavigationProp<'MisTickets'>;

export function MisTicketsHubScreen() {
  const navigation = useNavigation<Nav>();
  const brand = useBranding();

  return (
    <AuthBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ScreenHeader title="Mis Tickets" rightSlot={<UserMenuButton />} logoUri={brand.logoUrl} />

        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('MyPurchases')} activeOpacity={0.9}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <FontAwesome name="shopping-cart" size={22} color="#93c5fd" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.cardTitle}>Mis compras</Text>
              <Text style={styles.cardSub}>Órdenes como comprador</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('MySales')} activeOpacity={0.9}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <FontAwesome name="exchange" size={22} color="#93c5fd" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.cardTitle}>Mis ventas</Text>
              <Text style={styles.cardSub}>Órdenes como vendedor</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('Publish', {})} activeOpacity={0.9}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <FontAwesome name="plus-circle" size={22} color="#93c5fd" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.cardTitle}>Publicar ticket</Text>
              <Text style={styles.cardSub}>Vender o intercambiar tu entrada</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, glassCard]} onPress={() => navigation.navigate('ComprarTicket')} activeOpacity={0.9}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <FontAwesome name="search" size={22} color="#93c5fd" />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.cardTitle}>Comprar ticket</Text>
              <Text style={styles.cardSub}>Buscar por ID de publicación</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#64748b" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: tabScreenContent,
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius * 1.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 58, 138, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
