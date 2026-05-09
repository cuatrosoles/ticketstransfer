/**
 * Mis ventas – Lista de órdenes como vendedor + Mis Tickets a la Venta
 * Ubicación: apps/mobile/src/screens/MySalesScreen.tsx
 */

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  InteractionManager,
  ScrollView,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getMySales, getMyListings, type OrderItem, type TicketListingItem } from '../lib/api';
import { formatDate } from '../lib/datetime';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { TicketStubBackground } from '../components/TicketStubBackground';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing } from '../theme';

type Section = {
  title: 'Mis ventas' | 'Mis Tickets a la Venta';
  data: (OrderItem | TicketListingItem)[];
};

/** Pestañas de filtro para ventas (órdenes como vendedor) */
type SalesTabId =
  | 'pendiente_pago'
  | 'pagado'
  | 'cancelado'
  | 'espera_transferencia'
  | 'transferido';

const SALES_TABS: { id: SalesTabId; label: string }[] = [
  { id: 'pendiente_pago', label: 'PENDIENTES DE PAGO' },
  { id: 'pagado', label: 'PAGADOS' },
  { id: 'cancelado', label: 'CANCELADOS' },
  { id: 'espera_transferencia', label: 'EN ESPERA DE TRANSFERENCIA' },
  { id: 'transferido', label: 'TRANSFERIDOS' },
];

/** Punto de color junto al estado (amarillo = pendiente/espera; verde = pagado/transferido; rojo = cancel/disputa). */
function dotTone(status: string) {
  if (
    ['CANCELADA', 'EN_DISPUTA', 'DISPUTA_RESUELTA_COMPRADOR', 'DISPUTA_RESUELTA_VENDEDOR'].includes(status)
  ) {
    return styles.dotDanger;
  }
  if (['PAGADO', 'TRANSFERIDO_VENDEDOR', 'EVIDENCIA_SUBIDA', 'COMPLETADA'].includes(status)) {
    return styles.dotOk;
  }
  return styles.dotWarn;
}

function tabForOrderStatus(status: string): SalesTabId {
  switch (status) {
    case 'PENDIENTE_PAGO':
      return 'pendiente_pago';
    case 'PAGADO':
      return 'pagado';
    case 'CANCELADA':
    case 'EN_DISPUTA':
    case 'DISPUTA_RESUELTA_COMPRADOR':
    case 'DISPUTA_RESUELTA_VENDEDOR':
      return 'cancelado';
    case 'ESPERANDO_TRANSFERENCIA':
    case 'ESPERANDO_CONFIRMACION_COMPRADOR':
    case 'VERIFICANDO':
      return 'espera_transferencia';
    case 'TRANSFERIDO_VENDEDOR':
    case 'EVIDENCIA_SUBIDA':
    case 'COMPLETADA':
      return 'transferido';
    default:
      return 'espera_transferencia';
  }
}

export function MySalesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [listings, setListings] = useState<TicketListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salesTab, setSalesTab] = useState<SalesTabId>('pendiente_pago');

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

  const filteredSales = useMemo(
    () => orders.filter((o) => tabForOrderStatus(o.status) === salesTab),
    [orders, salesTab]
  );

  const tabCounts = useMemo(() => {
    const init: Record<SalesTabId, number> = {
      pendiente_pago: 0,
      pagado: 0,
      cancelado: 0,
      espera_transferencia: 0,
      transferido: 0,
    };
    orders.forEach((o) => {
      init[tabForOrderStatus(o.status)] += 1;
    });
    return init;
  }, [orders]);

  const orderStatusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDIENTE_PAGO: 'Pendiente de pago',
      PAGADO: 'Pagado',
      ESPERANDO_TRANSFERENCIA: 'En espera transferencia (tickets)',
      ESPERANDO_CONFIRMACION_COMPRADOR: 'En espera confirmación del comprador',
      TRANSFERIDO_VENDEDOR: 'Transferido (tickets)',
      EVIDENCIA_SUBIDA: 'Comprador subió captura',
      VERIFICANDO: 'Verificando',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelado',
      EN_DISPUTA: 'En disputa',
      DISPUTA_RESUELTA_COMPRADOR: 'Disputa resuelta (comprador)',
      DISPUTA_RESUELTA_VENDEDOR: 'Disputa resuelta (vendedor)',
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
    { title: 'Mis ventas', data: filteredSales },
    { title: 'Mis Tickets a la Venta', data: listings },
  ];

  const showCancelMotivo = (item: OrderItem) =>
    ['CANCELADA', 'EN_DISPUTA', 'DISPUTA_RESUELTA_COMPRADOR', 'DISPUTA_RESUELTA_VENDEDOR'].includes(item.status);

  const openMotivoAlert = (item: OrderItem) => {
    const headline =
      item.status === 'EN_DISPUTA'
        ? 'Motivo de disputa / revisión'
        : item.status.startsWith('DISPUTA_RESUELTA')
          ? 'Resultado de la disputa'
          : 'Motivo de cancelación';
    const body =
      item.cancelReason ||
      item.cancelNote ||
      'No hay detalle adicional registrado. Podés revisar el historial en soporte si necesitás más información.';
    Alert.alert(headline, body);
  };

  const renderOrderItem = (item: OrderItem) => (
    <TicketStubBackground style={styles.ticketStubWrap} contentStyle={styles.ticketStubContent}>
      <Text style={styles.eventName}>{item.ticketListing.eventName}</Text>
      <View style={styles.metaRow}>
        <View style={[styles.dot, dotTone(item.status)]} />
        <Text style={styles.meta}>
          {item.currency} {item.totalAmount.toLocaleString('es-AR')} · {orderStatusLabel(item.status)}
        </Text>
      </View>
      {item.buyer?.email ? <Text style={styles.buyer}>Comprador: {item.buyer.email}</Text> : null}
      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      <View style={styles.listingActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id, source: 'seller' })}
        >
          <Text style={styles.actionBtnText}>Ver detalles de venta</Text>
        </TouchableOpacity>
        {showCancelMotivo(item) ? (
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnMotivo]} onPress={() => openMotivoAlert(item)}>
            <Text style={styles.actionBtnText}>Ver motivo</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TicketStubBackground>
  );

  const renderListingItem = (item: TicketListingItem) => {
    const isApproved = item.status === 'DISPONIBLE';
    return (
      <TicketStubBackground style={styles.ticketStubWrap} contentStyle={styles.ticketStubContent}>
        <Text style={styles.eventName}>{item.eventName}</Text>
        <Text style={styles.meta}>
          {item.price} {item.currency} · {formatDate(item.eventDate)}
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
    <Text style={[styles.sectionTitle, section.title === 'Mis ventas' && styles.sectionTitleAfterTabs]}>
      {section.title}
    </Text>
  );

  const keyExtractor = (item: OrderItem | TicketListingItem, index: number) =>
    `${item.id}-${index}`;

  const renderSectionFooter = ({ section }: { section: Section }) => {
    if (section.data.length > 0) return null;
    if (section.title === 'Mis ventas') {
      if (orders.length === 0) {
        return <Text style={styles.emptyText}>No tenés ventas.</Text>;
      }
      return (
        <Text style={styles.emptyText}>
          No hay ventas en esta categoría. Elegí otra pestaña arriba.
        </Text>
      );
    }
    return <Text style={styles.emptyText}>No tenés tickets publicados.</Text>;
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
          <View>
            <ScreenHeader
              title="Mis ventas"
              showBack
              onBack={() => navigation.goBack()}
              rightSlot={<UserMenuButton />}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScroll}
              style={styles.tabsBar}
            >
              {SALES_TABS.map((tab) => {
                const count = tabCounts[tab.id];
                const active = salesTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tabChip, active && styles.tabChipActive]}
                    onPress={() => setSalesTab(tab.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tabChipText, active && styles.tabChipTextActive]} numberOfLines={3}>
                      {tab.label}
                      {count > 0 ? ` (${count})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
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
  tabsBar: { marginHorizontal: -spacing.lg, marginBottom: 4 },
  tabsScroll: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tabChip: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    maxWidth: 220,
    minWidth: 136,
    justifyContent: 'center',
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  tabChipText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabChipTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleAfterTabs: { marginTop: spacing.sm },
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
  actionBtnMotivo: {
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.45)',
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  eventName: { fontSize: 16, fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  dotWarn: { backgroundColor: '#ca8a04' },
  dotOk: { backgroundColor: '#16a34a' },
  dotDanger: { backgroundColor: '#ef4444' },
  meta: { fontSize: 14, color: colors.textMuted, flex: 1 },
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
