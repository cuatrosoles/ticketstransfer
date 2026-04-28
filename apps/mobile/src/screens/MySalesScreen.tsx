/**
 * Mis ventas – Lista de órdenes como vendedor + Mis Tickets a la Venta
 * Ubicación: apps/mobile/src/screens/MySalesScreen.tsx
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getMySales, getMyListings, type OrderItem, type TicketListingItem } from '../lib/api';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing } from '../theme';

type Section = {
  title: 'Mis ventas' | 'Mis Tickets a la Venta';
  data: (OrderItem | TicketListingItem)[];
};

export function MySalesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [listings, setListings] = useState<TicketListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (retryCount = 0) => {
    try {
      const [o, l] = await Promise.all([getMySales(), getMyListings()]);
      setOrders(o);
      setListings(l);
    } catch {
      if (retryCount < 1) {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => load(1), 600);
        });
        return;
      }
      setOrders([]);
      setListings([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const task = InteractionManager.runAfterInteractions(() => {
        load(0);
      });
      return () => task.cancel();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const orderStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDIENTE_PAGO: 'Pendiente de pago',
      ESPERANDO_TRANSFERENCIA: 'En espera transferencia',
      TRANSFERIDO_VENDEDOR: 'Transferido',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      EN_DISPUTA: 'En disputa',
    };
    return map[s] || s;
  };

  const listingStatusLabel = (s: string) => {
    if (s === 'DISPONIBLE') return 'Aprobado';
    if (s === 'PENDIENTE_VERIFICACION') return 'Pendiente de aprobación';
    if (s === 'RECHAZADO') return 'Rechazado';
    if (s === 'PAUSADO') return 'Pausado';
    return s;
  };

  const handleCopyId = (id: string) => {
    Clipboard.setString(id);
    Alert.alert('Copiado', 'El código del ticket se copió al portapapeles. Podés compartirlo por redes, email, etc.');
  };

  const sections: Section[] = [
    { title: 'Mis ventas', data: orders },
    { title: 'Mis Tickets a la Venta', data: listings },
  ];

  const orderBadgeStyle =
    (status: string) =>
      ({
        PENDIENTE_PAGO: styles.statusPending,
        ESPERANDO_TRANSFERENCIA: styles.statusPending,
        TRANSFERIDO_VENDEDOR: styles.statusApproved,
        PAGADO: styles.statusApproved,
        CANCELADA: styles.statusDanger,
        EN_DISPUTA: styles.statusDanger,
      }[status] || styles.statusPending);

  const renderOrderItem = (item: OrderItem) => (
    <TicketStubBackground style={styles.ticketStubWrap} contentStyle={styles.ticketStubContent}>
      <Text style={styles.eventName}>{item.ticketListing.eventName}</Text>
      <Text style={styles.meta}>
        {item.currency} {item.totalAmount.toLocaleString('es-AR')}
      </Text>
      <View style={styles.statusRow}>
        <Text style={[styles.statusBadge, orderBadgeStyle(item.status)]}>{orderStatusLabel(item.status)}</Text>
      </View>
      {item.buyer?.email ? <Text style={styles.buyer}>Comprador: {item.buyer.email}</Text> : null}
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <View style={styles.listingActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, source: 'seller' })}
        >
          <Text style={styles.actionBtnText}>Ver detalles de venta</Text>
        </TouchableOpacity>
      </View>
    </TicketStubBackground>
  );

  const renderListingItem = (item: TicketListingItem) => {
    const isApproved = item.status === 'DISPONIBLE';
    return (
      <TicketStubBackground style={styles.ticketStubWrap} contentStyle={styles.ticketStubContent}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <Text style={styles.meta}>
          {item.price} {item.currency} · {new Date(item.eventDate).toLocaleDateString()}
        </Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, isApproved ? styles.statusApproved : styles.statusPending]}>
            {listingStatusLabel(item.status)}
          </Text>
        </View>
        <View style={styles.listingActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('MyListingDetail', { listingId: item.id })}
          >
            <Text style={styles.actionBtnText}>Ver ticket</Text>
          </TouchableOpacity>
          {isApproved ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => navigation.navigate('Publish', { editListingId: item.id })}
            >
              <Text style={styles.actionBtnText}>Editar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {isApproved && (
          <View style={styles.idRow}>
            <Text style={styles.idLabel}>Código: </Text>
            <Text style={styles.idValue} selectable>
              {item.id}
            </Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => handleCopyId(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.copyBtnText}>Copiar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TicketStubBackground>
    );
  };

  const renderItem = ({ item, section }: { item: OrderItem | TicketListingItem; section: Section }) => {
    if (section.title === 'Mis ventas') return renderOrderItem(item as OrderItem);
    return renderListingItem(item as TicketListingItem);
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const keyExtractor = (item: OrderItem | TicketListingItem, index: number) =>
    `${item.id}-${index}`;

  const renderSectionFooter = ({ section }: { section: Section }) => {
    if (section.data.length > 0) return null;
    return (
      <Text style={styles.emptyText}>
        {section.title === 'Mis ventas' ? 'No tenés ventas.' : 'No tenés tickets publicados.'}
      </Text>
    );
  };

  if (loading && orders.length === 0 && listings.length === 0) {
    return (
      <AuthBackground>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Cargando…</Text>
        </View>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <SectionList<OrderItem | TicketListingItem, Section>
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <ScreenHeader
            title="Mis ventas"
            showBack
            onBack={() => navigation.goBack()}
            rightSlot={<UserMenuButton />}
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 24, paddingHorizontal: spacing.lg, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  ticketStubWrap: {
    marginBottom: spacing.md,
  },
  ticketStubContent: {
    padding: spacing.lg,
  },
  card: { padding: spacing.lg, marginBottom: 0 },
  listingActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  actionBtn: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: 'rgba(59, 130, 246, 0.35)', borderWidth: 1, borderColor: 'rgba(147, 197, 253, 0.45)' },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  buyer: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  statusRow: { marginTop: 8 },
  statusBadge: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusApproved: { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#16a34a' },
  statusPending: { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#ca8a04' },
  statusDanger: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  idLabel: { fontSize: 13, color: colors.textMuted },
  idValue: { fontSize: 13, fontFamily: 'monospace', color: colors.text, flex: 1 },
  copyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
